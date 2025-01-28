import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';

export class DeleteCommentCommand {
  constructor(
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({ id, userId }: DeleteCommentCommand) {
    const commentData = await this.commentsRepository.getById(id);

    if (!commentData) {
      throw NotFoundDomainException.create('Comment not found', 'commentId');
    }

    if (commentData.commentator.id !== userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    const isDeleted = await this.commentsRepository.deleteInstance(id);

    if (!isDeleted) {
      throw NotFoundDomainException.create('Comment not found', 'commentId');
    }

    return;
  }
}
