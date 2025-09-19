import { Body, Controller, Post } from '@nestjs/common';
import {
  LoginReqDto,
  LoginResDto,
  RegisterReqDto,
  RegisterResDto,
} from './dto';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() loginReqDto: LoginReqDto): Promise<LoginResDto> {
    return this.authService.login(loginReqDto);
  }

  @Post('/register')
  async register(
    @Body() registerReqDto: RegisterReqDto,
  ): Promise<RegisterResDto> {
    return this.authService.register(registerReqDto);
  }

  @Post('/refresh-token')
  async refreshToken() {}

  @Post('forgot-password')
  async forgotPassword() {}

  @Post('reset-password')
  async resetPassword() {}

  @Post('verify-email')
  async verifyEmail() {}
}
