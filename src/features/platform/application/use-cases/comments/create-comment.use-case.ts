import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsInputDto } from '../../../api/input-dto/comments.input-dto';
import { UserContextDto } from '../../../../accounts/dto/auth.dto';

import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { UsersRepository } from '../../../../accounts/infrastructure/repositories/users.repository';

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
    private usersRepository: UsersRepository,
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

    console.log('commentData', commentData);

    if (!commentData) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid comment');
    }

    const userData = await this.usersRepository.findById(user.id);
    if (!userData) {
      throw BadRequestDomainException.create('Not Found', 'user');
    }

    return {
      ...commentData,
      commentator_login: userData.login,
    };
  }
}
