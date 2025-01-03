import { TInteraction } from './interaction-dto';

export type TCommentator = {
  userId: string;
  userLogin: string;
};

export class CreateCommentDto {
  content: string;
  commentatorInfo: TCommentator;
  interactions: TInteraction[];
  postId: string;
  createdAt: Date;
}

export class UpdateCommentDto {
  content: string;
}
