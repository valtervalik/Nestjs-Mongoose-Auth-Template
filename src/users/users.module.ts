import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ApiKey, ApiKeySchema } from './api-keys/schemas/api-key.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import {
  Permission,
  PermissionSchema,
} from 'src/permissions/schemas/permission.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ApiKey.name, schema: ApiKeySchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
