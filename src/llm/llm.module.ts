import { Module } from '@nestjs/common';
import { LLMService } from './llm.service';
import { LlmController } from './llm.controller';
import { TasksModule } from '../tasks/tasks.module';
@Module({
  imports: [TasksModule],
  providers: [LLMService],
  controllers: [LlmController],
})
export class LLMModule {}
