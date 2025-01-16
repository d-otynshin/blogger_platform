import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { CommentsInputDto } from '../../../api/input-dto/comments.input-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../../domain/comment.entity';
import {
  BadRequestDomainException,
  ForbiddenDomainException,
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
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    if (commentDocument.commentatorInfo.userId !== userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    await this.CommentModel.findByIdAndUpdate(id, dto);

    return;
  }
}
