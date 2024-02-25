import { registerAs } from '@nestjs/config';
import { IsNumber, IsString, Min } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { DatabaseConfig } from './database-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Min(0)
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
    port: parseInt(process.env.DB_PORT, 10),
    uri: process.env.DB_URI,
    name: process.env.DB_NAME,
  };
});
