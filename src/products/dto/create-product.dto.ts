import { IsNotEmpty, IsNumber, IsString, IsOptional, IsMongoId, Min, } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  proPrice?: number | null;  

  @IsOptional()
  @IsString()
  image?: string | null;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsMongoId()
  category!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}