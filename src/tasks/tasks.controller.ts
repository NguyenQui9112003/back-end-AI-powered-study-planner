import { Body, Controller, Post, Get, Query, UseGuards } from '@nestjs/common';

import { TasksService } from './tasks.service';
import { createTaskDTO } from './dto/create-tasks.dto';
import { updateTaskDTO } from './dto/update-tasks.dto';
import { deleteTaskDTO } from './dto/delete-tasks.dto';
import { focusTimeDTO } from './dto/focus-time.dto';

import { AuthGuard } from '../auth/auth.guard';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {};

  @UseGuards(AuthGuard)
  @Get()
  async getAllTasks(@Query('userName') userName: string) {
    return await this.taskService.getAll(userName);
  }

  @UseGuards(AuthGuard)
  @Post('create')
  async create(@Body() createTaskDto: createTaskDTO) {
    return await this.taskService.create(createTaskDto);
  }

  @UseGuards(AuthGuard)
  @Post('update')
  async update(@Body() updateTaskDto: updateTaskDTO) {
    return await this.taskService.update(updateTaskDto);
  }

  @UseGuards(AuthGuard)
  @Post('delete')
  async delete(@Body() deleteTaskDto: deleteTaskDTO) {
    return await this.taskService.delete(deleteTaskDto);
  }

  @Post('update-focus-time')
  async updateFocusTime(@Body() focusTimeDto: focusTimeDTO) {
    return await this.taskService.updateFocusTime(focusTimeDto);
  }
}
