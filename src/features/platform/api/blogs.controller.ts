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
import { Types } from 'mongoose';
import { BlogsService } from '../application/blogs.service';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogOutputDto } from './output-dto/blog.output-dto';
import { BlogsQueryRepository } from '../infrastructure/queries/blogs.query-repository';
import { CreateBlogDto, UpdateBlogDto } from '../dto/blog-dto';
import { GetPostsQueryParams } from '../infrastructure/queries/posts.query-repository';
import { PostOutputDto } from './output-dto/post.output-dto';
import { CreatePostByBlogIdInputDto } from './input-dto/blogs.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogOutputDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
  ): Promise<BlogOutputDto> {
    return this.blogsService.createBlog(createBlogDto);
  }

  @Get(':blogId/posts')
  async getAllPosts(
    @Param('blogId') blogId: Types.ObjectId,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    const posts = await this.blogsQueryRepository.getAllPosts(blogId, query);
    if (!posts) throw new NotFoundException('blog not found');

    return posts;
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @Param('blogId') blogId: Types.ObjectId,
    @Body() createPostDto: CreatePostByBlogIdInputDto,
  ): Promise<PostOutputDto> {
    const createdPost = await this.blogsService.createPostByBlogId(
      blogId,
      createPostDto,
    );

    if (!createdPost) {
      throw new NotFoundException('Blog not found');
    }

    return createdPost;
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogOutputDto> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return blog;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<boolean> {
    const isUpdated = await this.blogsService.updateBlog(id, updateBlogDto);

    if (!isUpdated) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<boolean> {
    const isDeleted = await this.blogsService.deleteBlogById(id);

    if (!isDeleted) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return;
  }
}
