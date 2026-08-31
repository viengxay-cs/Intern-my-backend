import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { CartService } from '../cart/cart.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly cartService: CartService,
  ) {}

  private async generateOrderId(): Promise<string> {
    const count = await this.orderModel.countDocuments();
    return `ORD${String(count + 1).padStart(4, '0')}`;
  }

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.cartService.getCartForCheckout(userId);

    // Re-fetch products fresh (not from the populated cart) so we're
    // validating against the current stock, not a possibly-stale copy.
    const productIds = cart.items.map((i: any) => i.product._id);
    const products = await this.productModel.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    let totalAmount = 0;
    const orderItems = cart.items.map((cartItem: any) => {
      const product = productMap.get(String(cartItem.product._id));
      if (!product) {
        throw new NotFoundException(`Product ${cartItem.product._id} no longer exists`);
      }
      if (product.stock < cartItem.quantity) {
        throw new BadRequestException(
          `Not enough stock for "${product.name}" (have ${product.stock}, need ${cartItem.quantity})`,
        );
      }
      const priceAtPurchase = product.proPrice ?? product.price;
      totalAmount += priceAtPurchase * cartItem.quantity;
      return {
        product: product._id,
        quantity: cartItem.quantity,
        priceAtPurchase,
      };
    });

    // Decrement stock for every item.
    await Promise.all(
      orderItems.map((item) =>
        this.productModel.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } },
        ),
      ),
    );

    const orderId = await this.generateOrderId();
    const order = await this.orderModel.create({
      orderId,
      customer: userId,
      items: orderItems,
      totalAmount,
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
    });

    // Empty the cart now that it's been turned into an order.
    await this.cartService.clearCart(userId);

    return order;
  }

  // Order history for the logged-in user only.
  async findMyOrders(userId: string) {
    return this.orderModel
      .find({ customer: userId })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Admin — every order in the system.
  async findAll() {
    return this.orderModel
      .find()
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Owner or admin can view a single order; nobody else can.
  async findOne(id: string, userId: string, isAdmin: boolean) {
    const order = await this.orderModel
      .findById(id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name image')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const customerId =
    typeof order.customer === 'object' && order.customer !== null
      ? String((order.customer as any)._id)
      : String(order.customer);

   if (!isAdmin && customerId !== userId) {
    throw new ForbiddenException('This is not your order');
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.status = dto.status;
    await order.save();
    return order;
  }

  // Owner cancels their own pending order; stock is restored.
  async cancel(id: string, userId: string) {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (String(order.customer) !== userId) {
      throw new ForbiddenException('This is not your order');
    }
    if (order.status !== 'pending') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    await Promise.all(
      order.items.map((item) =>
        this.productModel.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
        ),
      ),
    );

    order.status = 'cancelled';
    await order.save();
    return order;
  }
}
