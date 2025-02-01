import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Controller,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CommentOutputDto } from './output-dto/comment.output-dto';

import { PostsService } from '../application/posts.service';
import {
  CreatePostInputDto,
  PostInteractionInputDto,
  UpdatePostInputDto,
} from './input-dto/posts.input-dto';
import { CommentsQueryRepository } from '../infrastructure/queries/comments.query-repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import {
  ExtractUserFromRequest,
  ExtractUserIfExistsFromRequest,
  UserContextDto,
} from '../../../core/decorators/extract-user-from-request';
import { BasicAuthGuard } from '../../accounts/guards/basic/basic-auth.guard';
import {
  JwtAuthGuard,
  JwtOptionalAuthGuard,
} from '../../accounts/guards/bearer/jwt-auth.guard';
import { UpdateLikePostCommand } from '../application/use-cases/posts/update-like-post.use-case';
import { CommentsInputDto } from './input-dto/comments.input-dto';
import { CreateCommentCommand } from '../application/use-cases/comments/create-comment.use-case';
import { PostSQLOutputDto } from './output-dto/post-sql.output-dto';
import { PostsQueryRepository } from '../infrastructure/queries/posts.query-repository';
import { GetPostsQueryParams } from '../infrastructure/queries/get-posts-query-params';
import { Comment } from '../domain/comment.entity';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostSQLOutputDto[]>> {
    return this.postsQueryRepository.getAllPosts(query, user?.id);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() createPostDto: CreatePostInputDto,
  ): Promise<PostSQLOutputDto> {
    return this.postsService.createPost(createPostDto);
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PostSQLOutputDto> {
    const userId = user?.id;

    return this.postsQueryRepository.getById(id, userId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostInputDto,
  ): Promise<void> {
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePostById(id);
  }

  @Get(':postId/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getAllPosts(
    @Param('postId') postId: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<CommentOutputDto[]>> {
    return this.commentsQueryRepository.getCommentsByPostId(
      postId,
      query,
      user?.id,
    );
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CommentsInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    const comment: Comment = await this.commandBus.execute(
      new CreateCommentCommand(postId, createCommentDto, user),
    );

    return CommentOutputDto.mapToView(comment);
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikePost(
    @Param('id') id: string,
    @Body() postInteractionDto: PostInteractionInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateLikePostCommand(id, user.id, postInteractionDto),
    );
  }
}
