import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { registerUserDTO } from './dto/register-user.dto';
import { User } from 'src/users/schema/user.schema';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { loginUserDTO } from './dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerUserDto: registerUserDTO): Promise<User> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @ApiResponse({ status: 201, description: 'Login successfully' })
  @ApiResponse({ status: 401, description: 'Login fail' })
  @UsePipes(ValidationPipe)
  login(@Body() loginUserDto: loginUserDTO): Promise<any> {
    return this.authService.login(loginUserDto);
  }

  @Post('refresh-token')
  refreshToken(@Body() { refresh_token }): Promise<any> {
    return this.authService.refreshToken(refresh_token);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
