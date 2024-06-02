import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../base/base.schema';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
