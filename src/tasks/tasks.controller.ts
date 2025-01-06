import { Controller, Post, Get, Request, UseGuards } from '@nestjs/common';

import { TasksService } from './tasks.service';
import { AuthenticatedRequest, AuthGuard } from 'src/auth/auth.guard';
import { Task } from './schema/task.schema';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {};

  @Get()
  @UseGuards(AuthGuard)
  async getAllTasks(@Request() request: AuthenticatedRequest): Promise<Task[]> {
    return await this.taskService.getAll(request.user.username);
  }

  @Post('create')
  @UseGuards(AuthGuard)
  async create(@Request() request: AuthenticatedRequest): Promise<Task> {
    return await this.taskService.create({
      ...request.body,
      username: request.user.username,
    });
  }

  @Post('update')
  @UseGuards(AuthGuard)
  async update(@Request() request: AuthenticatedRequest) {
    return await this.taskService.update({
      ...request.body,
      username: request.user.username,
    });
  }

  @Post('delete')
  @UseGuards(AuthGuard)
  async delete(@Request() request: AuthenticatedRequest) {
    return await this.taskService.delete({
      ...request.body,
      username: request.user.username,
    });
  }

  @Post('update-focus-time')
  @UseGuards(AuthGuard)
  async updateFocusTime(@Request() request: AuthenticatedRequest) {
    return await this.taskService.updateFocusTime({
      ...request.body,
      username: request.user.username,
    });
  }
}
