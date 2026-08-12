import { IsNotEmpty, IsNumber, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  proPrice?: number;  

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsMongoId()
  category!: string;
}