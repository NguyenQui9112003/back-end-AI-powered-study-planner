import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schema/task.schema';
import { createTaskDTO } from './dto/create-tasks.dto';
import { updateTaskDTO } from './dto/update-tasks.dto';
import { deleteTaskDTO } from './dto/delete-tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private TasksModel: Model<TaskDocument>,
  ) {}

  async create(createTask: createTaskDTO): Promise<any> {
    const task = await this.TasksModel.findOne({
      email: createTask.email,
      taskName: createTask.taskName,
    }).exec();

    if (task) {
      throw new ConflictException('Conflict Exception', {
        cause: new Error(),
        description: 'Error: Task existed',
      });
    }

    const createdTask = await this.TasksModel.create({
      email: createTask.email,
      taskName: createTask.taskName,
      description: createTask.description,
      priorityLevel: createTask.priorityLevel,
      startDate: createTask.startDate,
      endDate: createTask.endDate,
      status: createTask.status,
    });

    const res = createdTask.toObject();
    // console.log(res);
    return res;

    // delete res.__v;
    // delete res._id;
  }

  async update(updateTask: updateTaskDTO): Promise<Task> {
    const task = await this.TasksModel.findOne({
      email: updateTask.email,
      taskName: updateTask.taskName,
    }).exec();

    if (!task) {
      throw new NotFoundException('Not Found Exception', {
        cause: new Error(),
        description: `Task with name "${updateTask.taskName}" not found.`,
      });
    }

    const { taskName, ...updateFields } = updateTask;

    const updatedTask = await this.TasksModel.findOneAndUpdate(
      {
        email: updateTask.email,
        taskName: taskName,
      },
      updateFields, // data need to update
      {
        new: true,
        timestamps: true,
      },
    );

    const res = updatedTask.toObject();
    // console.log(res);
    return res;
  }

  async delete(deleteTask: deleteTaskDTO): Promise<any> {
    const task = await this.TasksModel.findOne({
      email: deleteTask.email,
      taskName: deleteTask.taskName,
    }).exec();

    if (!task) {
      throw new NotFoundException('Not Found Exception', {
        cause: new Error(),
        description: `Task with name "${deleteTask.taskName}" not found.`,
      });
    }

    const res = await this.TasksModel.deleteOne({
      email: deleteTask.email,
      taskName: deleteTask.taskName,
    }).exec();

    return res;
  }

  async getAll(user: string): Promise<Task[]> {
    const res = await this.TasksModel.find({
      email: user,
    }).exec();

    //console.log(res);
    return res;
  }

  async findTaskWithSearchString(searchString: string): Promise<Task[]> {
    const res = await this.TasksModel.find({
      taskName: { $regex: searchString, $options: 'i' }, // không phân biệt chữ hoa/thường
    });
    // console.log(res);
    return res;
  }
}
