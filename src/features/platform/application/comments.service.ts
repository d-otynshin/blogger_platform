import { Types } from 'mongoose';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { TInteraction } from '../dto/interaction-dto';
import { CommentInteractionDto } from '../dto/comment-dto';
import { CreateInteractionCommentCommand } from './use-cases/comments/create-interaction-comment.use-case';
import { UpdateInteractionCommentCommand } from './use-cases/comments/update-interaction-comment.use-case';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { CommentsSQLRepository } from '../infrastructure/repositories/comments-sql.repository';

@Injectable()
export class CommentsService {
  constructor(
    private commandBus: CommandBus,
    private commentsRepository: CommentsSQLRepository,
  ) {}

  async interact(dto: CommentInteractionDto): Promise<null | void> {
    const interactions = await this.commentsRepository.getInteractions(
      dto.commentId,
    );

    if (!interactions) {
      throw NotFoundDomainException.create('No interactions found.');
    }

    const interaction = interactions.find(
      (interaction): boolean => interaction.user_id === dto.userId,
    );

    if (!interaction) {
      return this.commandBus.execute(new CreateInteractionCommentCommand(dto));
    }

    if (interaction.action === dto.action) {
      return;
    }

    if (interaction.user_id !== dto.userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    return this.commandBus.execute(new UpdateInteractionCommentCommand(dto));
  }
}
