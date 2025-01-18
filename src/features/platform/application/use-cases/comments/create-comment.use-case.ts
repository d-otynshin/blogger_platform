import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Comment, CommentModelType } from '../../../domain/comment.entity';
import { BadRequestDomainException, NotFoundDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { CommentsInputDto } from '../../../api/input-dto/comments.input-dto';
import { UserContextDto } from '../../../../accounts/dto/auth.dto';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';
import { Post, PostModelType } from '../../../domain/post.entity';

export class CreateCommentCommand {
  constructor(
    public postId: Types.ObjectId,
    public dto: CommentsInputDto,
    public user: UserContextDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ user, postId, dto }: CreateCommentCommand) {
    const postDocument = await this.PostModel.findById(postId);
    if (!postDocument) {
      // TODO: update error details
      throw NotFoundDomainException.create('Not Found', 'postId');
    }

    const commentDocument = this.CommentModel.createInstance({
      content: dto.content,
      commentatorInfo: {
        userId: new Types.ObjectId(user.id),
        userLogin: user.login,
      },
      postId,
    });

    if (!commentDocument) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    await this.commentsRepository.save(commentDocument);

    return commentDocument;
  }
}
