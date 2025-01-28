import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsInputDto } from '../../../api/input-dto/comments.input-dto';
import {
  BadRequestDomainException,
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public dto: CommentsInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({ commentId, dto, userId }: UpdateCommentCommand) {
    const commentData = await this.commentsRepository.getById(commentId);

    if (!commentData) {
      throw NotFoundDomainException.create('Invalid comment', 'content');
    }

    if (commentData.commentator.id !== userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    const isUpdated = await this.commentsRepository.updateInstance(
      commentId,
      dto,
    );

    if (!isUpdated) {
      throw BadRequestDomainException.create('Forbidden');
    }

    return;
  }
}
