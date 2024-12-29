import { IsDate, IsEnum, IsString } from 'class-validator';
import { PriorityLevel, TaskStatus } from '../schema/task.schema';

export class createTaskDTO {
  @IsString()
  email: string;

  @IsString()
  taskName: string;

  @IsString()
  description: string;

  @IsEnum(PriorityLevel)
  priorityLevel: PriorityLevel;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsEnum(TaskStatus)
  status: TaskStatus;
}
