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
    return this.aiService.scheduleSuggestion(request);
  }

  @UseGuards(AuthGuard)
  @Post('priority')
  async prioritySuggestion(
    @Request() request: AuthenticatedRequest,
  ): Promise<string> {
    return this.aiService.prioritySuggestion(request);
  }
}
