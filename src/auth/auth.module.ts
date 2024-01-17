import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ApiKeysModule } from 'src/api-keys/api-keys.module';
import { EncryptingModule } from 'src/encrypting/encrypting.module';
import { HashingModule } from 'src/hashing/hashing.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { ApiKeysService } from './authentication/api-keys.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { ApiKeyGuard } from './authentication/guards/api-key.guard';
import { AuthGuard } from './authentication/guards/auth.guard';
import { OtpAuthService } from './authentication/otp-auth.service';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage/refresh-token-ids.storage';
import { GoogleAuthController } from './authentication/social/google-auth.controller';
import { GoogleAuthService } from './authentication/social/google-auth.service';
import { PermissionsGuard } from './authorization/guards/permissions.guard';
import { PoliciesGuard } from './authorization/guards/policies.guard';
import { RolesGuard } from './authorization/guards/roles.guard';
import { FrameworkContributorPolicyHandler } from './authorization/policies/framework-contributor.policy';
import { PolicyHandlerStorage } from './authorization/policies/policy-handlers.storage';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    UsersModule,
    ApiKeysModule,
    PermissionsModule,
    RolesModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    HashingModule,
    EncryptingModule,
  ],
  providers: [
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
  ],
  controllers: [AuthenticationController, GoogleAuthController],
})
export class AuthModule {}
