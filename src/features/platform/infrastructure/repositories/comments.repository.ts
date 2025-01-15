import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentDocument, CommentModelType } from '../../domain/comment.entity';
import { TInteraction } from '../../dto/interaction-dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getInteractions(id: Types.ObjectId): Promise<TInteraction[] | null> {
    const commentDocument = await this.CommentModel.findOne({ _id: id });

    if (!commentDocument) {
      return null;
    }

    return commentDocument.interactions;
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }
}
