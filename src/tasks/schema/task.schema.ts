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
  IN_PROCESS = 'In Process',
  COMPLETED = 'Completed',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: String, required: true, unique: true })
  taskName: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, enum: PriorityLevel, required: true })
  priorityLevel: PriorityLevel;

  @Prop({ type: String, required: true })
  estimatedTime: string;

  @Prop({ type: String, enum: TaskStatus, required: true })
  status: TaskStatus;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
