import { CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CommentInteractionDto } from '../dto/comment-dto';
import { CreateInteractionCommentCommand } from './use-cases/comments/create-interaction-comment.use-case';
import { UpdateInteractionCommentCommand } from './use-cases/comments/update-interaction-comment.use-case';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { CommentsRepository } from '../infrastructure/repositories/comments.repository';

@Injectable()
export class CommentsService {
  constructor(
    private commandBus: CommandBus,
    private commentsRepository: CommentsRepository,
  ) {}

  async interact(dto: CommentInteractionDto): Promise<null | void> {
    const commentsInteractions = await this.commentsRepository.getInteractions(
      dto.commentId,
    );

    if (!commentsInteractions) {
      throw NotFoundDomainException.create('No interactions found.');
    }

    const userInteraction = commentsInteractions.find(
      (interaction): boolean => interaction.user.id === dto.userId,
    );

    if (!userInteraction) {
      return this.commandBus.execute(new CreateInteractionCommentCommand(dto));
    }

    if (userInteraction.action === dto.action) {
      return;
    }

    if (userInteraction.user.id !== dto.userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    return this.commandBus.execute(new UpdateInteractionCommentCommand(dto));
  }
}
