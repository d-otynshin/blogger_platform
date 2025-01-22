import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInteractionDto } from '../../../dto/comment-dto';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { CommentsSQLRepository } from '../../../infrastructure/repositories/comments-sql.repository';

export class CreateInteractionCommentCommand {
  constructor(public dto: CommentInteractionDto) {}
}

@CommandHandler(CreateInteractionCommentCommand)
export class CreateInteractionCommentUseCase
  implements ICommandHandler<CreateInteractionCommentCommand>
{
  constructor(private commentsRepository: CommentsSQLRepository) {}

  async execute({ dto }: CreateInteractionCommentCommand) {
    const isCreated = await this.commentsRepository.createInteraction(
      dto.commentId,
      dto.userId,
      dto.action,
    );

    if (!isCreated) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    return;
  }
}
