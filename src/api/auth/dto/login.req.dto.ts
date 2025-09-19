import { IsString, IsStrongPassword } from 'class-validator';

class LoginReqDto {
  @IsString()
  email!: string;

  @IsStrongPassword()
  password!: string;
}

export default LoginReqDto;
