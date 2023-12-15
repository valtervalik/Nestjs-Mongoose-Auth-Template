import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import {
  Permission,
  PermissionSchema,
} from 'src/permissions/schemas/permission.schema';
import { PermissionsService } from 'src/permissions/permissions.service';
import {
  ApiKey,
  ApiKeySchema,
} from 'src/users/api-keys/schemas/api-key.schema';
import { AuthGuard } from './authentication/guards/auth.guard';
import { RolesGuard } from './authorization/guards/roles.guard';
import { PermissionsGuard } from './authorization/guards/permissions.guard';
import { PoliciesGuard } from './authorization/guards/policies.guard';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { ApiKeyGuard } from './authentication/guards/api-key.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage/refresh-token-ids.storage';
import { PolicyHandlerStorage } from './authorization/policies/policy-handlers.storage';
import { FrameworkContributorPolicyHandler } from './authorization/policies/framework-contributor.policy';
import { ApiKeysService } from './authentication/api-keys.service';
import { OtpAuthService } from './authentication/otp-auth.service';
import { GoogleAuthService } from './authentication/social/google-auth.service';
import { GoogleAuthController } from './authentication/social/google-auth.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: ApiKey.name, schema: ApiKeySchema },
    ]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    { provide: HashingService, useClass: BcryptService },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: PoliciesGuard },
    AccessTokenGuard,
    ApiKeyGuard,
    RefreshTokenIdsStorage,
    AuthenticationService,
    PolicyHandlerStorage,
    FrameworkContributorPolicyHandler,
    ApiKeysService,
    OtpAuthService,
    GoogleAuthService,
    PermissionsService,
  ],
  controllers: [AuthenticationController, GoogleAuthController],
})
export class AuthModule {}
