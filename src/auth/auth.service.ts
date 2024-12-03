import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpException, HttpStatus, UnauthorizedException} from '@nestjs/common';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/schema/user.schema';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { registerUserDTO } from './dto/register-user.dto';
import { loginUserDTO } from './dto/login-user.dto';
import * as admin from 'firebase-admin';
import { validateGoogleUserDTO } from './dto/validate-gg-user.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private UsersModel: Model<UserDocument>,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async register(registerUserDto: registerUserDTO): Promise<User> {
        const hashPassword = await this.hashPassword(registerUserDto.password);

        const user = await this.UsersModel.findOne({ email: registerUserDto.email }).exec();

        if(user) {
            throw new UnauthorizedException('UnauthorizedException', {
                cause: new Error(),
                description: 'Email exist.',
            });
        }

        return await this.UsersModel.create({ ...registerUserDto, refresh_token: "refresh_token_string", password: hashPassword });
    }

    async login(loginUserDto: loginUserDTO): Promise<any> {
        const user = await this.UsersModel.findOne({email: loginUserDto.email}).exec();

        if (!user) {
            throw new HttpException("Email is not exist", HttpStatus.UNAUTHORIZED);
        }

        const checkPass = await bcrypt.compare(loginUserDto.password, user.password);
        if (!checkPass) {
            throw new HttpException('Password is not correct', HttpStatus.UNAUTHORIZED);
        }

        // Tạo JWT token
        const payload = { _id: user._id.toString(), username: user.username, email: user.email };
        return await this.generateToken(payload);
    }

    async validateGoogleUser(validateGoogleUserDto: validateGoogleUserDTO): Promise <any> {
        let payload = null;
        const user = await this.UsersModel.findOne({ email: validateGoogleUserDto.email }).exec();

        if(user) {
            payload = { _id: user._id.toString(), username: user.username, email: user.email };
        } else {
            // create google user into database
            const googleUser = await this.UsersModel.create({ ...validateGoogleUserDto, refresh_token: "refresh_token_string" });
            payload = { _id: googleUser._id.toString(), username: googleUser.username, email: googleUser.email };
        }
        return await this.generateToken(payload);
    }

    async refreshToken(refresh_token: string) : Promise<any> {
        try {
            const verify = await this.jwtService.verifyAsync(refresh_token, {
                secret: this.configService.get<string>('JWT_SECRET')
            })
            const checkExistToken = await this.UsersModel.findOne({ email: verify.email, refresh_token })
            if(checkExistToken) {
                return this.generateToken({ _id: verify._id.toString(), username: verify.username, email: verify.email })
            } else {
                throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            throw new HttpException('Something error', HttpStatus.BAD_REQUEST)
        }
    }

    private async generateToken(payload : {_id: string, username: string, email: string}){
        const access_token = await this.jwtService.signAsync(payload);
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('EXP_IN_REFRESH_TOKEN')
        })
        await this.UsersModel.findOneAndUpdate(
            { email: payload.email },
            { refresh_token: refresh_token }
        )

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
