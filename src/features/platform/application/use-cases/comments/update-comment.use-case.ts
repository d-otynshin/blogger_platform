import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsInputDto } from '../../../api/input-dto/comments.input-dto';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CommentsSQLRepository } from '../../../infrastructure/repositories/comments-sql.repository';

export class UpdateCommentCommand {
  constructor(
    public id: string,
    public dto: CommentsInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepository: CommentsSQLRepository) {}

  async execute({ id, dto, userId }: UpdateCommentCommand) {
    const commentData = await this.commentsRepository.getById(id);

    if (!commentData) {
      throw NotFoundDomainException.create('Invalid comment', 'content');
    }

    // TODO: make join query request
    if (commentData?.commentatorInfo?.userId !== userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    // TODO: add update for comments
    // await this.commentsRepository.updateById(id, dto);

    return;
  }
}
