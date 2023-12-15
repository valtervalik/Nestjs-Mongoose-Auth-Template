import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema()
export class Permission extends mongoose.Document {
  @Prop({ type: Boolean, default: false })
  create_user: boolean;

  @Prop({ type: Boolean, default: false })
  update_user: boolean;

  @Prop({ type: Boolean, default: false })
  delete_user: boolean;
}
export const PermissionSchema = SchemaFactory.createForClass(Permission);
