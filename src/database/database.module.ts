import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AllConfigType } from 'src/config/config.type';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AllConfigType>) => ({
        uri:
          configService.getOrThrow('database.uri', { infer: true }) +
          configService.getOrThrow('database.host', { infer: true }) +
          ':' +
          configService.getOrThrow('database.port', { infer: true }) +
          '/' +
          configService.getOrThrow('database.name', { infer: true }),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
