import { IsEmail, IsString, Length } from 'class-validator';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

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
  @IsEmail()
  email: string;
}

export class ConfirmEmailInputDto {
  @IsString()
  code: string;
}

export class UpdatePasswordInputDto {
  newPassword: string;
  recoveryCode: string;
}
