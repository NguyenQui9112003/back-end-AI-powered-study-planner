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
import * as nodemailer from 'nodemailer';

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
        return this.generateToken({ _id: verify._id.toString(), username: verify.username, is_activated: verify.is_activated });
      } else {
        throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException('Something error', HttpStatus.BAD_REQUEST);
    }
  }

  private async generateToken(payload: { _id: string; username: string; is_activated: boolean }) {
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('EXP_IN_REFRESH_TOKEN'),
    });
    await this.UsersModel.findOneAndUpdate(
      { username: payload.username },
      { refresh_token: refresh_token },
      { is_activated: payload.is_activated }
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

  async getProfileInfo(req: any): Promise<any> {
    const user = await this.UsersModel.findOne({ username: req.username }).select('username email is_activated password').exec();
    return({
      username: user.username,
      email: user.email,
      is_activated: user.is_activated,
      hasPassword: user.password && user.password.length > 0, 
    });
    }
  async sendOTP(req: any): Promise<any> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
          user: 'aistudyplanner21ktpm2@gmail.com', 
          pass: 'niwg yexn cjsx chof', 
      },
      from: 'aistudyplanner21ktpm2@gmail.com',
    });
    const mailOptions = {
      from: 'aistudyplanner21ktpm2@gmail.com', 
      to: req.email,
      subject: 'AI Study Planner Verification code', 
      text: `Your OTP code is: ${otp}`, 
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
      } else {
          console.log('Email sent:', info.response);
      }
    });
    return {otp: await this.hashPassword(otp)};
  }
    
  async verifyWithEmail(req: any): Promise<any> {
    console.log(req);
    try{
      await this.UsersModel.findOneAndUpdate(
        { email: req.email },
        { is_activated: true }
      );
    } catch (error) {
      throw new HttpException('Failed to verify: ' + error, HttpStatus.BAD_REQUEST);
    }
    return;
  }
  async changePassword(req: any): Promise<any> {
    const user = await this.UsersModel.findOne({ email: req.email }).select('password').exec();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(req.currentPassword, user.password);
    if (user.password !== "" && !isMatch) {
      throw new HttpException('Current password is incorrect', HttpStatus.BAD_REQUEST);
    }

    const hashedNewPassword = await this.hashPassword(req.newPassword);
    try{
      await this.UsersModel.findOneAndUpdate(
        { email: req.email },
        { password: hashedNewPassword }
      );

    } catch (error) {
      throw new HttpException('Failed to update the password: ' + error, HttpStatus.BAD_REQUEST);

    }
    return;
  }
  async createPassword(req: any): Promise<any> {
    const user = await this.UsersModel.findOne({ email: req.email }).select('password').exec();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const hashedNewPassword = await this.hashPassword(req.newPassword);
    try{
      await this.UsersModel.findOneAndUpdate(
        { email: req.email },
        { password: hashedNewPassword }
      );

    } catch (error) {
      throw new HttpException('Failed to create the password: ' + error, HttpStatus.BAD_REQUEST);

    }
    return;
  }
}
