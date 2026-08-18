import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const CREATOR_FIELDS = 'firstName lastName role';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productModel
      .find()
      .populate('category')
      .populate('createdBy', CREATOR_FIELDS)
      .exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('category')
      .populate('createdBy', CREATOR_FIELDS)
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    const newProduct = new this.productModel({
      ...createProductDto,
      createdBy: userId,
    });
    return newProduct.save();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { returnDocument: 'after' })
      .populate('category')
      .populate('createdBy', CREATOR_FIELDS)
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }
    return updatedProduct;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return { message: 'Product deleted successfully' };
  }
}