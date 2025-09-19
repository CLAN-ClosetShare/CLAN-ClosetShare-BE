import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

class RegisterReqDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsStrongPassword()
  password!: string;

  @IsPhoneNumber()
  phone_number!: string;
}

export default RegisterReqDto;
