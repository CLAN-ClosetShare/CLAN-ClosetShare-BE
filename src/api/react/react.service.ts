import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { ReactPostReqDto } from './dto';

@Injectable()
export class ReactService {
  constructor(private readonly prismaService: PrismaService) {}

  async reactPost(
    reactPostReqDto: ReactPostReqDto,
    currentUser: JwtPayloadType,
  ) {
    // Kiểm tra post có tồn tại không
    const post = await this.prismaService.post.findUnique({
      where: { id: reactPostReqDto.post_id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Kiểm tra xem user đã react chưa
    const existingReact = await this.prismaService.react.findFirst({
      where: {
        user_id: currentUser.id,
        post_id: reactPostReqDto.post_id,
      },
    });

    if (existingReact) {
      // Nếu đã react và is_active = false, update lại thành true
      if (!existingReact.is_active) {
        const updatedReact = await this.prismaService.react.update({
          where: { id: existingReact.id },
          data: { is_active: true },
        });
        return updatedReact;
      }
      // Nếu đã react và is_active = true, throw conflict
      throw new ConflictException('You have already reacted to this post');
    }

    // Tạo react mới
    const react = await this.prismaService.react.create({
      data: {
        user_id: currentUser.id,
        post_id: reactPostReqDto.post_id,
        is_active: true,
      },
    });

    return react;
  }

  async unReactPost(postId: string, currentUser: JwtPayloadType) {
    // Kiểm tra post có tồn tại không
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Tìm react của user cho post này
    const existingReact = await this.prismaService.react.findFirst({
      where: {
        user_id: currentUser.id,
        post_id: postId,
      },
    });

    if (!existingReact) {
      throw new NotFoundException('You have not reacted to this post');
    }

    if (!existingReact.is_active) {
      throw new ConflictException('You have already un-reacted to this post');
    }

    // Update is_active thành false
    const updatedReact = await this.prismaService.react.update({
      where: { id: existingReact.id },
      data: { is_active: false },
    });

    return updatedReact;
  }
}
