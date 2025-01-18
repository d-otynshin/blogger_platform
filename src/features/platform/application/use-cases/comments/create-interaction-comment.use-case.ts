import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../../domain/comment.entity';
import { CommentInteractionDto } from '../../../dto/comment-dto';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { TInteraction } from '../../../dto/interaction-dto';
import { Types } from 'mongoose';

export class CreateInteractionCommentCommand {
  constructor(public dto: CommentInteractionDto) {}
}

@CommandHandler(CreateInteractionCommentCommand)
export class CreateInteractionCommentUseCase
  implements ICommandHandler<CreateInteractionCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async execute({ dto }: CreateInteractionCommentCommand) {
    const createdInteraction: TInteraction = {
      userId: new Types.ObjectId(dto.userId),
      login: dto.login,
      action: dto.action,
      addedAt: new Date(),
    };

    const commentDocument = await this.CommentModel.findByIdAndUpdate(
      dto.commentId,
      { $push: { interactions: createdInteraction } },
      { new: true },
    );

    if (!commentDocument) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    return;
  }
}
