import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostReqDto, UpdatePostReqDto } from './dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { ReactService } from '../react/react.service';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly reactService: ReactService,
    private readonly authService: AuthService,
  ) {}

  @Post('')
  @UseGuards(AuthGuard)
  async createPost(
    @Body() createPostReqDto: CreatePostReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.postService.createPost(createPostReqDto, currentUser);
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string) {
    return await this.postService.getPostById(postId);
  }

  @Get('')
  async getAllPosts(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('user_id') userId: string,
    @Req() request: Request,
  ) {
    // Try to extract user from token if present (optional auth)
    let currentUserId: string | undefined;
    try {
      const authHeader = request.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          const payload = await this.authService.verifyAccessToken(token);
          currentUserId = payload.id;
        }
      }
    } catch (error) {
      // Token invalid or missing - continue without user (public access)
      currentUserId = undefined;
    }
    
    return await this.postService.getAllPosts(page, limit, userId, currentUserId);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostReqDto: UpdatePostReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.postService.updatePost(
      postId,
      updatePostReqDto,
      currentUser,
    );
  }

  @Post(':id/reacts')
  @UseGuards(AuthGuard)
  async reactPost(
    @Param('id') postId: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.reactService.reactPost({ post_id: postId }, currentUser);
  }

  @Delete(':id/reacts')
  @UseGuards(AuthGuard)
  async unReactPost(
    @Param('id') postId: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.reactService.unReactPost(postId, currentUser);
  }
}
