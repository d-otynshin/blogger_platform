import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsInputDto } from '../../../api/input-dto/comments.input-dto';
import { Comment, CommentModelType } from '../../../domain/comment.entity';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';

export class UpdateCommentCommand {
  constructor(
    public id: Types.ObjectId,
    public dto: CommentsInputDto,
    public userId: Types.ObjectId,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async execute({ id, dto, userId }: UpdateCommentCommand) {
    const commentDocument = await this.CommentModel.findById(id);

    if (!commentDocument) {
      throw NotFoundDomainException.create('Invalid comment', 'content');
    }

    if (commentDocument.commentatorInfo.userId !== userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    await this.CommentModel.findByIdAndUpdate(id, dto);

    return;
  }
}
