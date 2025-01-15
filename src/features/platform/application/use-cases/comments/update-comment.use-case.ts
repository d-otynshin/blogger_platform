import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { CommentsInputDto } from '../../../api/input-dto/comments.input-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../../domain/comment.entity';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';

export class UpdateCommentCommand {
  constructor(
    public id: Types.ObjectId,
    public dto: CommentsInputDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async execute({ id, dto }: UpdateCommentCommand) {
    const commentDocument = await this.CommentModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!commentDocument) {
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    return;
  }
}
