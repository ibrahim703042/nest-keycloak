import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateFiscalYearDto } from './dto/create-fiscal-year.dto';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { FiscalYear } from './entities/fiscal-year.entity';
import {
  UpdateFiscalYearDto,
  UpdateFiscalYearStatusDto,
} from './dto/update-fiscal-year.dto';
import { StatusType } from 'src/utils/enum/enumerations.enum';
import { Request } from 'express';
import { AppHelperService } from 'src/helpers/app.helper.service';
import {
  FiscalYearRequest,
  FiscalYearResponse,
  IsDateWithinFiscalYearRequest,
  IsDateWithinFiscalYearResponse,
} from 'src/grpc/proto/generated/fiscal-year';
import {
  parseISO,
  isWithinInterval,
  isValid,
  isEqual,
  isSameDay,
} from 'date-fns';

@Injectable()
export class FiscalYearService implements OnModuleInit {
  private readonly logger = new Logger(FiscalYearService.name);

  constructor(
    @InjectModel(FiscalYear.name)
    private readonly fiscalYearModel: Model<FiscalYear>,
    private readonly responseI18nService: ResponseI18nService,
    private readonly appHelperService: AppHelperService,
  ) {}

  async onModuleInit() {
    await this.initializeFiscalYear();
    this.logger.log('onModuleInit called: Checking Fiscal Year...');
  }

  async initializeFiscalYear() {
    this.logger.log('Initializing fiscal year service...');
    try {
      const count = await this.fiscalYearModel.countDocuments();

      this.logger.debug(`Number of fiscal year records: ${count}`);

      if (count === 0) {
        const now = new Date();
        const currentYear = now.getFullYear();
        // const startDate = new Date(currentYear, now.getMonth(), now.getDate());
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);

        await this.fiscalYearModel.create({
          designation: `Fiscal Year ${currentYear}`,
          startDate,
          endDate,
          status: StatusType.ACTIVE,
        });

        this.logger.log(`Default fiscal year ${currentYear} created.`);
      } else {
        this.logger.log('Fiscal year already exists. Skipping creation.');
      }
    } catch (error) {
      this.logger.error('Error initializing fiscal year:', error);
    }
  }

  async create(dto: CreateFiscalYearDto) {
    try {
      const currentDate = new Date();
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (startDate < currentDate && !isSameDay(startDate, currentDate)) {
        return this.responseI18nService.badRequest(
          'EXERCISE.FUTURE_DATE_REQUIRED',
        );
      }

      // End date must be equal to or after start date
      if (endDate <= startDate) {
        return this.responseI18nService.badRequest(
          'EXERCISE.END_DATE_MUST_BE_AFTER_START',
        );
      }

      const overlappingFiscalYear = await this.fiscalYearModel.findOne({
        $or: [
          { startDate: { $lte: dto.endDate, $gte: dto.startDate } },
          { endDate: { $gte: dto.startDate, $lte: dto.endDate } },
          {
            $and: [
              { startDate: { $lte: dto.startDate } },
              { endDate: { $gte: dto.endDate } },
            ],
          },
        ],
      });

      if (overlappingFiscalYear) {
        return this.responseI18nService.badRequest(
          'EXERCISE.FISCAL_YEAR_OVERLAP',
        );
      }

      const existingActiveFiscalYear = await this.fiscalYearModel.findOne({
        status: StatusType.ACTIVE,
      });

      const newFiscalYearStatus = existingActiveFiscalYear
        ? StatusType.UPCOMING_YEAR
        : StatusType.ACTIVE;

      const createdFiscalYear = await this.fiscalYearModel.create({
        ...dto,
        status: newFiscalYearStatus,
      });

      return this.responseI18nService.create(createdFiscalYear, 'FISCAL_YEAR');
    } catch (error) {
      this.logger.error(error);
      console.log('error', error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<any> {
    const { take, skip, order, search } = pageOptionsDto;

    try {
      const filter: any = {};
      if (search) {
        filter.name = { $regex: search, $options: 'i' };
      }

      const results = await this.fiscalYearModel
        .find(filter)
        .sort({ createdAt: order === 'DESC' ? -1 : 1 })
        .skip(skip)
        .limit(take)
        .lean()
        .exec();

      const itemCount = await this.fiscalYearModel.countDocuments(filter);

      return this.responseI18nService.fetchWithPagination(
        results,
        itemCount,
        pageOptionsDto,
        'FISCAL_YEAR',
      );
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      const fiscalYear = await this.fiscalYearModel.findById(id).exec();
      if (!fiscalYear) {
        return this.responseI18nService.notFound('FISCAL_YEAR');
      }
      return this.responseI18nService.success(fiscalYear, 'FISCAL_YEAR');
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async closeFiscalYear(
    id: string,
    dto: UpdateFiscalYearStatusDto,
    req: Request,
  ): Promise<FiscalYear | any> {
    try {
      const userId = this.appHelperService.extractUserIdFromToken(req);

      const fiscalYear = await this.fiscalYearModel.findById(id);

      if (!fiscalYear) {
        return this.responseI18nService.notFound('FISCAL_YEAR');
      }

      if (fiscalYear.status === StatusType.CLOSED) {
        return this.responseI18nService.badRequest(
          'EXERCISE.FISCAL_YEAR_ALREADY_CLOSED',
        );
      }

      // Ensure there's a newer fiscal year before closing this one
      const activeFiscalYear = await this.fiscalYearModel.findOne({
        status: StatusType.ACTIVE,
        startDate: { $gt: fiscalYear.startDate },
      });

      if (!activeFiscalYear) {
        return this.responseI18nService.badRequest(
          'EXERCISE.NO_ACTIVE_FISCAL_YEAR_FOUND',
        );
      }

      // Update the fiscal year status and set the closed timestamp
      fiscalYear.status = StatusType.CLOSED;
      fiscalYear.closedAt = new Date();
      fiscalYear.closedBy = userId;

      this.logger.log(
        `Fiscal Year ${fiscalYear.designation} closed by user ${userId}`,
      );

      await fiscalYear.save();
      return this.responseI18nService.success(fiscalYear, 'FISCAL_YEAR');
    } catch (error) {
      this.logger.error(`Error closing fiscal year: ${error.message}`);
      throw this.responseI18nService.handleError(error);
    }
  }

  async update(id: string, updateFiscalYearDto: UpdateFiscalYearDto) {
    try {
      const updatedFiscalYear = await this.fiscalYearModel
        .findByIdAndUpdate(id, updateFiscalYearDto, { new: true })
        .exec();
      if (!updatedFiscalYear) {
        return this.responseI18nService.notFound('FISCAL_YEAR');
      }
      return this.responseI18nService.update(updatedFiscalYear, 'FISCAL_YEAR');
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      const deletedFiscalYear = await this.fiscalYearModel
        .findByIdAndDelete(id)
        .exec();
      if (!deletedFiscalYear) {
        return this.responseI18nService.notFound('FISCAL_YEAR');
      }
      return this.responseI18nService.delete(deletedFiscalYear, 'FISCAL_YEAR');
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  // FOR GRPC
  async getFiscalYear(
    request: FiscalYearRequest,
  ): Promise<FiscalYearResponse | {}> {
    const fiscalYear = await this.fiscalYearModel.findById(request.id).exec();
    if (!fiscalYear) {
      return {};
    }
    return {
      id: fiscalYear._id.toString(),
      designation: fiscalYear.designation,
      startDate: fiscalYear.startDate.toISOString(),
      endDate: fiscalYear.endDate.toISOString(),
    };
  }

  async isDateWithinFiscalYear(
    request: IsDateWithinFiscalYearRequest,
  ): Promise<IsDateWithinFiscalYearResponse> {
    const fiscalYear = await this.fiscalYearModel.findById(request.id).exec();

    if (!fiscalYear) {
      throw new NotFoundException('Fiscal year not found');
    }

    const checkDate = parseISO(request.date);
    if (!isValid(checkDate)) {
      throw new BadRequestException('Invalid date provided');
    }

    const isWithin =
      isEqual(checkDate, fiscalYear.startDate) ||
      isEqual(checkDate, fiscalYear.endDate) ||
      isWithinInterval(checkDate, {
        start: fiscalYear.startDate,
        end: fiscalYear.endDate,
      });

    return { isWithin: isWithin };
  }
}
