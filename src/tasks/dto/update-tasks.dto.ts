import { IsDate, IsEnum, IsString } from 'class-validator';
import { PriorityLevel, TaskStatus } from '../schema/task.schema';

export class updateTaskDTO {
  @IsString()
  email: string;

  @IsString()
  taskName: string;

  @IsEnum(PriorityLevel)
  priorityLevel: PriorityLevel;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsEnum(TaskStatus)
  status: TaskStatus;
}
