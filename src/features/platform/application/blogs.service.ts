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
import { BlogsRepository } from '../infrastructure/repositories/blogs.repository';
import { PostsRepository } from '../infrastructure/repositories/posts.repository';
import { PostSQLOutputDto } from '../api/output-dto/post-sql.output-dto';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
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

    const post = await this.postsRepository.findById(createdPost.id);

    return PostSQLOutputDto.mapToView(post);
  }

  async updatePostByBlogId(
    blogId: string,
    postId: string,
    dto: UpdatePostByBlogIdDtoInputDto,
  ): Promise<boolean> {
    const blogData = await this.blogsRepository.findById(blogId);
    if (!blogData) return null;

    return this.postsRepository.updateById(postId, {
      title: dto.title,
      content: dto.content,
      shortDescription: dto.shortDescription,
    });
  }

  async deletePostByBlogId(blogId: string, postId: string) {
    const blog = await this.blogsRepository.findById(blogId);
    if (!blog) return null;

    const post = await this.postsRepository.findById(postId);
    if (!post) return null;

    return this.postsRepository.delete(postId);
  }
}
