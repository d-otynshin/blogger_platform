import { LikeStatus } from '../../dto/interaction-dto';
import { IsTrimmed } from '../../../../core/decorators/is-trimmed';
import { IsNotEmpty } from 'class-validator';

export class CommentsInputDto {
  @IsTrimmed()
  @IsNotEmpty()
  content: string;
}

export class CommentInteractionInputDto {
  @IsTrimmed()
  @IsNotEmpty()
  likeStatus: LikeStatus.Like | LikeStatus.Dislike;
}
