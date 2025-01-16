import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { TCommentator } from '../dto/comment-dto';
import { TInteraction } from '../dto/interaction-dto';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  postId: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Object, required: true })
  commentatorInfo: TCommentator;

  @Prop({ type: [Object], required: true })
  interactions: TInteraction[];

  static createInstance(dto: {
    content: string;
    commentatorInfo: { userId: Types.ObjectId; userLogin: string };
    postId: Types.ObjectId;
  }): CommentDocument {
    const comment = new this();

    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.interactions = [];
    comment.commentatorInfo = null;
    comment.createdAt = new Date();

    return comment as CommentDocument;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
