import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: any) {
    // ກວດສອບວ່າ Email ນີ້ມີໃນລະບົບແລ້ວບໍ
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email ຖືກນໍາໃຊ້ແລ້ວ');
    }

    // ເຮັດ Hash ລະຫັດຜ່ານ
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    // ສ້າງ User ໃໝ່
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    const userId = (user as any)._id || (user as any).id;

    return {
      message: 'Sign-up ສໍາເລັດ',
      userId: userId,
    };
  }

  async signIn(dto: any) {
    // ຄົ້ນຫາ User ຈາກ Email
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ຫຼື Password ບໍ່ຖືກຕ້ອງ');
    }

    // ກວດສອບ Password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email ຫຼື Password ບໍ່ຖືກຕ້ອງ');
    }

    const userId = (user as any)._id || (user as any).id;

    // ສ້າງ JWT Payload
    const payload = {
      sub: userId,
      email: user.email,
      role: user.role || 'user',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
    };
  }

  async signOut() {
    return {
      message: 'Sign-out ສໍາເລັດ (ກະລຸນາລົບ Access Token ຢູ່ Client)',
    };
  }
}