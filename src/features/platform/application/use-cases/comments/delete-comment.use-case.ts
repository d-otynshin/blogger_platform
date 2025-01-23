import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CommentsSQLRepository } from '../../../infrastructure/repositories/comments-sql.repository';

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
  constructor(private commentsRepository: CommentsSQLRepository) {}

  async execute({ id, userId }: DeleteCommentCommand) {
    const commentData = await this.commentsRepository.getById(id);

    if (!commentData) {
      throw NotFoundDomainException.create('Comment not found', 'commentId');
    }

    if (commentData.commentator_id !== userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    const isDeleted = await this.commentsRepository.deleteInstance(id);

    if (!isDeleted) {
      throw NotFoundDomainException.create('Comment not found', 'commentId');
    }

    return;
  }
}
