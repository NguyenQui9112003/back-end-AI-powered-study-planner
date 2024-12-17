import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { createTaskDTO } from './dto/create-tasks.dto';
import { updateTaskDTO } from './dto/update-tasks.dto';
import { deleteTaskDTO } from './dto/delete-tasks.dto';
import { getTaskDTO } from './dto/get-tasks.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
    constructor(private readonly taskService: TasksService) { }

    // @Roles('user')
    @Get()
    async getAllTasks(@Query() getAllTask: getTaskDTO) {
        return await this.taskService.getAll(getAllTask);
    }

    @Post('create')
    async create(@Body() createTaskDto: createTaskDTO) {
        return await this.taskService.create(createTaskDto);
    }

    @Post('update')
    async update(@Body() updateTaskDto: updateTaskDTO) {
        return await this.taskService.update(updateTaskDto);
    }

    @Post('delete')
    async delete(@Body() deleteTaskDto: deleteTaskDTO) {
        return await this.taskService.delete(deleteTaskDto);
    }

    @Post('find')
    async find(@Body() body: { searchString: string }) {
        const { searchString } = body;
        
        return await this.taskService.findTaskWithSearchString(searchString);
    }
}
