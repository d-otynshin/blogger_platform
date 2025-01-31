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
    let myStatus = LikeStatus.None;

    if (userId) {
      const myInteraction = comment.interactions.find(
        (interaction) => interaction.user.id === userId,
      );

      myStatus = myInteraction?.action || LikeStatus.None;
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
      myStatus,
    };

    return dto;
  }
}
