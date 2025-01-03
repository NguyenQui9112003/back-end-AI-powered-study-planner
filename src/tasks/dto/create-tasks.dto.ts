import { PriorityLevel, TaskStatus } from '../schema/task.schema';

export class createTaskDTO {
  username: string;
  taskName: string;
  description: string;
  priorityLevel: PriorityLevel;
  timeFocus: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
}
