import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../crypto.service';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';

export class ValidateUserCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
  ) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute(command: ValidateUserCommand) {
    const userData = await this.usersRepository.findOne(command.loginOrEmail);

    if (!userData) return null;

    const isCorrect = await this.cryptoService.comparePasswords({
      password: command.password,
      hash: userData.password_hash,
    });

    return isCorrect ? userData : null;
  }
}
