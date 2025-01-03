import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

import { User } from 'src/users/schema/user.schema';
import { loginUserDTO } from './dto/login-user.dto';
import { registerUserDTO } from './dto/register-user.dto';
import { validateGoogleUserDTO } from './dto/validate-gg-user.dto';
// import { ApiResponse, ApiTags } from '@nestjs/swagger';

// @ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerUserDto: registerUserDTO): Promise<User> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: loginUserDTO): Promise<any> {
    return this.authService.login(loginUserDto);
  }
  // @ApiResponse({ status: 201, description: 'Login successfully' })
  // @ApiResponse({ status: 401, description: 'Login fail' })
  // @UsePipes(ValidationPipe)

  @Post('refresh-token')
  refreshToken(@Body() { refresh_token }): Promise<any> {
    return this.authService.refreshToken(refresh_token);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('google')
  async googleLogin(@Body('idToken') idToken: string, validateGoogleUserDto: validateGoogleUserDTO) {
    const user = await this.authService.verifyToken(idToken);
    validateGoogleUserDto = { email: user.email };
    return this.authService.validateGoogleUser(validateGoogleUserDto);
  }
}
