import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PaginatedViewDto } from '@core/dto/base.paginated.view-dto';
import {
  GetPostsQueryParams,
  PostsQueryRepository,
} from '../infrastructure/queries/posts.query-repository';
import { PostOutputDto } from './output-dto/post.output-dto';
import { PostsService } from '../application/posts.service';
import { CreatePostInputDto } from './input-dto/blogs.input-dto';
import { UpdatePostDto } from '../dto/post-dto';
import { CommentsQueryRepository } from '../infrastructure/queries/comments.query-repository';
import { Types } from 'mongoose';
import { CommentOutputDto } from './output-dto/comment.output-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    return this.postsQueryRepository.getAllPosts(query);
  }

  @Post()
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
  ): Promise<PaginatedViewDto<CommentOutputDto[]>> {
    return this.commentsQueryRepository.getCommentsByPostId(postId, query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<PostOutputDto> {
    const post = await this.postsQueryRepository.getById(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<boolean> {
    const isUpdated = await this.postsService.updatePost(id, updatePostDto);

    if (!isUpdated) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<boolean> {
    const isDeleted = await this.postsService.deletePostById(id);

    if (!isDeleted) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return;
  }
}
