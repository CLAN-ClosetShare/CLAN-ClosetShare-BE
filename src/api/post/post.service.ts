import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostReqDto, UpdatePostReqDto } from './dto';
import { PrismaService } from 'src/database/prisma.service';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPost(
    createPostReqDto: CreatePostReqDto,
    currentUser: JwtPayloadType,
  ) {
    const post = await this.prismaService.post.create({
      data: {
        ...createPostReqDto,
        author_id: currentUser.id,
        published: true,
      },
    });
    return post;
  }

  async getPostById(postId: string) {
    return await this.prismaService.post.findUnique({
      where: { id: postId },
    });
  }

  async getAllPosts(page: string, limit: string) {
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        skip,
        take: limitNumber,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.post.count(),
    ]);

    return { posts, total };
  }

  async updatePost(
    postId: string,
    updatePostReqDto: UpdatePostReqDto,
    currentUser: JwtPayloadType,
  ) {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_id !== currentUser.id) {
      throw new UnauthorizedException(
        'You are not authorized to update this post',
      );
    }

    const updatedPost = await this.prismaService.post.update({
      where: { id: postId },
      data: updatePostReqDto,
    });

    return updatedPost;
  }
}
