import { isBefore } from 'date-fns';
import { LikeStatus, TInteractionView } from '../../dto/interaction-dto';
import { Post } from '../../domain/post.entity';

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

  static mapToView(post: Post, userId?: string): PostSQLOutputDto {
    let myStatus = LikeStatus.None;

    if (userId) {
      const myInteraction = post.interactions?.find(
        // TODO: check relations
        (interaction) => interaction.user?.id === userId,
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
        userId: like.user?.id, // TODO: check relations
        login: like.user?.login, // TODO: check relations
      }));

    const dto = new PostSQLOutputDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.short_description;
    dto.content = post.content;
    dto.blogId = post.blog.id;
    dto.blogName = post.blog_name;
    dto.createdAt = post.created_at;

    dto.extendedLikesInfo = {
      likesCount: post.interactions?.filter(
        (interaction) => interaction.action === LikeStatus.Like,
      ).length,
      dislikesCount: post.interactions?.filter(
        (interaction) => interaction.action === LikeStatus.Dislike,
      ).length,
      myStatus,
      newestLikes,
    };

    return dto;
  }
}
