import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role extends mongoose.Document {
  @Prop({ type: String, required: true })
  name: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
