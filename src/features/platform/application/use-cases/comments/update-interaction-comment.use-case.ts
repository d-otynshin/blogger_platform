import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../../domain/comment.entity';
import { CommentInteractionDto } from '../../../dto/comment-dto';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';

export class UpdateInteractionCommentCommand {
  constructor(public dto: CommentInteractionDto) {}
}

@CommandHandler(UpdateInteractionCommentCommand)
export class UpdateInteractionCommentUseCase
  implements ICommandHandler<UpdateInteractionCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ dto }: UpdateInteractionCommentCommand) {
    const commentDocument = await this.CommentModel.findOneAndUpdate(
      { id: dto.commentId, 'interactions.id': dto.userId },
      {
        $set: {
          'interactions.$.updatedAt': new Date(),
          'interactions.$.action': dto.action,
        },
      },
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
