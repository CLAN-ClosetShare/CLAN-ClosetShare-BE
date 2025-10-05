import {
  Body,
  Controller,
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

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

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
  ) {
    return await this.postService.getAllPosts(page, limit);
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
}
