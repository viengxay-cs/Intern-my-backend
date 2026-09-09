// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // ປັບໃຫ້ຮັບ Parameter ເປັນ Object (createUserDto: any)
  async create(createUserDto: any): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  // Method ສຳລັບຄົ້ນຫາ Email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async updateProfileImage(userId: string, imagePath: string): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { profileImage: imagePath }, { returnDocument: 'after' })
      .exec();
  }
  
}