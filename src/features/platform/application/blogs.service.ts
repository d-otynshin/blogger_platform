import { Injectable } from '@nestjs/common';
import { BlogSQLOutputDto } from '../api/output-dto/blog.output-dto';
import {
  CreatePostByBlogIdInputDto,
  UpdatePostByBlogIdDtoInputDto,
} from '../api/input-dto/posts.input-dto';
import {
  CreateBlogInputDto,
  UpdateBlogInputDto,
} from '../api/input-dto/blogs.input-dto';
import { BlogsSQLRepository } from '../infrastructure/repositories/blogs-sql.repository';
import { PostsSQLRepository } from '../infrastructure/repositories/posts-sql.repository';
import { PostSQLOutputDto } from '../api/output-dto/post-sql.output-dto';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsSQLRepository,
    private postsRepository: PostsSQLRepository,
  ) {}
  async createBlog(dto: CreateBlogInputDto): Promise<BlogSQLOutputDto> {
    const createdBlog = await this.blogsRepository.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    return BlogSQLOutputDto.mapToView(createdBlog);
  }

  async updateBlog(id: string, dto: UpdateBlogInputDto): Promise<boolean> {
    return this.blogsRepository.updateById(id, dto);
  }

  async deleteBlogById(id: string): Promise<boolean> {
    return this.blogsRepository.delete(id);
  }

  async createPostByBlogId(
    blogId: string,
    dto: CreatePostByBlogIdInputDto,
  ): Promise<PostSQLOutputDto | null> {
    const blogData = await this.blogsRepository.findById(blogId);
    if (!blogData) return null;

    const createdPost = await this.postsRepository.createInstance(blogId, {
      title: dto.title,
      content: dto.content,
      shortDescription: dto.shortDescription,
      blogName: blogData.name,
    });

    return PostSQLOutputDto.mapToView(createdPost);
  }

  async updatePostByBlogId(
    blogId: string,
    dto: UpdatePostByBlogIdDtoInputDto,
  ): Promise<PostSQLOutputDto | null> {
    const blogData = await this.blogsRepository.findById(blogId);
    if (!blogData) return null;

    const createdPost = await this.postsRepository.updateById(blogId, {
      title: dto.title,
      content: dto.content,
      shortDescription: dto.shortDescription,
    });

    return PostSQLOutputDto.mapToView(createdPost);
  }

  async deletePostByBlogId(blogId: string, postId: string) {
    const blogData = await this.blogsRepository.findById(blogId);
    console.log('blogData', blogData);
    if (!blogData) return null;

    const postData = await this.postsRepository.findById(postId);
    console.log('postData', postData);
    if (!postData) return null;

    return this.postsRepository.delete(postId);
  }
}
