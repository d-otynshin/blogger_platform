import { Types } from 'mongoose';
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

  static mapToView(
    comment: CommentDocument,
    userId?: string,
  ): CommentOutputDto {
    let myStatus = LikeStatus.None;

    if (userId) {
      const myInteraction = comment.interactions.find(
        (interaction) => interaction.userId === new Types.ObjectId(userId),
      );

      myStatus = myInteraction?.action || LikeStatus.None;
    }

    const dto = new CommentOutputDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: comment.interactions.filter(
        (interaction) => interaction.action === LikeStatus.Like,
      ).length,
      dislikesCount: comment.interactions.filter(
        (interaction) => interaction.action === LikeStatus.Dislike,
      ).length,
      myStatus,
    };

    return dto;
  }
}
