export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type TInteraction = {
  userId: string;
  login: string;
  action: LikeStatus;
  addedAt: Date;
};

export type TInteractionView = Omit<TInteraction, 'action'>;
