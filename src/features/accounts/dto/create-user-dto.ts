export class CreateUserDto {
  login: string;
  email: string;
  password: string;
  confirmationCode: string;
}

// TODO: best practice?
export class CreateUserDbDto {
  login: string;
  email: string;
  passwordHash: string;
  confirmationCode: string;
}

export class UpdateUserDto {
  email: string;
}
