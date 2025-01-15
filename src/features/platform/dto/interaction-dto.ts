import { Types } from 'mongoose';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type TInteraction = {
  userId: Types.ObjectId;
  login: string;
  action: LikeStatus;
  addedAt: Date;
};

export type TLikeInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export type TInteractionView = Omit<TInteraction, 'action'>;
