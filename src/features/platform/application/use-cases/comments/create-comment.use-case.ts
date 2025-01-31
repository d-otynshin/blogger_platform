import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsInputDto } from '../../../api/input-dto/comments.input-dto';
import { UserContextDto } from '../../../../accounts/dto/auth.dto';
import { Comment } from '../../../domain/comment.entity';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';

import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';

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
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ user, postId, dto }: CreateCommentCommand): Promise<Comment> {
    const post = await this.postsRepository.findById(postId);

    if (!post) {
      throw NotFoundDomainException.create('Not Found', 'postId');
    }

    const createdComment = await this.commentsRepository.createInstance({
      postId: postId,
      content: dto.content,
      commentatorId: user.id,
    });

    if (!createdComment) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid comment');
    }

    return this.commentsRepository.getById(createdComment.id);
  }
}
