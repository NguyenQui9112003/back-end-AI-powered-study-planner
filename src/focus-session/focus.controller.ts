import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, AuthGuard } from 'src/auth/auth.guard';
import { FocusSessionService } from './focus.service';
import { FocusSession } from './schema/focus-session.schema';
import { DeleteResult } from 'mongoose';

@Controller('focus-session')
export class FocusSessionController {
  constructor(private aiService: FocusSessionService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  async create(
    @Request() request: AuthenticatedRequest,
  ): Promise<FocusSession> {
    return this.aiService.create({ ...request.body, userId: request.user._id });
  }

  @UseGuards(AuthGuard)
  @Post('delete')
  async prioritySuggestion(
    @Request() request: AuthenticatedRequest,
  ): Promise<DeleteResult> {
    return this.aiService.deleteAll(request.body);
  }
}
