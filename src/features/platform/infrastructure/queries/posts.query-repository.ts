import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { PostModelType, Post } from '../../domain/post.entity';
import { PostOutputDto } from '../../api/output-dto/post.output-dto';

import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

export class GetPostsQueryParams extends BaseSortablePaginationParams<string> {
  sortBy = 'createdAt';
}

export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getById(id: string, userId?: Types.ObjectId): Promise<PostOutputDto> {
    const post = await this.PostModel.findOne({ _id: id });

    if (!post) {
      throw new NotFoundException('post not found');
    }

    return PostOutputDto.mapToView(post, userId);
  }

  async getAllPosts(
    query: GetPostsQueryParams,
    userId?: Types.ObjectId,
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
    userId?: Types.ObjectId,
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
