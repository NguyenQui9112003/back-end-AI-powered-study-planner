import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/schema/user.schema';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30s' },
    }),
  ],
  providers: [
    AuthService,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        const serviceAccountString = configService.get<string>('FIREBASE_KEY');
        if (!serviceAccountString) {
          throw new Error('FIREBASE_KEY is not defined in .env');
        }
        const serviceAccount = JSON.parse(serviceAccountString);
        serviceAccount.private_key = serviceAccount.private_key.replace(
          /\\n/g,
          '\n',
        );
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [AuthController],
  exports: ['FIREBASE_ADMIN'],
})
export class AuthModule {}
