import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { TCommentator } from '../dto/comment-dto';
import { TInteraction } from '../dto/interaction-dto';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Object, required: true })
  commentatorInfo: TCommentator;

  @Prop({ type: [Object], required: false })
  interactions: TInteraction[];

  static createInstance(dto: {
    content: string;
    commentatorInfo: { userId: string; userLogin: string };
    postId: string;
  }): CommentDocument {
    const comment = new this();

    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.interactions = [];
    comment.commentatorInfo = dto.commentatorInfo;
    comment.createdAt = new Date();

    return comment as CommentDocument;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
