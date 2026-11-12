
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartsService {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepository: Repository<Cart>,

        @InjectRepository(CartItem)
        private readonly cartItemRepository: Repository<CartItem>,

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    private async getOrCreateCart(userId: number): Promise<Cart> {
        let cart = await this.cartRepository.findOne({
            where: { userId },
        });

        if (!cart) {
            cart = this.cartRepository.create({ userId });
            cart = await this.cartRepository.save(cart);
        }

        return cart;
    }

    async getCart(userId: number) {
        const cart = await this.getOrCreateCart(userId);

        return this.cartRepository.findOne({
            where: { cartId: cart.cartId },
            relations: {
                items: {
                    product: true,
                },
            },
        });
    }

    async addItem(
        userId: number,
        productId: number,
        quantity: number,
        selectedSize: string | null,
    ) {
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new BadRequestException('Quantity must be at least 1');
        }

        const product = await this.productRepository.findOne({
            where: { id: productId, isActive: true },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.stock < quantity) {
            throw new BadRequestException('Insufficient product stock');
        }

        const cart = await this.getOrCreateCart(userId);

        const query = this.cartItemRepository
            .createQueryBuilder('item')
            .where('item.cartId = :cartId', { cartId: cart.cartId })
            .andWhere('item.productId = :productId', { productId });

        if (selectedSize === null) {
            query.andWhere('item.selectedSize IS NULL');
        } else {
            query.andWhere('item.selectedSize = :selectedSize', {
                selectedSize,
            });
        }

        const existingItem = await query.getOne();

        if (existingItem) {
            if (product.stock < existingItem.quantity + quantity) {
                throw new BadRequestException('Insufficient product stock');
            }

            existingItem.quantity += quantity;
            await this.cartItemRepository.save(existingItem);
        } else {
            const item = this.cartItemRepository.create({
                cartId: cart.cartId,
                productId,
                quantity,
                selectedSize,
            });

            await this.cartItemRepository.save(item);
        }

        return this.getCart(userId);
    }

    async updateQuantity(
        userId: number,
        cartItemId: number,
        quantity: number,
    ) {
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new BadRequestException('Quantity must be at least 1');
        }

        const cart = await this.getOrCreateCart(userId);

        const item = await this.cartItemRepository.findOne({
            where: { cartItemId, cartId: cart.cartId },
            relations: {
                product: true,
            },
        });

        if (!item) {
            throw new NotFoundException('Cart item not found');
        }

        if (item.product.stock < quantity) {
            throw new BadRequestException('Insufficient product stock');
        }

        item.quantity = quantity;
        await this.cartItemRepository.save(item);

        return this.getCart(userId);
    }

    async removeItem(userId: number, cartItemId: number) {
        const cart = await this.getOrCreateCart(userId);

        const item = await this.cartItemRepository.findOne({
            where: { cartItemId, cartId: cart.cartId },
        });

        if (!item) {
            throw new NotFoundException('Cart item not found');
        }

        await this.cartItemRepository.remove(item);

        return this.getCart(userId);
    }
}
