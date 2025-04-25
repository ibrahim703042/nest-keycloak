import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GenderType } from 'src/utils/enum/enumerations.enum';

@Schema({ timestamps: true, versionKey: false })
export class UserInfo extends Document {
  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: false, default: '' })
  phone?: string;

  @Prop({ type: Number, required: true })
  age: number;

  @Prop({ type: String, required: true, enum: GenderType })
  gender: GenderType;

  @Prop({ type: Object, required: true })
  userInfo: any;

  @Prop({ type: [Types.ObjectId], required: true })
  store: Types.ObjectId[];

  @Prop({ type: String, required: false, default: '' })
  updatedBy?: string;
}

export const UserInfoSchema = SchemaFactory.createForClass(UserInfo);
