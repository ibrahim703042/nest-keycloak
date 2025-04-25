import { Injectable, Logger } from '@nestjs/common';
import {
  CreateUserInfoDto,
  UpdateKcUserInfoDto,
} from './dto/create-user-info.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';
import { GenderType } from 'src/utils/enum/enumerations.enum';
import { AppHelperService } from 'src/helpers/app.helper.service';
import { UserInfo } from './entities/user-info.entity';
import { UserService } from 'src/modules/keycloak/user/services/user.service';
import { GroupUserMappingService } from 'src/modules/keycloak/user/services/group-user-mapping.service';
import { Request } from 'express';
import { StoreClientService } from 'src/grpc/services/store-client.service';
import { StoreListResponse } from 'src/grpc/proto/generated/store';

@Injectable()
export class UserInfoService {
  private readonly logger = new Logger(UserInfoService.name);

  constructor(
    @InjectModel(UserInfo.name) private userModel: Model<UserInfo>,
    private readonly responseI18nService: ResponseI18nService,
    private readonly keycloakService: UserService,
    private readonly groupMappingService: GroupUserMappingService,
    private readonly storeService: StoreClientService,
    private readonly appHelperService: AppHelperService,
  ) {}

  async create(userDto: CreateUserInfoDto): Promise<UserInfo | any> {
    try {
      // Validate password length
      if (userDto.userInfo.password.length !== 6) {
        // return this.responseI18nService.badRequest('PASSWORD_LENGTH');
      }

      // const { groupNames, ...user }: any = userDto.userInfo
      // Create user in Keycloak
      const keycloakResponse = await this.keycloakService.create(
        userDto.userInfo,
      );

      if (!keycloakResponse?.data?.length) {
        this.logger.error('Keycloak response is invalid.');
        throw new Error('Keycloak response is invalid.');
      }

      const keycloakID = keycloakResponse.data[0]?.id;

      if (!keycloakID) {
        this.logger.error('Keycloak ID is missing.');
        throw new Error('Keycloak ID is missing.');
      }

      // Validate gender
      if (
        !userDto.gender ||
        !Object.values(GenderType).includes(userDto.gender)
      ) {
        throw new Error('Invalid or missing gender field.');
      }

      // Exclude sensitive fields & add avatar inside `userInfo`
      const { password, username, ...filteredUserInfo } = userDto.userInfo;

      const kc_user = {
        ...filteredUserInfo,
        id: keycloakID,
        avatar:
          userDto.gender === GenderType.FEMALE
            ? 'woman-user-circle.png'
            : 'man-user-circle.png',
      };

      const updateDto = {
        ...userDto,
        userInfo: kc_user,
      };

      // Create user in the system
      const userData = await this.userModel.create(updateDto);

      // format user data
      const data = await this.populateUserInfo(userData.toObject());

      return this.responseI18nService.create(data, 'USER');
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<any> {
    const { take, skip, order, search } = pageOptionsDto;

    try {
      const filter: any = {};
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const results = await this.userModel
        .find(filter)
        .sort({ createdAt: order === 'DESC' ? -1 : 1 })
        .skip(skip)
        .limit(take)
        .lean()
        .exec();

      // format user data
      const response = await this.populateMultipleUsers(results as UserInfo[]);

      const itemCount = await this.userModel.countDocuments(filter);
      return this.responseI18nService.fetchWithPagination(
        response,
        itemCount,
        pageOptionsDto,
        'USER',
      );
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
      // throw error;
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const user = await this.userModel.findById(id).lean().exec();
      console.log('User Data :', user);

      if (!user) {
        return this.responseI18nService.notFound('USER');
      }

      const data = await this.populateUserInfo(user as UserInfo);
      return this.responseI18nService.success(data, 'USER');
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async findByUserInfo(req: Request): Promise<any> {
    try {
      const userId = this.appHelperService.extractUserIdFromToken(req);
      const user = await this.userModel
        .findOne({ 'userInfo.id': userId })
        .lean()
        .exec();
      console.log('User Data :', user);

      if (!user) {
        return this.responseI18nService.notFound('USER');
      }

      const data = await this.populateUserInfo(user as UserInfo);
      return this.responseI18nService.success(data, 'USER');
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async update(id: string, updateUserDto: UpdateKcUserInfoDto) {
    try {
      const existingUser = await this.userModel.findById(id);
      if (!existingUser) {
        this.logger.warn(`User with ID ${id} not found.`);
        return this.responseI18nService.notFound('USER');
      }

      // Update user in Keycloak
      if (existingUser.userInfo?.id) {
        try {
          await this.keycloakService.updateUser(
            existingUser.userInfo.id,
            updateUserDto.userInfo,
          );
        } catch (error) {
          this.logger.error(
            `Failed to update Keycloak user: ${error.message}`,
            error.stack,
          );
          throw this.responseI18nService.handleError(error);
        }
      }

      // Update user in the local database
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true },
      );

      if (!updatedUser) {
        this.logger.warn(`Failed to update local user: ID ${id}`);
        return this.responseI18nService.notFound('USER');
      }

      // format user data
      const data = await this.populateUserInfo(updatedUser.toObject());

      return this.responseI18nService.update(data, 'USER');
    } catch (error) {
      this.logger.error(
        `Error occurred during user update: ${error.message}`,
        error.stack,
      );
      throw this.responseI18nService.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      const existingUser = await this.userModel.findById(id);
      if (!existingUser) {
        this.logger.warn(`User with ID ${id} not found.`);
        return this.responseI18nService.notFound('USER');
      }

      // Validate that user exists
      if (!existingUser?.userInfo) {
        return this.responseI18nService.notFound('USER');
      }

      // Extract email for Keycloak lookup
      const userEmail = existingUser.userInfo.email;
      if (!userEmail) {
        return this.responseI18nService.notFound('USER');
      }

      // Fetch the Keycloak user by email
      const keycloakUsers =
        await this.keycloakService.findUserByEmail(userEmail);

      console.log('Keycloak User Data :', keycloakUsers);
      // Validate that the Keycloak user exists
      if (!keycloakUsers || keycloakUsers.length === 0) {
        return this.responseI18nService.notFound('USER');
      }

      const keycloakUserId = keycloakUsers[0].id;

      // Delete user in Keycloak first
      const keycloakDeletion =
        await this.keycloakService.remove(keycloakUserId);
      if (!keycloakDeletion) {
        return this.responseI18nService.badRequest(
          'GENERAL.ERROR.KEYCLOAK_DELETE',
          'USER',
        );
      }

      // Delete the user in the local database
      const deletedUser = await this.userModel.findByIdAndDelete(id);

      if (!deletedUser) {
        return this.responseI18nService.notFound('USER');
      }

      return this.responseI18nService.delete(deletedUser, 'USER');
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`, error.stack);
      throw this.responseI18nService.handleError(error);
    }
  }

  async populateUserInfo(user: UserInfo): Promise<UserInfo> {
    if (!user?.userInfo) {
      return user;
    }

    if (!user.store || user.store.length === 0) {
      return user;
    }

    try {
      let keycloakUser;
      let store: StoreListResponse;

      // Convert ObjectId[] to string[] before passing it to requestIdsStores
      const storeIds = user.store.map((id) => id.toString());

      if (storeIds.length > 0) {
        // store = await this.storeService.getStores(storeIds);
      }

      if (user.userInfo.id) {
        keycloakUser = await this.groupMappingService.findGroupByUserId(
          user.userInfo.id,
        );
      }

      return Object.assign(user, {
        userInfo: {
          ...keycloakUser?.data,
          avatar: this.appHelperService.formatAvatar(
            user.userInfo.avatar || '',
          ),
        },
        store: store.stores,
      });
    } catch (error) {
      console.error(`Failed to fetch Keycloak user: ${error.message}`);
      return new this.userModel({ ...user.toObject(), userInfo: {} });
    }
  }

  async populateMultipleUsers(users: UserInfo[]): Promise<UserInfo[]> {
    const results = await Promise.allSettled(
      users.map((user) => this.populateUserInfo(user)),
    );

    return results
      .filter((result) => result.status === 'fulfilled' && result.value)
      .map((result) => (result as PromiseFulfilledResult<any>).value);
  }
}
