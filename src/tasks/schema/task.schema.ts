import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

enum PriorityLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

enum TaskStatus {
  TODO = 'Todo',
  COMPLETED = 'Completed',
  EXPIRED = 'Expired',
}

@Schema({ timestamps: true })
export class Task {
  // user
  @Prop({ type: String, required: true })
  email: string;

  // name
  @Prop({ type: String, required: true })
  taskName: string;

  // description
  @Prop({ type: String, required: true })
  description: string;

  // priority
  @Prop({ type: String, enum: PriorityLevel, required: true })
  priorityLevel: PriorityLevel;

  // estimated time
  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  // status
  @Prop({ type: String, enum: TaskStatus, required: true })
  status: TaskStatus;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
