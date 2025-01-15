import { IsString } from 'class-validator';
import { LikeStatus } from '../../dto/interaction-dto';

export class CommentsInputDto {
  @IsString()
  content: string;
}

export class CommentInteractionInputDto {
  @IsString()
  likeStatus: LikeStatus.Like | LikeStatus.Dislike;
}
