import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { verifyPassword } from 'src/utils/passwords';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

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
    return result;
  }
}
