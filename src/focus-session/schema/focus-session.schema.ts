import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FocusSessionDocument = HydratedDocument<FocusSession>;

@Schema({ timestamps: true })
export class FocusSession {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  taskId: string;

  @Prop({ type: Number })
  studyTime: number; // calculate by seconds

  @Prop({ type: Number })
  breakTime: number; // calculate by seconds
}

export const FocusSessionSchema = SchemaFactory.createForClass(FocusSession);
