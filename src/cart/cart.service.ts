import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './schemas/cart.schema';
import { Product } from '../products/schemas/product.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  // Every user has exactly one cart. Create it lazily the first time
  // they touch the cart, instead of at signup.
  private async getOrCreateCart(userId: string) {
    let cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [] });
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.populate(cart);
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const product = await this.productModel.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cart = await this.getOrCreateCart(userId);
    const existing = cart.items.find((i) => String(i.product) === dto.productId);

    if (existing) {
      existing.quantity += dto.quantity;
    } else {
      cart.items.push({ product: product._id, quantity: dto.quantity } as any);
    }

    await cart.save();
    return this.populate(cart);
  }

  async updateItem(userId: string, productId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => String(i.product) === productId);
    if (!item) {
      throw new NotFoundException('Item not in cart');
    }
    item.quantity = dto.quantity;
    await cart.save();
    return this.populate(cart);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId);
    cart.items = cart.items.filter((i) => String(i.product) !== productId) as any;
    await cart.save();
    return this.populate(cart);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    cart.items = [] as any;
    await cart.save();
    return this.populate(cart);
  }

  // Internal helper used by OrdersService during checkout — validates
  // stock and returns the populated cart, without saving anything.
  async getCartForCheckout(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const populated = await this.populate(cart);
    if (populated.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    return populated;
  }

  private populate(cart: Cart) {
    return cart.populate('items.product');
  }
}
