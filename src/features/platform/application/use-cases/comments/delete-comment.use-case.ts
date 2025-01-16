import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../../domain/comment.entity';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';

export class DeleteCommentCommand {
  constructor(
    public id: string,
    public userId: Types.ObjectId,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async execute({ id, userId }: DeleteCommentCommand) {
    if (!Types.ObjectId.isValid(id)) {
      throw NotFoundDomainException.create('Comment not found', 'commentId');
    }

    const commentDocument = await this.CommentModel.findOne({ _id: id });
    if (!commentDocument) {
      throw NotFoundDomainException.create('Comment not found', 'commentId');
    }

    if (commentDocument.commentatorInfo.userId !== userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    const deleteResult = await this.CommentModel.deleteOne({ _id: id });

    if (deleteResult.deletedCount !== 1) {
      throw NotFoundDomainException.create('Comment not found', 'commentId');
    }

    return;
  }
}
