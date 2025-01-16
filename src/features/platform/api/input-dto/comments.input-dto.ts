import { LikeStatus } from '../../dto/interaction-dto';
import { IsTrimmed } from '../../../../core/decorators/is-trimmed';
import { IsIn, IsNotEmpty, Length } from 'class-validator';

export class CommentsInputDto {
  @IsTrimmed()
  @IsNotEmpty()
  // TODO: move to settings/configs.
  @Length(20, 300)
  content: string;
}

export class CommentInteractionInputDto {
  @IsTrimmed()
  @IsNotEmpty()
  @IsIn([LikeStatus.Like, LikeStatus.Dislike])
  likeStatus: LikeStatus.Like | LikeStatus.Dislike;
}
