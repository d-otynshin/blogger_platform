import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsInputDto } from '../../../api/input-dto/comments.input-dto';
import { UserContextDto } from '../../../../accounts/dto/auth.dto';

import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CommentsSQLRepository } from '../../../infrastructure/repositories/comments-sql.repository';
import { PostsSQLRepository } from '../../../infrastructure/repositories/posts-sql.repository';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public dto: CommentsInputDto,
    public user: UserContextDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private commentsRepository: CommentsSQLRepository,
    private postsRepository: PostsSQLRepository,
  ) {}

  async execute({ user, postId, dto }: CreateCommentCommand) {
    const postData = await this.postsRepository.findById(postId);

    if (!postData) {
      // TODO: update error details
      throw NotFoundDomainException.create('Not Found', 'postId');
    }

    const commentData = await this.commentsRepository.createInstance({
      postId: postId,
      content: dto.content,
      commentatorId: user.id,
    });

    if (!commentData) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid comment');
    }

    return commentData;
  }
}
