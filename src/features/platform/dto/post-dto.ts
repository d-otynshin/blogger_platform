import { Types } from 'mongoose';
import { LikeStatus } from './interaction-dto';

export class CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
}

export class UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
}

export class PostInteractionDto {
  login: string;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  action: LikeStatus;
}
