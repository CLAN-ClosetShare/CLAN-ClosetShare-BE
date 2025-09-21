import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  LoginReqDto,
  LoginResDto,
  RegisterReqDto,
  RegisterResDto,
} from './dto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { hashPassword } from 'src/utils/passwords';
import { Branded } from 'src/common/types/types';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from '../user/user.service';
import ms from 'ms';
import crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from './types/jwt-payload.type';

export type Token = Branded<
  { access_token: string; refresh_token: string; token_expires: number },
  'token'
>;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly prismaService: PrismaService,
  ) {}
  async login(_loginReqDto: LoginReqDto): Promise<LoginResDto> {
    const { email, password: hashedPassword } = _loginReqDto;
    const user = await this.userService.getUserByEmail({
      email,
      hashedPassword,
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.prismaService.session.create({
      data: {
        userId: user.id,
        hash,
      },
    });

    const token = await this.createToken({
      id: user.id,
      sessionId: session.id,
      hash,
    });

    return { token, user };
  }

  async register(registerReqDto: RegisterReqDto): Promise<RegisterResDto> {
    const hashedPassword = await hashPassword(registerReqDto.password);
    const user = await this.userService.createUser({
      ...registerReqDto,
      password: hashedPassword,
    });
    return { id: user.id, email: user.email };
  }

  private async createToken(data: {
    id: string;
    sessionId: string;
    hash: string;
  }): Promise<Token> {
    const tokenExpiresIn = this.configService.getOrThrow(
      'auth.accessTokenExpirationTime',
      {
        infer: true,
      },
    );

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [access_token, refresh_token] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.accessTokenSecret', {
            infer: true,
          }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshTokenSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow(
            'auth.accessTokenExpirationTime',
            {
              infer: true,
            },
          ),
        },
      ),
    ]);

    return {
      access_token,
      refresh_token,
      token_expires: tokenExpires,
    } as Token;
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    let payload: JwtPayloadType;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayloadType>(token, {
        secret: this.configService.getOrThrow('auth.accessTokenSecret', {
          infer: true,
        }),
      });
    } catch {
      throw new UnauthorizedException();
    }

    //TODO: check if session is in the blacklist

    return payload;
  }
}
