import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, User, USER_ROLE } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { verifyPassword } from 'src/utils/passwords';
import { CloudflareService } from 'src/database/cloudflare.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  async createUser(user: Prisma.UserCreateInput): Promise<User> {
    return await this.prismaService.user.create({
      data: { ...user, username: user.email.split('@')[0] },
    });
  }

  async getUserByEmail({
    email,
    hashedPassword,
  }: {
    email: string;
    hashedPassword: string;
  }): Promise<(Omit<User, 'password'> & { shopCreated: boolean }) | null> {
    const user = await this.prismaService.user.findFirst({
      where: { email },
    });
    if (!user) return null;
    const isPasswordValid = await verifyPassword({
      hashedPassword,
      password: user.password,
    });
    if (!isPasswordValid) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const shop = await this.prismaService.shopStaff.findFirst({
      where: {
        user_id: user.id,
        status: 'ACTIVE',
        role: 'OWNER',
      },
    });

    const shopCreated = !!shop;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    // Transform avatar key to URL if exists
    if (result.avatar) {
      result.avatar = await this.cloudflareService.getDownloadedUrl(
        result.avatar,
      );
    }

    return { ...result, shopCreated };
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prismaService.user.findFirst({
      where: { id },
    });
    if (!user) {
      throw new UnprocessableEntityException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    // Transform avatar key to URL if exists
    if (result.avatar) {
      result.avatar = await this.cloudflareService.getDownloadedUrl(
        result.avatar,
      );
    }

    return result;
  }

  async getUserByIdWithOutfits(id: string): Promise<any> {
    const user = await this.prismaService.user.findFirst({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        phone_number: true,
        created_at: true,
        updated_at: true,
        status: true,
        role: true,
        subscription_plan_id: true,
        subscription_plan_start_date: true,
        subscription_plan_end_date: true,
        outfits: {
          select: {
            id: true,
            name: true,
            style: true,
            occasion: true,
            season: true,
            color_theme: true,
            created_at: true,
            updated_at: true,
            top: {
              select: {
                id: true,
                name: true,
                type: true,
                image: true,
                color_palette: true,
                material: true,
                style_tag: true,
              },
            },
            bottom: {
              select: {
                id: true,
                name: true,
                type: true,
                image: true,
                color_palette: true,
                material: true,
                style_tag: true,
              },
            },
            outwear: {
              select: {
                id: true,
                name: true,
                type: true,
                image: true,
                color_palette: true,
                material: true,
                style_tag: true,
              },
            },
            accessories: {
              select: {
                id: true,
                name: true,
                type: true,
                image: true,
                color_palette: true,
                material: true,
                style_tag: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnprocessableEntityException('User not found');
    }

    // Transform avatar key to URL if exists
    if (user.avatar) {
      user.avatar = await this.cloudflareService.getDownloadedUrl(user.avatar);
    }

    return user;
  }

  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === USER_ROLE.ADMIN;
  }

  async getAllUsers({
    page = 1,
    limit = 10,
    search,
    isAdmin = false,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    isAdmin?: boolean;
  }) {
    const pageNumber = page || 1;
    const limitNumber = limit || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const whereCondition: Prisma.UserWhereInput = {};

    if (search) {
      whereCondition.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const selectFields: Prisma.UserSelect = isAdmin
      ? {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          phone_number: true,
          created_at: true,
          updated_at: true,
          status: true,
          role: true,
          subscription_plan_id: true,
          subscription_plan_start_date: true,
          subscription_plan_end_date: true,
        }
      : {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
        };

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where: whereCondition,
        skip,
        take: limitNumber,
        orderBy: { created_at: 'desc' },
        select: isAdmin
          ? selectFields
          : {
              ...selectFields,
              outfits: {
                select: {
                  id: true,
                  name: true,
                  style: true,
                  occasion: true,
                  season: true,
                  color_theme: true,
                  created_at: true,
                  updated_at: true,
                  top: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      image: true,
                      color_palette: true,
                      material: true,
                      style_tag: true,
                    },
                  },
                  bottom: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      image: true,
                      color_palette: true,
                      material: true,
                      style_tag: true,
                    },
                  },
                  outwear: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      image: true,
                      color_palette: true,
                      material: true,
                      style_tag: true,
                    },
                  },
                  accessories: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      image: true,
                      color_palette: true,
                      material: true,
                      style_tag: true,
                    },
                  },
                },
              },
            },
      }),
      this.prismaService.user.count({
        where: whereCondition,
      }),
    ]);

    const total_pages = Math.ceil(total / limitNumber);

    // Transform avatar keys to URLs for all users
    const usersWithAvatarUrls = await Promise.all(
      users.map(async (user) => {
        if (user.avatar) {
          user.avatar = await this.cloudflareService.getDownloadedUrl(
            user.avatar,
          );
        }
        return user;
      }),
    );

    return {
      data: usersWithAvatarUrls,
      pagination: {
        total,
        page: pageNumber,
        total_pages,
      },
    };
  }

  async updateUser(
    userId: string,
    updateData: {
      name?: string;
      bio?: string;
      phone_number?: string;
      avatar?: string;
    },
  ): Promise<Omit<User, 'password'>> {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new UnprocessableEntityException('User not found');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: updateData,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser;

    // Transform avatar key to URL if exists
    if (result.avatar) {
      result.avatar = await this.cloudflareService.getDownloadedUrl(
        result.avatar,
      );
    }

    return result;
  }

  async uploadAvatar(file: Express.Multer.File): Promise<string> {
    return await this.cloudflareService.uploadFile(file);
  }
}
