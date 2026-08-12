import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  // 1. Method ສຳລັບເພີ່ມ Category ໃໝ່
  async create(createCategoryDto: any): Promise<Category> {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  // 2. Method ສຳລັບດຶງ Category ທັງໝົດ
  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  // 3. Method ສຳລັບແກ້ໄຂ Category ຕາມ ID
  async update(id: string, updateCategoryDto: any): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { returnDocument: 'after' })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }
    return updatedCategory;
  }

  // 4. Method ສຳລັບລຶບ Category ຕາມ ID
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'Category deleted successfully' };
  }
}