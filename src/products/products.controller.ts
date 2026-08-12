import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto'; // Import ເພີ່ມ
import { UpdateProductDto } from './dto/update-product.dto';

@UseGuards(JwtAuthGuard) // ປ້ອງກັນທຸກ Route ດ້ວຍ JWT
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createProductDto: CreateProductDto) { // ໃຊ້ CreateProductDto
    return this.productsService.create(createProductDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id') // ໃຊ້ @Patch ເໝາະສົມກັບ Partial Update ຫຼາຍກວ່າ @Put
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto, // ໃຊ້ UpdateProductDto
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}