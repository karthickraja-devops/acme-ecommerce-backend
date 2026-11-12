
import {
    Controller,
    Get,
    Delete,
    Param,
    ParseIntPipe,
} from '@nestjs/common';

import { ProductsService } from './products.service';
import { UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { PermissionsGuard } from '../roles/permissions.guard';
import { RequirePermission } from '../roles/require-permission.decorator';


@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // GET /products
    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    // GET /products/1
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    // DELETE /products/1
    @Delete(':id')
    @UseGuards(CognitoAuthGuard, PermissionsGuard)
    @RequirePermission('delete_products')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}
