import { Types } from 'mongoose';
import { PostDocument } from '../../domain/post.entity';
import { LikeStatus, TInteraction } from '../../dto/interaction-dto';

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
    newestLikes: TInteraction[];
  };

  static mapToView(post: PostDocument): PostOutputDto {
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
      myStatus: LikeStatus.None,
      newestLikes: [],
    };

    return dto;
  }
}
