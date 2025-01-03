import { TaskStatus } from '../schema/task.schema';

export class focusTimeDTO {
    username: string;
    taskName: string;
    focusTime: string;
    status: TaskStatus;
}