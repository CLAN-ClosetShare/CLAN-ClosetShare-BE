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
import { CommentService } from './comment.service';
import { CreateCommentReqDto, UpdateCommentReqDto } from './dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('post/:postId')
  async getCommentsByPostId(
    @Param('postId') postId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return await this.commentService.getCommentsByPostId(postId, page, limit);
  }

  @Post('')
  @UseGuards(AuthGuard)
  async createComment(
    @Body() createCommentReqDto: CreateCommentReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.commentService.createComment(
      createCommentReqDto,
      currentUser,
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateComment(
    @Param('id') commentId: string,
    @Body() updateCommentReqDto: UpdateCommentReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.commentService.updateComment(
      commentId,
      updateCommentReqDto,
      currentUser,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteComment(
    @Param('id') commentId: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.commentService.deleteComment(commentId, currentUser);
  }
}
