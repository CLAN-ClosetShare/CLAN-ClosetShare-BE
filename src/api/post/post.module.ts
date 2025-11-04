import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { ReactModule } from '../react/react.module';

@Module({
  imports: [ReactModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
