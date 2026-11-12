
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';

import { RolesService } from './roles.service';
import { PermissionsGuard } from './permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, RolePermission]),
  ],
  providers: [RolesService, PermissionsGuard],
  exports: [RolesService, PermissionsGuard],
})
export class RolesModule {}
