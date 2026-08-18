import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email ຖືກນໍາໃຊ້ແລ້ວ');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    const userId = (user as any)._id || (user as any).id;

    return {
      message: 'Successfully',
      userId: userId,
    };
  }

  async signIn(dto: SignInDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ຫຼື Password ບໍ່ຖືກຕ້ອງ');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email ຫຼື Password ບໍ່ຖືກຕ້ອງ');
    }

    const userId = (user as any)._id || (user as any).id;

    const payload = {
      sub: userId,
      email: user.email,
      role: user.role || 'user',
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      firstName: user.firstName ,
      lastName: user.lastName ,
    };
  }

  async signOut() {
    return {
      message: 'Sign-out ສໍາເລັດ (ກະລຸນາລົບ Access Token ຢູ່ Client)',
    };
  }
}