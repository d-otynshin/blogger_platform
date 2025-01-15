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
import { BlogOutputDto } from './output-dto/blog.output-dto';
import { BlogsQueryRepository } from '../infrastructure/queries/blogs.query-repository';
import { GetPostsQueryParams } from '../infrastructure/queries/posts.query-repository';
import { PostOutputDto } from './output-dto/post.output-dto';
import { CreatePostByBlogIdInputDto } from './input-dto/posts.input-dto';

import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

/* From Accounts module */
import { BasicAuthGuard } from '../../accounts/guards/basic/basic-auth.guard';
import { CreateBlogInputDto, UpdateBlogInputDto } from './input-dto/blogs.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
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
  // TODO: move to separate command
  async getAllPosts(
    @Param('blogId') blogId: Types.ObjectId,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    const posts = await this.blogsQueryRepository.getAllPosts(blogId, query);
    if (!posts) throw NotFoundDomainException.create('Blog not found');

    return posts;
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  // TODO: move to separate command
  async createPostByBlogId(
    @Param('blogId') blogId: Types.ObjectId,
    @Body() createPostDto: CreatePostByBlogIdInputDto,
  ): Promise<PostOutputDto> {
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
  async getById(@Param('id') id: string): Promise<BlogOutputDto> {
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
