import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../../domain/comment.entity';
import { User } from '../../../accounts/domain/user.entity';
import { CommentsInteraction } from '../../domain/comments-interaction.entity';
import { PostsInteraction } from '../../domain/posts-interaction.entity';
import { Post } from '../../domain/post.entity';
import { LikeStatus } from '../../dto/interaction-dto';

@Injectable()
export class InteractionsRepository {
  constructor(
    @InjectRepository(CommentsInteraction)
    private commentsInteractionsTypeOrmRepository: Repository<CommentsInteraction>,

    @InjectRepository(PostsInteraction)
    private postsInteractionsTypeOrmRepository: Repository<PostsInteraction>,
  ) {}

  async createCommentInteraction(
    commentId: string,
    userId: string,
    action: string,
  ) {
    const interaction = this.commentsInteractionsTypeOrmRepository.create({
      comment: { id: commentId } as Comment,
      user: { id: userId } as User,
      action,
    });

    const commentsInteraction =
      await this.commentsInteractionsTypeOrmRepository.save(interaction);

    return Boolean(commentsInteraction);
  }

  async getCommentsInteractions(commentId: string) {
    return this.commentsInteractionsTypeOrmRepository.find({
      where: { comment: { id: commentId } },
    });
  }

  async updateCommentsInteractionById(
    commentId: string,
    userId: string,
    action: string,
  ): Promise<boolean> {
    const updateResult = await this.commentsInteractionsTypeOrmRepository
      .createQueryBuilder()
      .update(CommentsInteraction)
      .set({ action })
      .where('comment.id = :commentId', { commentId })
      .andWhere('user.id = :userId', { userId })
      .execute();

    return updateResult.affected > 0;
  }

  async createPostInteraction(
    postId: string,
    userId: string,
    action: LikeStatus,
  ) {
    const interaction = this.postsInteractionsTypeOrmRepository.create({
      post: { id: postId } as Post,
      user: { id: userId } as User,
      action,
    });

    console.log('CREATE POST INTERACTION:', interaction);

    const postInteraction =
      await this.postsInteractionsTypeOrmRepository.save(interaction);

    return Boolean(postInteraction);
  }

  async getPostsInteractions(postId: string) {
    return this.postsInteractionsTypeOrmRepository.find({
      where: { post: { id: postId } },
    });
  }

  async updatePostsInteractionById(
    postId: string,
    userId: string,
    action: string,
  ): Promise<boolean> {
    const updateResult = await this.postsInteractionsTypeOrmRepository
      .createQueryBuilder()
      .update(CommentsInteraction)
      .set({ action })
      .where('post.id = :postId', { postId })
      .andWhere('user.id = :userId', { userId })
      .execute();

    return updateResult.affected > 0;
  }
}
