import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema'; // ກວດເບິ່ງ Path Schema ໃຫ້ຖືກຕ້ອງຕາມ Structure ຂອງ Project
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto'; // Import ເຂົ້າມາ

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  // 1. ດຶງຂໍ້ມູນ Product ທັງໝົດ (ພ້ອມ Populate ດຶງຂໍ້ມູນ Category ມາສະແດງ)
  async findAll(): Promise<Product[]> {
    return this.productModel.find().populate('category').exec();
  }

  // 2. ດຶງຂໍ້ມູນ Product ຕາມ ID
  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('category').exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // 3. ເພີ່ມ Product ໃໝ່ລົງ Database
  async create(createProductDto: any): Promise<Product> {
    const newProduct = new this.productModel(createProductDto);
    return newProduct.save();
  }

  // 4. ແກ້ໄຂ/ອັບເດດ Product ຕາມ ID
  async update(id: string, updateProductDto: any): Promise<Product> {
  const updatedProduct = await this.productModel
    .findByIdAndUpdate(id, updateProductDto, { returnDocument: 'after' })
    .populate('category')
    .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }
    return updatedProduct;
  }

  // 5. ລຶບ Product ຕາມ ID
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return { message: 'Product deleted successfully' };
  }
  
}