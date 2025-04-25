import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { StatusType } from 'src/utils/enum/enumerations.enum';

@Schema({ timestamps: true, versionKey: false })
export class FiscalYear extends Document {
  @Prop({ type: String, required: true, unique: true })
  designation: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ default: 'active', enum: StatusType })
  status: string;

  @Prop({ required: false, type: Date })
  closedAt: Date;

  @Prop({ type: String, required: false })
  closedBy: string;
}

export const FiscalYearSchema = SchemaFactory.createForClass(FiscalYear);
