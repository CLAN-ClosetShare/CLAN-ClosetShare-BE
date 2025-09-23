import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getUserById(@Query('userId') id: string) {
    return await this.userService.getUserById(id);
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() currentUser: JwtPayloadType) {
    return await this.userService.getUserById(currentUser.id);
  }
}
