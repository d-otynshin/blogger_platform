import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InteractionsRepository } from './interactions.repository';
import { Post } from '../../domain/post.entity';
import { User } from '../../../accounts/domain/user.entity';
import { Comment } from '../../domain/comment.entity';
import { CreateCommentDto, UpdateCommentDto } from '../../dto/comment-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { LikeStatus } from '../../dto/interaction-dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private commentsTypeOrmRepository: Repository<Comment>,

    private interactionsRepository: InteractionsRepository,
  ) {}

  async createInstance(dto: CreateCommentDto) {
    const comment = this.commentsTypeOrmRepository.create({
      content: dto.content,
      commentator: { id: dto.commentatorId } as User,
      post: { id: dto.postId } as Post,
    });

    return this.commentsTypeOrmRepository.save(comment);
  }

  async getById(id: string) {
    return this.commentsTypeOrmRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.interactions', 'interaction')
      .leftJoinAndSelect('comment.commentator', 'commentator')
      .where('id = :id', { id })
      .getOne();
  }

  async updateInstance(commentId: string, dto: UpdateCommentDto) {
    const updateResult = await this.commentsTypeOrmRepository
      .createQueryBuilder()
      .update(Comment)
      .set({ content: dto.content })
      .where('id = :id', { commentId })
      .execute();

    return updateResult.affected > 0;
  }

  async deleteInstance(id: string) {
    const deleteResult = await this.commentsTypeOrmRepository.delete(id);

    return deleteResult.affected > 0;
  }

  async createInteraction(
    commentId: string,
    userId: string,
    action: LikeStatus,
  ) {
    return this.interactionsRepository.createCommentInteraction(
      commentId,
      userId,
      action,
    );
  }

  async getInteractions(commentId: string) {
    const comment = await this.getById(commentId);

    if (!comment) {
      throw NotFoundDomainException.create('No comment found');
    }

    return this.interactionsRepository.getCommentsInteractions(commentId);
  }

  async updateInteractionById(
    commentId: string,
    userId: string,
    action: LikeStatus,
  ): Promise<boolean> {
    return this.interactionsRepository.updateCommentsInteractionById(
      commentId,
      userId,
      action,
    );
  }

  async deleteAll() {
    const result = await this.commentsTypeOrmRepository.delete({});

    return result.affected > 0;
  }
}
