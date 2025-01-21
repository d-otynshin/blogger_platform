import { LikeStatus } from './interaction-dto';

export class CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogName: string;
}

export class UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
}

export class PostInteractionDto {
  login: string;
  postId: string;
  userId: string;
  action: LikeStatus;
}
