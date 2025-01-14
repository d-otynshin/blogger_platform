import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsInputDto } from '../../api/input-dto/comments.input-dto';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';

export class UpdateCommentLikeCommand {
  constructor(
    public commentId: Types.ObjectId,
    public userId: Types.ObjectId,
    public dto: CommentsInputDto,
  ) {}
}

@CommandHandler(UpdateCommentLikeCommand)
export class UpdateCommentLikeUseCase
  implements ICommandHandler<UpdateCommentLikeCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async execute(command: UpdateCommentLikeCommand) {
    const { commentId, userId, dto } = command;
    const commentDocument = await this.CommentModel.findByIdAndUpdate(
      commentId,
      dto,
      { new: true },
    );

    if (!commentDocument) {
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    return;
  }
}
