import { Types } from 'mongoose';
import {
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Controller,
  Get,
  UseGuards,
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
  ExtractUserIfExistsFromRequest,
  UserContextDto,
} from '../../../core/decorators/extract-user-from-request';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';
import { JwtAuthGuard, JwtOptionalAuthGuard } from '../../accounts/guards/bearer/jwt-auth.guard';
import { CommentsQueryRepository } from '../infrastructure/queries/comments.query-repository';
import { CommentOutputDto } from './output-dto/comment.output-dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCommentById(
    @Param('id') commentId: Types.ObjectId,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<CommentOutputDto> {
    const userId = user?.id;

    return this.commentsQueryRepository.getCommentById(commentId, userId);
  }

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
  @UseGuards(JwtAuthGuard)
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
