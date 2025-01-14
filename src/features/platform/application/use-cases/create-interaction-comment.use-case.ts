import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentInteractionDto } from '../../dto/comment-dto';
import { CommentsRepository } from '../../infrastructure/repositories/comments.repository';
import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';

export class CreateInteractionCommentCommand {
  constructor(public dto: CommentInteractionDto) {}
}

@CommandHandler(CreateInteractionCommentCommand)
export class CreateInteractionCommentUseCase
  implements ICommandHandler<CreateInteractionCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ dto }: CreateInteractionCommentCommand) {
    const createdInteraction = {
      id: dto.userId,
      action: dto.action,
      updatedAt: new Date(),
    };

    const commentDocument = await this.CommentModel.findByIdAndUpdate(
      dto.commentId,
      { $push: { interactions: createdInteraction } },
      { new: true },
    );

    await this.commentsRepository.save(commentDocument);

    if (!commentDocument) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    return;
  }
}
