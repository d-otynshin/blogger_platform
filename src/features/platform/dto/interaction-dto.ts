export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type TInteraction = {
  userId: string;
  login: string;
  action: LikeStatus.Like | LikeStatus.Dislike;
  addedAt: Date;
};

export type TLikeInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};
