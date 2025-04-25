/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { LookupOptions } from './lookupOptions.interface';

@Injectable()
export class PipelineService {
  constructor() {} // @InjectModel(Entity.name) private readonly entityModel: Model<Entity>,

  private lookupStage(options: LookupOptions, from: string) {
    return {
      $lookup: {
        from,
        localField: options.localField,
        foreignField: options.foreignField,
        as: options.as,
      },
    };
  }

  private unwindStage(as: string, preserve: boolean = false) {
    return {
      $unwind: {
        path: `$${as}`,
        preserveNullAndEmptyArrays: preserve,
      },
    };
  }

  private generatePipeline(model: Model<any>, options: LookupOptions) {
    const preserve = options.preserve ?? false;
    return [
      this.lookupStage(options, model.collection.name),
      this.unwindStage(options.as, preserve),
    ];
  }

  // Methods for specific models
  entities(options: LookupOptions) {
    // return this.generatePipeline(this.entityModel, options);
  }
}
