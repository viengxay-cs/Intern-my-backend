// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    // ລຶບ ຫຼື ເພີ່ມບັນທັດນີ້ໃສ່
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export ອອກໄປໃຫ້ AuthModule ໃຊ້ງານ
})
export class UsersModule {}