import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInteractionDto } from '../../../dto/post-dto';
import { PostsSQLRepository } from '../../../infrastructure/repositories/posts-sql.repository';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';

export class CreateInteractionPostCommand {
  constructor(public dto: PostInteractionDto) {}
}

@CommandHandler(CreateInteractionPostCommand)
export class CreateInteractionPostUseCase
  implements ICommandHandler<CreateInteractionPostCommand>
{
  constructor(private postsRepository: PostsSQLRepository) {}

  async execute({ dto }: CreateInteractionPostCommand) {
    const isCreated = await this.postsRepository.createInteraction(
      dto.postId,
      dto.userId,
      dto.action,
    );

    if (!isCreated) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid post', 'content');
    }

    return;
  }
}
