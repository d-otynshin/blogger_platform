import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../../domain/comment.entity';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exceptions';

export class DeleteCommentCommand {
  constructor(public id: Types.ObjectId) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async execute({ id }: DeleteCommentCommand) {
    const deleteResult = await this.CommentModel.deleteOne(id);

    if (deleteResult.deletedCount !== 1) {
      throw NotFoundDomainException.create('Comment not found', 'commentId');
    }

    return;
  }
}
