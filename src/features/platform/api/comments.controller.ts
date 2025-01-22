import {
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Controller,
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
import {
  JwtAuthGuard,
  JwtOptionalAuthGuard,
} from '../../accounts/guards/bearer/jwt-auth.guard';
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
    @Param('id') commentId: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<CommentOutputDto> {
    const userId = user?.id;

    return this.commentsQueryRepository.getCommentById(commentId, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') id: string,
    @Body() commentsDto: CommentsInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateCommentCommand(id, commentsDto, user.id),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteCommentCommand(id, user.id));
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async interactComment(
    @Param('id') id: string,
    @Body() interactionDto: CommentInteractionInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    // TODO: move to separate command handler
    return this.commentsService.interact({
      commentId: id,
      userId: user.id,
      action: interactionDto.likeStatus,
    });
  }
}
