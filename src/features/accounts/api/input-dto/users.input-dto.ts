import { IsEmail, IsString, Length } from 'class-validator';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';

export class CreateUserInputDto {
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  password: string;

  @IsString()
  @IsEmail()
  email: string;
}

export class EmailInputDto {
  email: string;
}

export class ConfirmEmailInputDto {
  code: string;
}

export class UpdatePasswordInputDto {
  newPassword: string;
  recoveryCode: string;
}
