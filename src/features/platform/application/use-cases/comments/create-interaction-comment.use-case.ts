import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInteractionDto } from '../../../dto/comment-dto';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';

export class CreateInteractionCommentCommand {
  constructor(public dto: CommentInteractionDto) {}
}

@CommandHandler(CreateInteractionCommentCommand)
export class CreateInteractionCommentUseCase
  implements ICommandHandler<CreateInteractionCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

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
