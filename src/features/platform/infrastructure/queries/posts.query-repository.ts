import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PostModelType, Post } from '../../domain/post.entity';
import { PostOutputDto } from '../../api/output-dto/post.output-dto';

import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';

export class GetPostsQueryParams extends BaseSortablePaginationParams<string> {
  sortBy = 'createdAt';
}

export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getById(
    postId: Types.ObjectId,
    userId?: string,
  ): Promise<PostOutputDto> {
    const postDocument = await this.PostModel.findById(postId);

    if (!postDocument) {
      throw NotFoundDomainException.create('Post not found');
    }

    return PostOutputDto.mapToView(postDocument, userId);
  }

  async getAllPosts(
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    const posts = await this.PostModel.find({})
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments({});

    const items = posts.map((post) => PostOutputDto.mapToView(post, userId));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getPostsByBlogId(
    blogId: Types.ObjectId,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    const posts = await this.PostModel.find({ blogId })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments({ blogId });

    const items = posts.map((post) => PostOutputDto.mapToView(post, userId));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
