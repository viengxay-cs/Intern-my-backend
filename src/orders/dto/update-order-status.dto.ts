import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsIn(['pending', 'confirmed', 'shipped', 'completed', 'cancelled'])
  status!: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
}
