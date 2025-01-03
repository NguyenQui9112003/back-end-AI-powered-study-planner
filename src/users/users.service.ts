import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from './schema/user.schema';
import { createUserDTO } from './dto/create-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UsersModel: Model<UserDocument>,
  ) {}

  async create(createUser: createUserDTO): Promise<User> {
    const hashPassword = await bcrypt.hash(createUser.password, 10);
    const user = await this.UsersModel.create({
      username: createUser.username,
      password: hashPassword,
    });
    const { email, username, ...data } = user.toObject();
    return { email, username, ...data };
  }
}
