import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { CryptoService } from '../crypto.service';

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

  async execute(command: ValidateUserCommand): Promise<UserDocument> {
    const userDocument = await this.usersRepository.findOne(
      command.loginOrEmail,
    );

    if (!userDocument) return null;

    const isCorrect = await this.cryptoService.comparePasswords({
      password: command.password,
      hash: userDocument.passwordHash,
    });

    return isCorrect ? userDocument : null;
  }
}
