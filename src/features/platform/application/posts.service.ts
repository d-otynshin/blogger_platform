import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostsRepository } from '../infrastructure/repositories/posts.repository';
import { PostOutputDto } from '../api/output-dto/post.output-dto';
import { UpdatePostDto } from '../dto/post-dto';
import { CreatePostInputDto } from '../api/input-dto/blogs.input-dto';
import { BlogsRepository } from '../infrastructure/repositories/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}
  async createPost(dto: CreatePostInputDto): Promise<PostOutputDto> {
    const blog = await this.blogsRepository.findById(dto.blogId);

    const postPojo = {
      title: dto.title,
      content: dto.content,
      shortDescription: dto.shortDescription,
      blogName: blog.name,
    };

    const createdPost = this.PostModel.createInstance(dto.blogId, postPojo);

    await this.postsRepository.save(createdPost);

    return PostOutputDto.mapToView(createdPost);
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<boolean> {
    const updatedPost = await this.PostModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updatedPost) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return true;
  }

  async deletePostById(id: string): Promise<boolean> {
    const deletedBlog = await this.PostModel.findByIdAndDelete(id);

    if (!deletedBlog) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return true;
  }
}
