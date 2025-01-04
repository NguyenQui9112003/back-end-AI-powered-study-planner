import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

export enum PriorityLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  EXPIRED = 'Expired',
}

@Schema({ timestamps: true })
export class Task {
  // user
  @Prop({ type: String, required: true })
  username: string;

  // name
  @Prop({ type: String, required: true })
  taskName: string;

  // description
  @Prop({ type: String })
  description: string;

  // priority
  @Prop({ type: String, enum: PriorityLevel, required: true })
  priorityLevel: PriorityLevel;

  // focus time
  @Prop({ type: Number })
  timeFocus: number; // calculate by seconds

  // expected time
  @Prop({ type: Number })
  expectedTime: number; // calculate by seconds

  // deadline
  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  // status
  @Prop({ type: String, enum: TaskStatus, required: true })
  status: TaskStatus;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
