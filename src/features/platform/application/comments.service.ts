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
    const interactions = await this.commentsRepository.getInteractions(
      dto.commentId,
    );

    if (!interactions) {
      throw NotFoundDomainException.create('No interactions found.');
    }

    const myInteraction = interactions.find(
      (interaction): boolean => interaction.user.id === dto.userId,
    );

    if (!myInteraction) {
      return this.commandBus.execute(new CreateInteractionCommentCommand(dto));
    }

    if (myInteraction.action === dto.action) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (myInteraction.user_id !== dto.userId) {
      throw ForbiddenDomainException.create('Forbidden');
    }

    return this.commandBus.execute(new UpdateInteractionCommentCommand(dto));
  }
}
