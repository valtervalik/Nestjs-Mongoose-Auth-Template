import { Permission } from 'src/permissions/schemas/permission.schema';
import { Role } from 'src/roles/schemas/role.schema';

export interface ActiveUserData {
  sub: string;

  email: string;

  role: Role;

  permission: Permission;
}
