import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Society extends Document {
  @Prop({ type: String, required: true })
  businessName: string;

  @Prop({ type: String, required: true })
  primaryAddress: string;

  @Prop({ type: String, required: false })
  secondaryAddress: string;

  @Prop({ type: String, required: false })
  postalCode: string;

  @Prop({ type: String, required: false })
  city: string;

  @Prop({ required: true, type: String })
  country: string;

  @Prop({ type: String, required: true, unique: true })
  nif: string; // Tax Identification Number

  @Prop({ type: String, required: true, unique: true })
  rc: string; // Registre de Commerce

  @Prop({ type: String, required: true, unique: true })
  phone: string;

  @Prop({ type: String, unique: true })
  website: string;

  @Prop({ type: String, required: false })
  fax: string;

  @Prop({ type: Boolean, required: false, default: false })
  reseller: boolean;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String })
  invoiceFooter: string;
}

export const SocietySchema = SchemaFactory.createForClass(Society);
