import { isBefore } from 'date-fns';
import { LikeStatus, TInteractionView } from '../../dto/interaction-dto';
import { Post } from '../../domain/post.entity';

export type PostView = Post & {
  interactions?: any;
};

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

  static mapToView(post: PostView, userId?: string): PostSQLOutputDto {
    let myStatus = LikeStatus.None;

    const interactions = post.interactions ?? [];

    if (userId) {
      const myInteraction = interactions.find(
        (interaction) => interaction.user_id === userId,
      );

      myStatus = myInteraction?.action || LikeStatus.None;
    }

    const newestLikes = interactions
      .filter((interaction) => interaction.action === LikeStatus.Like)
      .sort((likeA, likeB) =>
        isBefore(likeA.added_at, likeB.added_at) ? 1 : -1,
      )
      .slice(0, 3)
      .map((like) => ({
        addedAt: like.added_at,
        userId: like.user_id,
        login: like.user_login,
      }));

    const dto = new PostSQLOutputDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.short_description;
    dto.content = post.content;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dto.blogId = post.blog?.id || post.blog_id;
    dto.blogName = post.blog_name;
    dto.createdAt = post.created_at;

    dto.extendedLikesInfo = {
      likesCount: interactions.filter(
        (interaction) => interaction.action === LikeStatus.Like,
      ).length,
      dislikesCount: interactions.filter(
        (interaction) => interaction.action === LikeStatus.Dislike,
      ).length,
      myStatus,
      newestLikes,
    };

    return dto;
  }
}
