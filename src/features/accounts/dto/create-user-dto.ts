export class CreateUserDto {
  login: string;
  email: string;
  password: string;
  confirmationCode: string;
}

export class UpdateUserDto {
  email: string;
}
