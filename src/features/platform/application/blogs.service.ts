import { isValidObjectId, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto, UpdateBlogDto } from '../dto/blog-dto';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { BlogsRepository } from '../infrastructure/repositories/blogs.repository';
import { BlogOutputDto } from '../api/output-dto/blog.output-dto';
import { PostOutputDto } from '../api/output-dto/post.output-dto';
import { Post, PostModelType } from '../domain/post.entity';
import { CreatePostByBlogIdInputDto } from '../api/input-dto/blogs.input-dto';
import { PostsRepository } from '../infrastructure/repositories/posts.repository';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}
  async createBlog(dto: CreateBlogDto): Promise<BlogOutputDto> {
    const createdBlog = this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(createdBlog);

    return BlogOutputDto.mapToView(createdBlog);
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<boolean> {
    const updatedBlog = await this.BlogModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updatedBlog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return true;
  }

  async deleteBlogById(id: string): Promise<boolean | null> {
    const deletedBlog = await this.BlogModel.findByIdAndDelete(id);

    if (!deletedBlog) {
      return null;
    }

    return true;
  }

  async createPostByBlogId(
    blogId: Types.ObjectId,
    dto: CreatePostByBlogIdInputDto,
  ): Promise<PostOutputDto | null> {
    if (!isValidObjectId(blogId)) {
      return null;
    }

    const blog = await this.blogsRepository.findById(blogId);
    if (!blog) return null;

    const postPojo = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogName: blog.name,
    };

    const createdPost = this.PostModel.createInstance(blogId, postPojo);

    await this.postsRepository.save(createdPost);

    return PostOutputDto.mapToView(createdPost);
  }
}
