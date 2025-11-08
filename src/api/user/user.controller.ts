import { Controller, Get, Query, UseGuards, Req, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('')
  async getUsers(
    @Query() query: GetUsersQueryDto,
    @Query('userId') userId?: string,
    @Req() request?: Request,
  ) {
    // If userId is provided, use the old endpoint logic for backward compatibility
    if (userId) {
      return await this.userService.getUserById(userId);
    }

    // Handle pagination and search
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const search = query.search;

    // Try to extract and verify token if present
    let isAdmin = false;
    const authHeader = request?.headers?.authorization;
    if (authHeader) {
      try {
        const [type, token] = authHeader.split(' ');
        if (type === 'Bearer' && token) {
          const payload = await this.authService.verifyAccessToken(token);
          isAdmin = await this.userService.isAdmin(payload.id);
        }
      } catch {
        // Token is invalid, treat as non-admin
        isAdmin = false;
      }
    }

    return await this.userService.getAllUsers({
      page,
      limit,
      search,
      isAdmin,
    });
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() currentUser: JwtPayloadType) {
    return await this.userService.getUserById(currentUser.id);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserByIdWithOutfits(id);
  }
}
