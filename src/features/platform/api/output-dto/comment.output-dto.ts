import { LikeStatus } from '../../dto/interaction-dto';
import { TCommentator } from '../../dto/comment-dto';
import { Comment } from '../../domain/comment.entity';

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

  static mapToView(comment: Comment, userId?: string): CommentOutputDto {
    let userStatus = LikeStatus.None;

    console.log('COMMENT INTERACTIONS', comment);

    if (userId) {
      if (comment.interactions.length === 0) {
        userStatus = LikeStatus.None;
      } else {
        const userInteraction = comment.interactions.find(
          (interaction) => interaction.user.id === userId,
        );

        userStatus = userInteraction.action || LikeStatus.None;
      }
    }

    const dto = new CommentOutputDto();

    console.log('Comment in CommentOutputDto', comment);

    dto.id = comment.id;
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentator.id,
      userLogin: comment.commentator.login,
    };
    dto.createdAt = comment.created_at;
    dto.likesInfo = {
      likesCount: comment.interactions.filter(
        (interaction) => interaction.action === LikeStatus.Like,
      ).length,
      dislikesCount: comment.interactions.filter(
        (interaction) => interaction.action === LikeStatus.Dislike,
      ).length,
      myStatus: userStatus,
    };

    return dto;
  }
}
