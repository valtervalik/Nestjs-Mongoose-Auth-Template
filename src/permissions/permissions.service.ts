import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { Permission, PermissionDocument } from './schemas/permission.schema';

@Injectable()
export class PermissionsService extends BaseService<PermissionDocument>(
  Permission.name,
) {}
