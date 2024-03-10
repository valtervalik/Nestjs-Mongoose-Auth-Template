import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { DatabaseConfig } from './database-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  DB_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  DB_PORT: number;

  @IsString()
  DB_URI: string;

  @IsString()
  DB_NAME: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 27017,
    uri: process.env.DB_URI,
    name: process.env.DB_NAME,
  };
});
