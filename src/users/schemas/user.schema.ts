import { Role } from '../../roles/schemas/role.schema';
import { Permission } from 'src/permissions/schemas/permission.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends Document {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, select: false })
  password?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role' })
  role: Role;

  @Prop({ type: Boolean, default: false })
  isTFAEnabled: boolean;

  @Prop({ type: String })
  tfaSecret?: string;

  @Prop({ type: String })
  googleId?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' })
  permission: Permission;
}

export const UserSchema = SchemaFactory.createForClass(User);
