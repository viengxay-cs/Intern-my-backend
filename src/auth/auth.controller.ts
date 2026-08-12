import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: Record<string, any>) {
    return this.authService.signUp(body);
  }

  @Post('signin')
  async signin(@Body() body: Record<string, any>) {
    return this.authService.signIn(body);
  }
}