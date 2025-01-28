import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInteractionDto } from '../../../dto/comment-dto';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';

export class UpdateInteractionCommentCommand {
  constructor(public dto: CommentInteractionDto) {}
}

@CommandHandler(UpdateInteractionCommentCommand)
export class UpdateInteractionCommentUseCase
  implements ICommandHandler<UpdateInteractionCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({ dto }: UpdateInteractionCommentCommand) {
    const isUpdated = await this.commentsRepository.updateInteractionById(
      dto.commentId,
      dto.userId,
      dto.action,
    );

    if (!isUpdated) {
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    return;
  }
}
