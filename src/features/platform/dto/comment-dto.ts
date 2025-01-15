import { LikeStatus, TInteraction } from './interaction-dto';
import { Types } from 'mongoose';

export type TCommentator = {
  userId: Types.ObjectId;
  userLogin: string;
};

export class CreateCommentDto {
  content: string;
  commentatorInfo: TCommentator;
  interactions: TInteraction[];
  postId: Types.ObjectId;
  createdAt: Date;
}

export class UpdateCommentDto {
  content: string;
}

export class CommentInteractionDto {
  login: string;
  commentId: Types.ObjectId;
  userId: Types.ObjectId;
  action: Omit<LikeStatus, 'None'>;
}
