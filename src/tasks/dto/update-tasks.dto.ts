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