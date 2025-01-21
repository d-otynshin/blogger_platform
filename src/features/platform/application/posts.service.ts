import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdatePostDto } from '../dto/post-dto';
import { CreatePostInputDto } from '../api/input-dto/posts.input-dto';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';
import { BlogsSQLRepository } from '../infrastructure/repositories/blogs-sql.repository';
import { PostsSQLRepository } from '../infrastructure/repositories/posts-sql.repository';
import { PostSQLOutputDto } from '../api/output-dto/post-sql.output-dto';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsSQLRepository,
    private blogsRepository: BlogsSQLRepository,
  ) {}
  async createPost(dto: CreatePostInputDto): Promise<PostSQLOutputDto> {
    const blogData = await this.blogsRepository.findById(dto.blogId);

    if (!blogData) {
      throw NotFoundDomainException.create('Blog not found', 'blogId');
    }

    const createdPostData = this.postsRepository.createInstance(dto.blogId, {
      title: dto.title,
      content: dto.content,
      shortDescription: dto.shortDescription,
      blogName: blogData.name,
    });

    return PostSQLOutputDto.mapToView(createdPostData);
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<void> {
    const postData = await this.postsRepository.findById(id);

    if (!postData) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    await this.postsRepository.updateById(id, dto);

    return;
  }

  async deletePostById(id: string): Promise<void> {
    const postData = await this.postsRepository.findById(id);

    if (!postData) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    await this.postsRepository.delete(id);

    return;
  }
}
