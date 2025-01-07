import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginInputDto } from './input-dto/login.input-dto';

@Controller('auth')
export class AuthController {
  @Post()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginInputDto) {
    const
  }
}
