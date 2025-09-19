import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
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
  }): Promise<Omit<User, 'password'> | null> {
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
    const { password, ...result } = user;
    return result;
  }
}
