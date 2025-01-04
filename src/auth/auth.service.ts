import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as admin from 'firebase-admin';

import { loginUserDTO } from './dto/login-user.dto';
import { registerUserDTO } from './dto/register-user.dto';
import { validateGoogleUserDTO } from './dto/validate-gg-user.dto';
import { User, UserDocument } from '../users/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UsersModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(registerUserDto: registerUserDTO): Promise<User> {
    const hashPassword = await this.hashPassword(registerUserDto.password);
    
    const user = await this.UsersModel.findOne({ username: registerUserDto.username }).exec();
    if (user) {
      throw new UnauthorizedException('Error: Account exist');
    }

    const userEmail = await this.UsersModel.findOne({ email: registerUserDto.email }).exec();
    if (userEmail) {
      throw new UnauthorizedException('Error: Email exist');
    }

    return await this.UsersModel.create({ username: registerUserDto.username, email: registerUserDto.email, password: hashPassword,
      refresh_token: 'refresh_token_string'
    });
  }

  async login(loginUserDto: loginUserDTO): Promise<any> {
    const user = await this.UsersModel.findOne({ username: loginUserDto.username }).exec();
    if (!user) {
      throw new UnauthorizedException('Error: Account no exist');
    }
    const checkPass = await bcrypt.compare( loginUserDto.password, user.password );
    if (!checkPass) {
      throw new UnauthorizedException('Error: Password no correct');
    }
    // create JWT token
    const payload = { _id: user._id.toString(), username: user.username, is_activated: user.is_activated };
    return await this.generateToken(payload);
  }

  async validateGoogleUser( validateGoogleUserDto: validateGoogleUserDTO ): Promise<any> {
    var payload = null;
    const user = await this.UsersModel.findOne({ email: validateGoogleUserDto.email }).exec();
    if (user) {
      payload = { _id: user._id.toString(), username: user.email, is_activated: user.is_activated };
    } else {
      // create google user into database
      const googleUser = await this.UsersModel.create({
        username: validateGoogleUserDto.email,
        email: validateGoogleUserDto.email,
        password: null,
        refresh_token: 'refresh_token_string',
      });
      payload = { _id: googleUser._id.toString(), username: googleUser.username, is_activated: googleUser.is_activated };
    }
    return await this.generateToken(payload);
  }

  async refreshToken(refresh_token: string): Promise<any> {
    try {
      const verify = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const checkExistToken = await this.UsersModel.findOne({ username: verify.username, refresh_token});
      if (checkExistToken) {
        return this.generateToken({ _id: verify._id.toString(), username: verify.username });
      } else {
        throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException('Something error', HttpStatus.BAD_REQUEST);
    }
  }

  private async generateToken(payload: { _id: string; username: string }) {
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('EXP_IN_REFRESH_TOKEN'),
    });
    await this.UsersModel.findOneAndUpdate(
      { username: payload.username },
      { refresh_token: refresh_token }
    );
    return { access_token, refresh_token };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUND));
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async verifyToken(idToken: string): Promise<any> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
