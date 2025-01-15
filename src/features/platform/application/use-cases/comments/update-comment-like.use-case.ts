import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Comment, CommentModelType } from '../../../domain/comment.entity';
import {
  BadRequestDomainException,
  ForbiddenDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CommentInteractionInputDto } from '../../../api/input-dto/comments.input-dto';
import { CommentsRepository } from '../../../infrastructure/repositories/comments.repository';

export class UpdateCommentLikeCommand {
  constructor(
    public commentId: Types.ObjectId,
    public userId: Types.ObjectId,
    public dto: CommentInteractionInputDto,
  ) {}
}

@CommandHandler(UpdateCommentLikeCommand)
export class UpdateCommentLikeUseCase
  implements ICommandHandler<UpdateCommentLikeCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute(command: UpdateCommentLikeCommand) {
    const { commentId, userId, dto } = command;

    // Retrieve the comment document by its commentId
    const commentDocument = await this.CommentModel.findById(commentId);
    if (!commentDocument) {
      throw BadRequestDomainException.create('Invalid comment', 'content');
    }

    // Retrieve the interaction by userId
    const interaction = commentDocument.interactions.find(
      (interaction) => interaction.userId === userId,
    );

    // Verify that the user is authorized to update the comment
    if (interaction.userId !== userId) {
      throw ForbiddenDomainException.create('Forbidden', 'userId');
    }

    // Update the existing one with the new like status
    commentDocument.interactions.push({
      ...interaction,
      addedAt: new Date(),
      action: dto.likeStatus,
    });

    // Save the updated comment document to the database
    await this.commentsRepository.save(commentDocument);

    return;
  }
}
