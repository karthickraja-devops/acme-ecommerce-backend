
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Request,
    BadRequestException,
} from '@nestjs/common';

import { CartsService } from './carts.service';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { PermissionsGuard } from '../roles/permissions.guard';
import { RequirePermission } from '../roles/require-permission.decorator';

@Controller('cart')
@UseGuards(CognitoAuthGuard)
export class CartsController {
    constructor(private readonly cartsService: CartsService) { }

    @Get()
    @UseGuards(CognitoAuthGuard, PermissionsGuard)
    @RequirePermission('view_cart')
    getCart(@Request() req: any) {
        return this.cartsService.getCart(req.user.userId);
    }
    @Post('items')
    @UseGuards(CognitoAuthGuard, PermissionsGuard)
    @RequirePermission('add_cart_item')
    addItem(
        @Request() req: any,
        @Body()
        body: {
            productId: number;
            quantity?: number;
            selectedSize?: string | null;
        },
    ) {
        if (
            !Number.isInteger(Number(body.productId)) ||
            Number(body.productId) < 1
        ) {
            throw new BadRequestException('A valid productId is required');
        }

        return this.cartsService.addItem(
            req.user.userId,
            Number(body.productId),
            body.quantity ?? 1,
            body.selectedSize ?? null,
        );
    }

    @Patch('items/:id')
    updateQuantity(
        @Request() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { quantity: number },
    ) {
        return this.cartsService.updateQuantity(
            req.user.userId,
            id,
            body.quantity,
        );
    }

    @Delete('items/:id')
    removeItem(
        @Request() req: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.cartsService.removeItem(req.user.userId, id);
    }
}
