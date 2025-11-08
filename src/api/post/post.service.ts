import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostReqDto, UpdatePostReqDto } from './dto';
import { PrismaService } from 'src/database/prisma.service';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { CloudflareService } from 'src/database/cloudflare.service';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudflareService: CloudflareService,
  ) {}

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

  async getAllPosts(page: string, limit: string, userId?: string) {
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const whereCondition = userId ? { author_id: userId } : {};

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: whereCondition,
        skip,
        take: limitNumber,
        orderBy: { created_at: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      this.prismaService.post.count({
        where: whereCondition,
      }),
    ]);

    // Transform avatar keys to URLs for all authors
    const postsWithAvatarUrls = await Promise.all(
      posts.map(async (post) => {
        if (post.author.avatar) {
          post.author.avatar = await this.cloudflareService.getDownloadedUrl(
            post.author.avatar,
          );
        }
        return post;
      }),
    );

    return { posts: postsWithAvatarUrls, total };
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
