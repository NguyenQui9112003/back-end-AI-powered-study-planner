import { IsEnum, IsString } from 'class-validator';

enum PriorityLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'In Process',
  COMPLETED = 'Completed',
}

export class createTaskDTO {
  @IsString()
  taskName: string;

  @IsString()
  description: string;

  @IsEnum(PriorityLevel)
  priorityLevel: PriorityLevel;

  @IsString()
  estimatedTime: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;
}
