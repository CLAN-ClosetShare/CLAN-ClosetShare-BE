import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { CreateCommentReqDto, UpdateCommentReqDto } from './dto';
import { CloudflareService } from 'src/database/cloudflare.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  async createComment(
    createCommentReqDto: CreateCommentReqDto,
    currentUser: JwtPayloadType,
  ) {
    // Kiểm tra post có tồn tại không
    const post = await this.prismaService.post.findUnique({
      where: { id: createCommentReqDto.post_id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Nếu có quote_comment_id, kiểm tra comment đó có tồn tại không
    if (createCommentReqDto.quote_comment_id) {
      const quoteComment = await this.prismaService.comment.findUnique({
        where: { id: createCommentReqDto.quote_comment_id },
      });

      if (!quoteComment) {
        throw new NotFoundException('Quote comment not found');
      }

      // Đảm bảo quote comment thuộc cùng post
      if (quoteComment.post_id !== createCommentReqDto.post_id) {
        throw new NotFoundException(
          'Quote comment does not belong to this post',
        );
      }
    }

    // Tạo comment mới
    const comment = await this.prismaService.comment.create({
      data: {
        user_id: currentUser.id,
        post_id: createCommentReqDto.post_id,
        content: createCommentReqDto.content,
        quote_comment_id: createCommentReqDto.quote_comment_id || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        quote_comment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Transform avatar keys to URLs
    if (comment.user.avatar) {
      comment.user.avatar = await this.cloudflareService.getDownloadedUrl(
        comment.user.avatar,
      );
    }
    if (comment.quote_comment?.user?.avatar) {
      comment.quote_comment.user.avatar =
        await this.cloudflareService.getDownloadedUrl(
          comment.quote_comment.user.avatar,
        );
    }

    return comment;
  }

  async updateComment(
    commentId: string,
    updateCommentReqDto: UpdateCommentReqDto,
    currentUser: JwtPayloadType,
  ) {
    // Tìm comment
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Kiểm tra comment đã bị xóa chưa
    if (comment.is_deleted) {
      throw new NotFoundException('Cannot update deleted comment');
    }

    // Kiểm tra quyền: chỉ author mới được update
    if (comment.user_id !== currentUser.id) {
      throw new UnauthorizedException(
        'You are not authorized to update this comment',
      );
    }

    // Update comment
    const updatedComment = await this.prismaService.comment.update({
      where: { id: commentId },
      data: updateCommentReqDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        quote_comment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Transform avatar keys to URLs
    if (updatedComment.user.avatar) {
      updatedComment.user.avatar =
        await this.cloudflareService.getDownloadedUrl(
          updatedComment.user.avatar,
        );
    }
    if (updatedComment.quote_comment?.user?.avatar) {
      updatedComment.quote_comment.user.avatar =
        await this.cloudflareService.getDownloadedUrl(
          updatedComment.quote_comment.user.avatar,
        );
    }

    return updatedComment;
  }

  async deleteComment(commentId: string, currentUser: JwtPayloadType) {
    // Tìm comment
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Kiểm tra quyền: chỉ author mới được xóa
    if (comment.user_id !== currentUser.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this comment',
      );
    }

    // Kiểm tra xem comment đã bị xóa chưa
    if (comment.is_deleted) {
      throw new NotFoundException('Comment already deleted');
    }

    // Soft delete: set is_deleted = true
    await this.prismaService.comment.update({
      where: { id: commentId },
      data: { is_deleted: true },
    });

    return { message: 'Comment deleted successfully' };
  }

  async getCommentsByPostId(postId: string, page: string, limit: string) {
    // Kiểm tra post có tồn tại không
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Lấy tất cả comments của post (không phân trang để có thể nhóm replies)
    const allComments = await this.prismaService.comment.findMany({
      where: { post_id: postId },
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        quote_comment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Transform avatar keys to URLs for all users
    const formattedComments = await Promise.all(
      allComments.map(async (comment) => {
        const formattedComment = { ...comment };

        // Transform user avatar
        if (formattedComment.user.avatar) {
          formattedComment.user.avatar =
            await this.cloudflareService.getDownloadedUrl(
              formattedComment.user.avatar,
            );
        }

        // Transform quote_comment user avatar
        if (formattedComment.quote_comment?.user?.avatar) {
          formattedComment.quote_comment.user.avatar =
            await this.cloudflareService.getDownloadedUrl(
              formattedComment.quote_comment.user.avatar,
            );
        }

        // Nếu comment bị xóa, thay content
        if (formattedComment.is_deleted) {
          formattedComment.content = 'Comment đã bị xóa';
        }

        // Nếu quote_comment bị xóa, format quote_comment content
        if (
          formattedComment.quote_comment &&
          formattedComment.quote_comment.is_deleted
        ) {
          formattedComment.quote_comment = {
            ...formattedComment.quote_comment,
            content: 'Comment đã bị xóa',
          };
        }

        return formattedComment;
      }),
    );

    // Phân loại comments: gốc và replies
    const parentComments = formattedComments.filter(
      (comment) => !comment.quote_comment_id,
    );
    const replyComments = formattedComments.filter(
      (comment) => comment.quote_comment_id,
    );

    // Nhóm replies vào comment cha
    const commentsWithReplies = parentComments.map((parent) => {
      const replies = replyComments
        .filter((reply) => reply.quote_comment_id === parent.id)
        .map((reply) => {
          // Bỏ quote_comment khỏi reply vì đã có trong parent
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { quote_comment, ...replyWithoutQuote } = reply;
          return replyWithoutQuote;
        });

      // Bỏ quote_comment khỏi parent comment (vì parent không có quote)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { quote_comment, ...parentWithoutQuote } = parent;

      return {
        ...parentWithoutQuote,
        replies: replies.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
      };
    });

    // Sắp xếp lại parent comments theo thời gian mới nhất
    const sortedComments = commentsWithReplies.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    // Áp dụng pagination cho parent comments
    const paginatedComments = sortedComments.slice(skip, skip + limitNumber);
    const total = parentComments.length;

    return { comments: paginatedComments, total };
  }
}
