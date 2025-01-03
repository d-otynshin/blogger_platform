import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { TCommentator } from '../dto/comment-dto';
import { TInteraction } from '../dto/interaction-dto';
// import { CreateCommentDto } from '../dto/comment-dto';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Object, required: true })
  commentatorInfo: TCommentator;

  @Prop({ type: [Object], required: true })
  interactions: TInteraction[];

  // static createInstance(dto: CreateCommentDto): CommentDocument {
  //   const post = new Comment();
  //   post.content = dto.content;
  //   post.postId = dto.postId;
  //   post.interactions = [];
  //   post.commentatorInfo = null;
  //   post.createdAt = new Date();
  //
  //   return post as PostDocument;
  // }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
