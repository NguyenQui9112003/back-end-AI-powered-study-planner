import { PriorityLevel, TaskStatus } from '../schema/task.schema';

export class updateTaskDTO {
  username: string;
  taskName: string;
  description: string;
  priorityLevel: PriorityLevel;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
}
