import { Module } from '@nestjs/common';
import { LLMService } from './llm.service';
import { LlmController } from './llm.controller';
import { TasksModule } from '../tasks/tasks.module';
import { FocusSessionModule } from 'src/focus-session/focus.module';
@Module({
  imports: [TasksModule, FocusSessionModule],
  providers: [LLMService],
  controllers: [LlmController],
})
export class LLMModule {}
