import { Types } from 'mongoose';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { BlogsService } from '../application/blogs.service';
import { GetBlogsQueryParams } from './input-dto/helpers/get-blogs-query-params.input-dto';
import { BlogOutputDto, BlogSQLOutputDto } from './output-dto/blog.output-dto';
import { CreatePostByBlogIdInputDto } from './input-dto/posts.input-dto';

import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

/* From Accounts module */
import { BasicAuthGuard } from '../../accounts/guards/basic/basic-auth.guard';
import {
  CreateBlogInputDto,
  UpdateBlogInputDto,
} from './input-dto/blogs.input-dto';
import { ExtractUserIfExistsFromRequest } from '../../../core/decorators/extract-user-from-request';
import { UserContextDto } from '../../accounts/dto/auth.dto';
import { JwtOptionalAuthGuard } from '../../accounts/guards/bearer/jwt-auth.guard';
import { BlogsSQLQueryRepository } from '../infrastructure/queries/blogs-sql.query-repository';
import { PostSQLOutputDto } from './output-dto/post-sql.output-dto';
import { GetPostsQueryParams } from '../infrastructure/queries/get-posts-query-params';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsSQLQueryRepository,
  ) {}
  @Get()
  // TODO: move to separate command
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogOutputDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  // TODO: move to separate command
  async createBlog(
    @Body() createBlogDto: CreateBlogInputDto,
  ): Promise<BlogOutputDto> {
    return this.blogsService.createBlog(createBlogDto);
  }

  @Get(':blogId/posts')
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

  @Post(':blogId/posts')
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

  @Get(':id')
  // TODO: move to separate command
  async getById(@Param('id') id: string): Promise<BlogSQLOutputDto> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw NotFoundDomainException.create(`Blog with ID ${id} not found`);
    }

    return blog;
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogInputDto,
  ): Promise<boolean> {
    // TODO: move to separate command
    const isUpdated = await this.blogsService.updateBlog(id, updateBlogDto);

    if (!isUpdated) {
      throw NotFoundDomainException.create(`Blog with ID ${id} not found`);
    }

    return;
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  // TODO: move to separate command
  async deleteBlog(@Param('id') id: string): Promise<boolean> {
    const isDeleted = await this.blogsService.deleteBlogById(id);

    if (!isDeleted) {
      throw NotFoundDomainException.create(`Blog with ID ${id} not found`);
    }

    return;
  }
}
