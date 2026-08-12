import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email!: string; // ໃສ່ ! ຫຼັງ email

  @Prop({ required: true })
  password!: string; // ໃສ່ ! ຫຼັງ password

  @Prop({ default: 'user' })
  role!: string; // ໃສ່ ! ຫຼັງ role
}

export const UserSchema = SchemaFactory.createForClass(User);