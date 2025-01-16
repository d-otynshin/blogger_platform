import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Comment, CommentModelType } from '../../../domain/comment.entity';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { CommentsInputDto } from '../../../api/input-dto/comments.input-dto';
import { UserContextDto } from '../../../../accounts/dto/auth.dto';

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
  ) {}

  async execute({ user, postId, dto }: CreateCommentCommand) {
    const commentDocument = this.CommentModel.createInstance({
      content: dto.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      postId,
    });

    if (!commentDocument) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    return commentDocument;
  }
}
