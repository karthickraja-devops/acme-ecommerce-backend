
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from './roles.service';
import { PERMISSION_KEY } from './require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as { roleId: number } | undefined;

    if (!user) {
      throw new ForbiddenException('User information is missing');
    }

    const allowed = await this.rolesService.hasPermission(
      user.roleId,
      permission,
    );

    if (!allowed) {
      throw new ForbiddenException('You do not have permission');
    }

    return true;
  }
}
