import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schema/task.schema';
import { createTaskDTO } from './dto/create-tasks.dto';
import { updateTaskDTO } from './dto/update-tasks.dto';
import { deleteTaskDTO } from './dto/delete-tasks.dto';
import { getTaskDTO } from './dto/get-tasks.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task.name) private TasksModel: Model<TaskDocument>,
    ) { }

    async create(createTask: createTaskDTO): Promise<any> {
        const task = await this.TasksModel.findOne({ taskName: createTask.taskName }).exec();

        if (task) {
            throw new ConflictException('ConflictException', {
                cause: new Error(),
                description: 'Task exist.',
            });
        }

        const createdTask = await this.TasksModel.create({
            taskName: createTask.taskName,
            description: createTask.description,
            priorityLevel: createTask.priorityLevel,
            estimatedTime: createTask.estimatedTime,
            status: createTask.status
        });
        const res = createdTask.toObject();
        // console.log(res);
        return res;
    }

    async update(updateTask: updateTaskDTO): Promise<Task> {
        const task = await this.TasksModel.findOne({ taskName: updateTask.taskName }).exec();

        if (!task) {
            throw new NotFoundException(`Task with name "${updateTask.taskName}" not found.`);
        }

        const { taskName, ...updateFields } = updateTask;

        const updatedTask = await this.TasksModel.findOneAndUpdate(
            { taskName: taskName },
            updateFields,
            { new: true, timestamps: true, }
        );

        const res = updatedTask.toObject();
        return res;
    }

    async delete(deleteTask: deleteTaskDTO): Promise<any> {
        const task = await this.TasksModel.findOne({ taskName: deleteTask.taskName }).exec();

        if (!task) {
            throw new NotFoundException(`Task with name "${deleteTask.taskName}" not found.`);
        }

        const res = await this.TasksModel.deleteOne({ taskName: deleteTask.taskName });
        return res;
    }

    async getAll(getAllTask: getTaskDTO): Promise<Task[]> {
        return await this.TasksModel.find().exec();
    }

    async findTaskWithSearchString(searchString: String): Promise<Task[]> {
        const res = await this.TasksModel.find({
            taskName: { $regex: searchString, $options: 'i' }, // không phân biệt chữ hoa/thường
        });
        // console.log(res);
        return res;
    }
}
