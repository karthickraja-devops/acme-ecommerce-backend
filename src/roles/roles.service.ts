
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RolePermission } from './entities/role-permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async hasPermission(
    roleId: number,
    permissionKey: string,
  ): Promise<boolean> {
    const count = await this.rolePermissionRepository
      .createQueryBuilder('rp')
      .innerJoin('rp.permission', 'permission')
      .where('rp.roleId = :roleId', { roleId })
      .andWhere('permission.permissionKey = :permissionKey', {
        permissionKey,
      })
      .getCount();

    return count > 0;
  }
}
