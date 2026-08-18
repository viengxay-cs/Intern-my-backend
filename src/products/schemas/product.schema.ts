import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: false })
  proPrice?: number;

  @Prop({ required: false })
  image?: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);