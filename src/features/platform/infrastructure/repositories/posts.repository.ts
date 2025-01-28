import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InteractionsRepository } from './interactions.repository';
import { CreatePostDto, UpdatePostDto } from '../../dto/post-dto';
import { Post } from '../../domain/post.entity';
import { Blog } from '../../domain/blog.entity';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private postsTypeOrmRepository: Repository<Post>,

    private interactionsRepository: InteractionsRepository,
  ) {}

  async createInstance(blogId: string, dto: CreatePostDto): Promise<Post> {
    const post: Post = this.postsTypeOrmRepository.create({
      title: dto.title,
      short_description: dto.shortDescription,
      content: dto.content,
      blog_name: dto.blogName,
      blog: { id: blogId } as Blog,
    });

    return this.postsTypeOrmRepository.save(post);
  }

  async findById(id: string) {
    return this.postsTypeOrmRepository.findOne({ where: { id }, relations: ['blog'] });
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await this.postsTypeOrmRepository.delete(id);

    return deleteResult.affected > 0;
  }

  async updateById(postId: string, dto: UpdatePostDto): Promise<boolean> {
    const updateResult = await this.postsTypeOrmRepository
      .createQueryBuilder()
      .update(Post)
      .set({
        title: dto.title,
        short_description: dto.shortDescription,
        content: dto.content,
      })
      .where('id = :id', { id: postId })
      .execute();

    return updateResult.affected > 0;
  }

  async createInteraction(postId: string, userId: string, action: string) {
    return this.interactionsRepository.createPostInteraction(
      postId,
      userId,
      action,
    );
  }

  async getInteractionsById(postId: string) {
    const post = await this.findById(postId);

    if (!post) {
      throw NotFoundDomainException.create('No comment found');
    }

    return this.interactionsRepository.getPostsInteractions(postId);
  }

  async updateInteractionById(
    postId: string,
    userId: string,
    action: string,
  ): Promise<boolean> {
    return this.interactionsRepository.updatePostsInteractionById(
      postId,
      userId,
      action,
    );
  }

  async deleteAll() {
    const result = await this.postsTypeOrmRepository.delete({});

    return result.affected > 0;
  }
}
