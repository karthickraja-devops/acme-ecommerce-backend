import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly s3Service: S3Service,
  ) {}

  private async formatProduct(product: Product) {
    return {
      ...product,
      imageUrl: await this.s3Service.getImageUrl(product.imageUrl),
    };
  }

  async findAll() {
    const products = await this.productRepository.find({
      where: { isActive: true },
    });

    return Promise.all(
      products.map((product) => this.formatProduct(product)),
    );
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.formatProduct(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.update(id, {
      isActive: false,
    });
  }
}