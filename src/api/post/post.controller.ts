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
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostReqDto, UpdatePostReqDto } from './dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { ReactService } from '../react/react.service';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly reactService: ReactService,
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
    @CurrentUser() currentUser?: JwtPayloadType,
  ) {
    return await this.postService.getAllPosts(page, limit, userId, currentUser?.id);
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
