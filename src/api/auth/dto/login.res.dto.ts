import { User } from '@prisma/client';
import { Token } from '../auth.service';

class LoginResDto {
  token: Token;
  user: Omit<User, 'password'>;
}

export default LoginResDto;
