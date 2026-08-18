import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';

const CREATOR_FIELDS = 'firstName lastName role';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: any, userId: string): Promise<Category> {
    const createdCategory = new this.categoryModel({
      ...createCategoryDto,
      createdBy: userId,
    });
    return createdCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().populate('createdBy', CREATOR_FIELDS).exec();
  }

  async update(id: string, updateCategoryDto: any): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { returnDocument: 'after' })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }
    return updatedCategory;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'Category deleted successfully' };
  }
}