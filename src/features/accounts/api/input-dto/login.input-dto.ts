import { LoginDto } from '../../dto/auth.dto';

export class LoginInputDto implements LoginDto {
  loginOrEmail: string;
  password: string;
}
