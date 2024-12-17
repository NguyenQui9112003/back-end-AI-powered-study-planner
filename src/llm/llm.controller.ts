import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LLMService } from './llm.service';

@ApiTags('AI')
@Controller('ai')
export class LlmController {
  constructor(private aiService: LLMService) {}

  @Post('suggestion')
  register(): Promise<string> {
    return this.aiService.generateText(null);
  }
}
