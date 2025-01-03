import { LikeStatus } from '../../dto/interaction-dto';
import { CommentDocument } from '../../domain/comment.entity';
import { TCommentator } from '../../dto/comment-dto';

export class CommentOutputDto {
  id: string;
  content: string;
  commentatorInfo: TCommentator;
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };

  static mapToView(comment: CommentDocument): CommentOutputDto {
    const dto = new CommentOutputDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: comment.interactions.length,
      dislikesCount: comment.interactions.length,
      myStatus: LikeStatus.None,
    };

    return dto;
  }
}
