import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'cancelled';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  // Price at the moment of checkout, so the order total stays correct
  // even if the product's price changes later.
  @Prop({ required: true })
  priceAtPurchase!: number;
}

@Schema({ timestamps: true })
export class Order extends Document {
  // Human-readable code, e.g. "ORD0001". Auto-generated at checkout.
  @Prop({ required: true, unique: true })
  orderId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customer!: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items!: OrderItem[];

  @Prop({ required: true })
  totalAmount!: number;

  @Prop({
    required: true,
    enum: ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'],
    default: 'pending',
  })
  status!: OrderStatus;

  @Prop({ required: false })
  shippingAddress?: string;

  @Prop({ required: false })
  paymentMethod?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
