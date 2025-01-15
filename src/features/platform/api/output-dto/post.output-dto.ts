import { Types } from 'mongoose';
import { isBefore } from 'date-fns';
import { PostDocument } from '../../domain/post.entity';
import { LikeStatus, TInteractionView } from '../../dto/interaction-dto';

export class PostOutputDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: Types.ObjectId;
  blogName: string;
  createdAt: Date;

  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: TInteractionView[];
  };

  static mapToView(post: PostDocument, userId?: Types.ObjectId): PostOutputDto {
    let myStatus = LikeStatus.None;

    if (userId) {
      const myInteraction = post.interactions.find(
        (interaction) => interaction.userId === userId,
      );

      myStatus = myInteraction?.action || LikeStatus.None;
    }

    const newestLikes = post.interactions
      .filter((interaction) => interaction.action === LikeStatus.Like)
      .sort((likeA, likeB) => (isBefore(likeA.addedAt, likeB.addedAt) ? 1 : -1))
      .slice(0, 3)
      .map((like) => ({
        addedAt: like.addedAt,
        userId: like.userId,
        login: like.login,
      }));

    const dto = new PostOutputDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.shortDescription = post.shortDescription;
    dto.createdAt = post.createdAt;

    dto.extendedLikesInfo = {
      likesCount: post.interactions.length,
      dislikesCount: post.interactions.length,
      myStatus,
      newestLikes,
    };

    return dto;
  }
}
