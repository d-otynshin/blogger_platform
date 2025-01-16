import { CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { TInteraction } from '../dto/interaction-dto';
import { CommentsRepository } from '../infrastructure/repositories/comments.repository';
import { CommentInteractionDto } from '../dto/comment-dto';
import { CreateInteractionCommentCommand } from './use-cases/comments/create-interaction-comment.use-case';
import { UpdateInteractionCommentCommand } from './use-cases/comments/update-interaction-comment.use-case';
import { ForbiddenDomainException, NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';
import { Types } from 'mongoose';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private commandBus: CommandBus,
  ) {}

  async interact(dto: CommentInteractionDto): Promise<null | void> {
    // TODO: create decorator?
    if (!Types.ObjectId.isValid(dto.commentId)) {
      throw NotFoundDomainException.create('Comment not found', 'commentId');
    }

    const interactions = await this.commentsRepository.getInteractions(
      dto.commentId,
    );

    if (!interactions) {
      throw NotFoundDomainException.create('No interactions found.');
    }

    const interaction = interactions.find(
      (interaction: TInteraction): boolean => interaction.userId === dto.userId,
    );

    if (!interaction) {
      return this.commandBus.execute(new CreateInteractionCommentCommand(dto));
    }

    if (interaction.action === dto.action) {
      return;
    }

    if (interaction.userId !== dto.userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    return this.commandBus.execute(new UpdateInteractionCommentCommand(dto));
  }
}
