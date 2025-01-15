import { LikeStatus } from '../../dto/interaction-dto';
import { IsTrimmed } from '../../../../core/decorators/is-trimmed';

export class CommentsInputDto {
  @IsTrimmed()
  content: string;
}

export class CommentInteractionInputDto {
  @IsTrimmed()
  likeStatus: LikeStatus.Like | LikeStatus.Dislike;
}
