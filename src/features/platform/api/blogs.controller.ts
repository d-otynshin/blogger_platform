import {
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Controller,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { BlogsService } from '../application/blogs.service';
import { GetBlogsQueryParams } from './input-dto/helpers/get-blogs-query-params.input-dto';
import { BlogsSQLQueryRepository } from '../infrastructure/queries/blogs-sql.query-repository';
import {
  CreatePostByBlogIdInputDto,
  UpdatePostByBlogIdDtoInputDto,
} from './input-dto/posts.input-dto';
import { BlogOutputDto, BlogSQLOutputDto } from './output-dto/blog.output-dto';
import {
  CreateBlogInputDto,
  UpdateBlogInputDto,
} from './input-dto/blogs.input-dto';

import { BasicAuthGuard } from '../../accounts/guards/basic/basic-auth.guard';
import { PostSQLOutputDto } from './output-dto/post-sql.output-dto';
import { GetPostsQueryParams } from '../infrastructure/queries/get-posts-query-params';

import { UserContextDto } from '../../accounts/dto/auth.dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { JwtOptionalAuthGuard } from '../../accounts/guards/bearer/jwt-auth.guard';

import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';
import { ExtractUserIfExistsFromRequest } from '../../../core/decorators/extract-user-from-request';

@Controller()
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsSQLQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get('sa/blogs')
  // TODO: move to separate command
  async getAdminAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogOutputDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get('blogs')
  // TODO: move to separate command
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogOutputDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Post('sa/blogs')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  // TODO: move to separate command
  async createBlog(
    @Body() createBlogDto: CreateBlogInputDto,
  ): Promise<BlogOutputDto> {
    return this.blogsService.createBlog(createBlogDto);
  }

  @Get('blogs/:blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  // TODO: move to separate command
  async getAllPosts(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostSQLOutputDto[]>> {
    const userId = user?.id;

    const paginatedPosts = await this.blogsQueryRepository.getAllPosts(
      blogId,
      query,
      userId,
    );

    if (!paginatedPosts) throw NotFoundDomainException.create('Blog not found');

    return paginatedPosts;
  }

  @Post('sa/blogs/:blogId/posts')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  // TODO: move to separate command
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() createPostDto: CreatePostByBlogIdInputDto,
  ): Promise<PostSQLOutputDto> {
    const createdPost = await this.blogsService.createPostByBlogId(
      blogId,
      createPostDto,
    );

    if (!createdPost) {
      throw NotFoundDomainException.create('Blog not found');
    }

    return createdPost;
  }

  @Put('sa/blogs/:blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  // TODO: move to separate command
  async updatePostByBlogId(
    @Param('blogId') blogId: string,
    @Body() dto: UpdatePostByBlogIdDtoInputDto,
  ): Promise<PostSQLOutputDto> {
    const updatedPost = await this.blogsService.updatePostByBlogId(blogId, dto);

    if (!updatedPost) {
      throw NotFoundDomainException.create('Blog not found');
    }

    return updatedPost;
  }

  @Delete('sa/blogs/:blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  // TODO: move to separate command
  async deletePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<PostSQLOutputDto> {
    console.log('postId', postId);
    console.log('blogId', blogId);
    const isDeleted = await this.blogsService.deletePostByBlogId(
      blogId,
      postId,
    );

    if (!isDeleted) {
      throw NotFoundDomainException.create('Post not found');
    }

    return;
  }

  @Get('blogs/:id')
  // TODO: move to separate command
  async getById(@Param('id') id: string): Promise<BlogSQLOutputDto> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw NotFoundDomainException.create(`Blog with ID ${id} not found`);
    }

    return blog;
  }

  @Put('sa/blogs/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() dto: UpdateBlogInputDto,
  ): Promise<boolean> {
    // TODO: move to separate command
    const isUpdated = await this.blogsService.updateBlog(id, dto);

    if (!isUpdated) {
      throw NotFoundDomainException.create(`Blog with ID ${id} not found`);
    }

    return;
  }

  @Delete('sa/blogs/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  // TODO: move to separate command
  async deleteBlog(@Param('id') id: string): Promise<boolean> {
    const isDeleted = await this.blogsService.deleteBlogById(id);

    if (!isDeleted) {
      throw NotFoundDomainException.create(`Blog with id ${id} not found`);
    }

    return;
  }
}
