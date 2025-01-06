import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LLMService } from './llm.service';
import { AuthenticatedRequest, AuthGuard } from 'src/auth/auth.guard';

@ApiTags('AI')
@Controller('ai')
export class LlmController {
  constructor(private aiService: LLMService) {}

  @UseGuards(AuthGuard)
  @Post('schedule')
  async scheduleSuggestion(
    @Request() request: AuthenticatedRequest,
  ): Promise<string> {
    return this.aiService.suggestSchedule(request);
  }

  @UseGuards(AuthGuard)
  @Post('analyze')
  async prioritySuggestion(
    @Request() request: AuthenticatedRequest,
  ): Promise<string> {
    return this.aiService.provideInsight(request);
  }
}
