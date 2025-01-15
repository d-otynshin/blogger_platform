import { Types } from 'mongoose';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type TInteraction = {
  userId: Types.ObjectId;
  login: string;
  action: Omit<LikeStatus, 'None'>;
  addedAt: Date;
};

export type TLikeInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};
