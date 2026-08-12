// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://tubxai0960_db_user:tubxai-7713mg@cluster0.f5ersar.mongodb.net/?appName=Cluster0'), // ປ່ຽນ URI ຕາມ DB ຂອງທ່ານ
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
  ],
})
export class AppModule {}

