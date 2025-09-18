import { Injectable } from '@nestjs/common';
import {
  LoginReqDto,
  LoginResDto,
  RegisterReqDto,
  RegisterResDto,
} from './dto';
import { UserService } from 'src/user/user.service';
import { hashPassword } from 'src/utils/passwords';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async login(_loginReqDto: LoginReqDto): Promise<LoginResDto> {
    return _loginReqDto;
  }

  async register(registerReqDto: RegisterReqDto): Promise<RegisterResDto> {
    const hashedPassword = await hashPassword(registerReqDto.password);
    const user = await this.userService.createUser({
      ...registerReqDto,
      password: hashedPassword,
    });
    return { id: user.id, email: user.email };
  }
}
