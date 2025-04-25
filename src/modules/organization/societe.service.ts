import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Society } from './entities/societe.entity';
import { CreateBusinessDto } from './dto/create-societe.dto';
import { UpdateBusinessDto } from './dto/update-societe.dto';
import { ResponseI18nService } from 'src/helpers/translate/server-response/response-i18n.service';
import { PageOptionsDto } from 'src/helpers/pagination/page-options-dto/page-options-dto';

@Injectable()
export class SocietyService {
  private readonly logger = new Logger(SocietyService.name);

  constructor(
    @InjectModel(Society.name) private readonly societyModel: Model<Society>,
    private readonly responseI18nService: ResponseI18nService,
  ) {}

  async create(createBusinessDto: CreateBusinessDto) {
    try {
      const created = await this.societyModel.create(createBusinessDto);
      return this.responseI18nService.create(created, 'SOCIETY');
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto) {
    const { take, skip, order, search } = pageOptionsDto;

    try {
      const filter: any = {};
      if (search) {
        filter.nif = { $regex: search, $options: 'i' };
        filter.rc = { $regex: search, $options: 'i' };
        filter.phone = { $regex: search, $options: 'i' };
        filter.email = { $regex: search, $options: 'i' };
      }

      const results = await this.societyModel
        .find(filter)
        .sort({ createdAt: order === 'DESC' ? -1 : 1 })
        .skip(skip)
        .limit(take)
        .lean()
        .exec();

      const itemCount = await this.societyModel.countDocuments(filter);

      return this.responseI18nService.fetchWithPagination(
        results,
        itemCount,
        pageOptionsDto,
        'SOCIETY',
      );
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async findTva() {
    try {
      const results = await this.societyModel.find().exec();
      return this.responseI18nService.success(results, 'SOCIETY');
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      const fournisseur = await this.societyModel.findById(id).exec();
      if (!fournisseur) {
        return this.responseI18nService.notFound('SOCIETY');
      }
      return this.responseI18nService.success(fournisseur, 'SOCIETY');
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    try {
      const updatedFournisseur = await this.societyModel
        .findByIdAndUpdate(id, updateBusinessDto, { new: true })
        .exec();
      if (!updatedFournisseur) {
        return this.responseI18nService.notFound('SOCIETY');
      }
      return this.responseI18nService.update(updatedFournisseur, 'SOCIETY');
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      const deletedFournisseur = await this.societyModel.findByIdAndDelete(id);
      if (!deletedFournisseur) {
        return this.responseI18nService.notFound('SOCIETY');
      }
      return this.responseI18nService.delete(deletedFournisseur, 'SOCIETY');
    } catch (error) {
      this.logger.error(error);
      throw this.responseI18nService.handleError(error);
    }
  }
}
