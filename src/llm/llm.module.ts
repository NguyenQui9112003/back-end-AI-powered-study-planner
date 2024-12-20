import { Module } from '@nestjs/common';
import { LLMService } from './llm.service';
import { LlmController } from './llm.controller';

@Module({
  providers: [LLMService],
  controllers: [LlmController],
})
export class LLMModule {}
