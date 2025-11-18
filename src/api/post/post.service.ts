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
      include: {
        _count: {
          select: {
            reacts: true,
          },
        },
      },
    });
  }

  async getAllPosts(
    page: string,
    limit: string,
    userId?: string,
    currentUserId?: string,
  ) {
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
          reacts: currentUserId
            ? {
                where: {
                  user_id: currentUserId,
                  is_active: true,
                },
                select: {
                  id: true,
                },
              }
            : false,
          _count: {
            select: {
              reacts: {
                where: {
                  is_active: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.post.count({
        where: whereCondition,
      }),
    ]);

    // Transform avatar keys to URLs for all authors and add likes/isLiked
    const postsWithAvatarUrls = await Promise.all(
      posts.map(async (post) => {
        if (post.author.avatar) {
          post.author.avatar = await this.cloudflareService.getDownloadedUrl(
            post.author.avatar,
          );
        }

        // Add likes count and isLiked flag
        const likes = post._count?.reacts || 0;
        const isLiked = currentUserId
          ? post.reacts && post.reacts.length > 0
          : false;

        // Remove reacts array from response (we only need isLiked flag)
        const postWithoutReacts = { ...(post as any) };
        delete postWithoutReacts.reacts;

        return {
          ...postWithoutReacts,
          likes,
          isLiked,
        };
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
