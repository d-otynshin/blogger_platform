import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInteractionDto } from '../../../dto/comment-dto';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { TInteraction } from '../../../dto/interaction-dto';
import { CommentsSQLRepository } from '../../../infrastructure/repositories/comments-sql.repository';

export class CreateInteractionCommentCommand {
  constructor(public dto: CommentInteractionDto) {}
}

@CommandHandler(CreateInteractionCommentCommand)
export class CreateInteractionCommentUseCase
  implements ICommandHandler<CreateInteractionCommentCommand>
{
  constructor(private commentsRepository: CommentsSQLRepository) {}

  async execute({ dto }: CreateInteractionCommentCommand) {
    const createdInteraction: TInteraction = {
      userId: dto.userId,
      login: dto.login,
      action: dto.action,
      addedAt: new Date(),
    };

    // const commentDocument = await this.CommentModel.findByIdAndUpdate(
    //   dto.commentId,
    //   { $push: { interactions: createdInteraction } },
    //   { new: true },
    // );

    const commentData = createdInteraction;

    if (!commentData) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    return;
  }
}
