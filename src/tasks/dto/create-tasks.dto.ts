import { IsDate, IsEnum, IsString } from 'class-validator';

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
