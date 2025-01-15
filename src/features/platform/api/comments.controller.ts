import { Types } from 'mongoose';
import {
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Controller,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/use-cases/comments/update-comment.use-case';
import {
  CommentInteractionInputDto,
  CommentsInputDto,
} from './input-dto/comments.input-dto';
import { DeleteCommentCommand } from '../application/use-cases/comments/delete-comment.use-case';
import { CommentsService } from '../application/comments.service';
import {
  ExtractUserFromRequest,
  UserContextDto,
} from '../../../core/decorators/extract-user-from-request';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsService: CommentsService,
  ) {}

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') id: Types.ObjectId,
    @Body() commentsDto: CommentsInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateCommentCommand(id, commentsDto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('id') id: Types.ObjectId): Promise<void> {
    return this.commandBus.execute(new DeleteCommentCommand(id));
  }

  @Put(':id/like-status')
  async interactComment(
    @Param('id') id: Types.ObjectId,
    @Body() interactionDto: CommentInteractionInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    // TODO: move to separate command handler
    const isUpdated = await this.commentsService.interact({
      commentId: id,
      userId: user.id,
      login: user.login,
      action: interactionDto.likeStatus,
    });

    if (!isUpdated) {
      throw BadRequestDomainException.create(
        'Invalid interaction',
        'like-status',
      );
    }

    return;
  }
}
