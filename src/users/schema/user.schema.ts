import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  is_activated: boolean;

  @Prop()
  refresh_token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
