import { Types } from 'mongoose';
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

import {
  GetPostsQueryParams,
  PostsQueryRepository,
} from '../infrastructure/queries/posts.query-repository';

import { PostOutputDto } from './output-dto/post.output-dto';
import { CommentOutputDto } from './output-dto/comment.output-dto';

import { PostsService } from '../application/posts.service';
import {
  CreatePostInputDto,
  PostInteractionInputDto,
} from './input-dto/posts.input-dto';
import { UpdatePostDto } from '../dto/post-dto';
import { CommentsQueryRepository } from '../infrastructure/queries/comments.query-repository';

/* From core module */
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import {
  ExtractUserFromRequest,
  ExtractUserIfExistsFromRequest,
  UserContextDto,
} from '../../../core/decorators/extract-user-from-request';

/* From Accounts module */
import { BasicAuthGuard } from '../../accounts/guards/basic/basic-auth.guard';
import { JwtAuthGuard } from '../../accounts/guards/bearer/jwt-auth.guard';
import { UpdateLikePostCommand } from '../application/use-cases/posts/update-like-post.use-case';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    const userId = user?.id;

    return this.postsQueryRepository.getAllPosts(query, userId);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() createPostDto: CreatePostInputDto,
  ): Promise<PostOutputDto> {
    return this.postsService.createPost(createPostDto);
  }

  @Get(':postId/comments')
  async getAllPosts(
    @Param('postId') postId: Types.ObjectId,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<CommentOutputDto[]>> {
    const userId = user?.id;

    return this.commentsQueryRepository.getCommentsByPostId(
      postId,
      query,
      userId,
    );
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<PostOutputDto> {
    return this.postsQueryRepository.getById(id);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<void> {
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePostById(id);
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikePost(
    @Param('id') id: Types.ObjectId,
    @Body() postInteractionDto: PostInteractionInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateLikePostCommand(id, user.id, user.login, postInteractionDto),
    );
  }
}
