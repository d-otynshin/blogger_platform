import { CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { TInteraction } from '../dto/interaction-dto';
import { CommentsRepository } from '../infrastructure/repositories/comments.repository';
import { CommentInteractionDto } from '../dto/comment-dto';
import { CreateInteractionCommentCommand } from './use-cases/comments/create-interaction-comment.use-case';
import { UpdateInteractionCommentCommand } from './use-cases/comments/update-interaction-comment.use-case';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private commandBus: CommandBus,
  ) {}

  async interact(dto: CommentInteractionDto): Promise<null | void> {
    const interactions = await this.commentsRepository.getInteractions(
      dto.commentId,
    );
    if (!interactions) return null;

    const interaction = interactions.find(
      (interaction: TInteraction): boolean => interaction.userId === dto.userId,
    );

    if (!interaction) {
      return this.commandBus.execute(new CreateInteractionCommentCommand(dto));
    }

    if (interaction.action === dto.action) {
      return;
    }

    return this.commandBus.execute(new UpdateInteractionCommentCommand(dto));
  }
}
