import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { createTaskDTO } from './dto/create-tasks.dto';
import { updateTaskDTO } from './dto/update-tasks.dto';
import { deleteTaskDTO } from './dto/delete-tasks.dto';
import { focusTimeDTO } from './dto/focus-time.dto';
import { TaskStatus } from './schema/task.schema';
import { Task, TaskDocument } from './schema/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private TasksModel: Model<TaskDocument>,
  ) {}

  async create(createTask: createTaskDTO): Promise<any> {
    const task = await this.TasksModel.findOne({
      username: createTask.username,
      taskName: createTask.taskName,
    }).exec();

    if (task) {
      throw new ConflictException('Task existed', {
        cause: new Error(),
        description: 'Error: Task existed',
      });
    }

    const createdTask = await this.TasksModel.create({
      username: createTask.username,
      taskName: createTask.taskName,
      description: createTask.description,
      priorityLevel: createTask.priorityLevel,
      timeFocus: parseInt(createTask.timeFocus),
      startDate: createTask.startDate,
      endDate: createTask.endDate,
      status: createTask.status,
    });

    const res = createdTask.toObject();
    return res;
  }

  async update(updateTask: updateTaskDTO): Promise<Task> {
    const { taskName, ...updateFields } = updateTask;
    const updatedTask = await this.TasksModel.findOneAndUpdate(
      {
        username: updateTask.username,
        taskName: taskName,
      },
      updateFields,
      {
        new: true,
        timestamps: true,
      },
    );
    const res = updatedTask.toObject();
    return res;
  }

  async delete(deleteTask: deleteTaskDTO): Promise<any> {
    const task = await this.TasksModel.findOne({
      username: deleteTask.username,
      taskName: deleteTask.taskName,
    }).exec();

    if (!task) {
      throw new NotFoundException('Not found', {
        cause: new Error(),
        description: `Error: Task with name "${deleteTask.taskName}" not found.`,
      });
    }

    const res = await this.TasksModel.deleteOne({
      username: deleteTask.username,
      taskName: deleteTask.taskName,
    }).exec();

    return res;
  }

  async getAll(user: string): Promise<Task[]> {
    const tasks = await this.TasksModel.find({ username: user }).exec();
    const currentDate = new Date();
    for (const task of tasks) {
      // check 'Expired'
      if (task.endDate < currentDate && task.status !== TaskStatus.EXPIRED) {
        task.status = TaskStatus.EXPIRED;
        await task.save();
      }
    }
    return tasks;
  }

  async updateFocusTime(timer: focusTimeDTO): Promise<void> {
    const task = await this.TasksModel.findOne({
      username: timer.username,
      taskName: timer.taskName,
    }).exec();

    if (timer.status == TaskStatus.TODO) {
      task.status = TaskStatus.IN_PROGRESS;
    }

    const currentFocusTime = task.timeFocus || 0;
    const additionalFocusTime = parseInt(timer.focusTime);
    const updatedFocusTime = currentFocusTime + additionalFocusTime;

    task.timeFocus = updatedFocusTime;
    await task.save();
  }
}
