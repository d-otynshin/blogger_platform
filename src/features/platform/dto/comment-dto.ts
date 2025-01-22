import { LikeStatus } from './interaction-dto';

export type TCommentator = {
  userId: string;
  userLogin: string;
};

export class CreateCommentDto {
  content: string;
  commentatorId: string;
  postId: string;
}

export class UpdateCommentDto {
  content: string;
}

export class CommentInteractionDto {
  commentId: string;
  userId: string;
  action: LikeStatus;
}
