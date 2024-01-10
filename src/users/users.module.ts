import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKey, ApiKeySchema } from 'src/api-keys/schemas/api-key.schema';
import { HashingModule } from 'src/hashing/hashing.module';
import { HashingService } from 'src/hashing/hashing.service';
import {
  Permission,
  PermissionSchema,
} from 'src/permissions/schemas/permission.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import { User, UserDocument, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: (hashingService: HashingService) => {
          const schema = UserSchema;

          schema.pre<UserDocument>('save', async function () {
            const doc = this;
            if (doc) {
              doc.password = await hashingService.hash(doc.password);
            }
          });
          return schema;
        },
        imports: [HashingModule],
        inject: [HashingService],
      },
      { name: Role.name, useFactory: () => RoleSchema },
      { name: Permission.name, useFactory: () => PermissionSchema },
      { name: ApiKey.name, useFactory: () => ApiKeySchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [MongooseModule],
})
export class UsersModule {}
