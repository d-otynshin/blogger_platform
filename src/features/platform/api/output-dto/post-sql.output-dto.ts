import { isBefore } from 'date-fns';
import { LikeStatus, TInteractionView } from '../../dto/interaction-dto';

export class PostSQLOutputDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;

  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: TInteractionView[];
  };

  static mapToView(post, userId?: string): PostSQLOutputDto {
    let myStatus = LikeStatus.None;

    if (userId) {
      const myInteraction = post.interactions.find(
        (interaction) => interaction.userId === userId,
      );

      myStatus = myInteraction?.action || LikeStatus.None;
    }

    const newestLikes = post.interactions
      .filter((interaction) => interaction.action === LikeStatus.Like)
      .sort((likeA, likeB) =>
        isBefore(likeA.added_at, likeB.added_at) ? 1 : -1,
      )
      .slice(0, 3)
      .map((like) => ({
        addedAt: like.added_at,
        userId: like.user_id,
        login: like.login,
      }));

    const dto = new PostSQLOutputDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.short_description;
    dto.content = post.content;
    dto.blogId = post.blog_id;
    dto.blogName = post.blog_name;
    dto.createdAt = post.created_at;

    dto.extendedLikesInfo = {
      likesCount: post.interactions.filter(
        (interaction) => interaction.action === LikeStatus.Like,
      ).length,
      dislikesCount: post.interactions.filter(
        (interaction) => interaction.action === LikeStatus.Dislike,
      ).length,
      myStatus,
      newestLikes,
    };

    return dto;
  }
}
