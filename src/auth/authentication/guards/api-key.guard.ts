import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from '../api-keys.service';
import {
  ApiKey,
  ApiKeyDocument,
} from 'src/users/api-keys/schemas/api-key.schema';
import { REQUEST_USER_KEY } from 'src/auth/auth.constants';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    @InjectModel(ApiKey.name)
    private readonly apiKeysModel: Model<ApiKeyDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractKeyFromHeader(request);
    if (!apiKey) {
      throw new UnauthorizedException();
    }
    const apiKeyEntityId = this.apiKeysService.extractFromApiKey(apiKey);
    try {
      const apiKeyEntity = await this.apiKeysModel
        .findById(apiKeyEntityId)
        .populate('user');

      await this.apiKeysService.validate(apiKey, apiKeyEntity.key);

      request[REQUEST_USER_KEY] = {
        sub: apiKeyEntity.user._id,
        email: apiKeyEntity.user.email,
        role: apiKeyEntity.user.role,
        permission: apiKeyEntity.user.permission,
      } as ActiveUserData;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractKeyFromHeader(request: Request): string | undefined {
    const [type, key] = request.headers.authorization?.split(' ') ?? [];
    return type === 'ApiKey' ? key : undefined;
  }
}
