import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FocusSessionService } from './focus.service';
import {
  FocusSession,
  FocusSessionSchema,
} from './schema/focus-session.schema';
import { FocusSessionController } from './focus.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: FocusSession.name, schema: FocusSessionSchema },
    ]),
  ],
  providers: [FocusSessionService],
  controllers: [FocusSessionController],
  exports: [MongooseModule, FocusSessionService],
})
export class FocusSessionModule {}
