import { DeleteResult, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import {
  FocusSession,
  FocusSessionDocument,
} from './schema/focus-session.schema';

@Injectable()
export class FocusSessionService {
  constructor(
    @InjectModel(FocusSession.name)
    private FocusSessionModel: Model<FocusSessionDocument>,
  ) {}

  async create(createTask: FocusSession): Promise<FocusSession> {
    const createdTask = await this.FocusSessionModel.create(createTask);
    const res = createdTask.toObject();
    return res;
  }

  async deleteAll(taskId: string): Promise<DeleteResult> {
    const res = await this.FocusSessionModel.deleteMany({
      taskId,
    }).exec();

    return res;
  }

  async getAllFromTask(taskId: string): Promise<FocusSession[]> {
    const sessions = await this.FocusSessionModel.find({ taskId }).exec();
    return sessions;
  }

  async getAllFromUser(userId: string): Promise<FocusSession[]> {
    const sessions = await this.FocusSessionModel.find({ userId }).exec();
    return sessions;
  }
}
