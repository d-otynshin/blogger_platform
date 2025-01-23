import { LikeStatus } from '../../dto/interaction-dto';
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

  static mapToView(comment: any, userId?: string): CommentOutputDto {
    let myStatus = LikeStatus.None;

    if (userId) {
      const myInteraction = comment.interactions.find(
        (interaction) => interaction.user_id === userId,
      );

      myStatus = myInteraction?.action || LikeStatus.None;
    }

    const dto = new CommentOutputDto();

    dto.id = comment.id;
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.user_id,
      userLogin: comment.user_login,
    };
    dto.createdAt = comment.created_at;
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
