import { Global, Module } from '@nestjs/common';
import { UserInfoController } from './user-info.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInfo, UserInfoSchema } from './entities/user-info.entity';
import { UserInfoService } from './user-info.service';
import { StoreClientService } from 'src/grpc/services/store-client.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserInfo.name, schema: UserInfoSchema },
    ]),
  ],
  controllers: [UserInfoController],
  providers: [UserInfoService, StoreClientService],
  exports: [MongooseModule],
})
export class UserInfoModule {}
