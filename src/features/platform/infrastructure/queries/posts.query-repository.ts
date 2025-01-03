import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { PaginatedViewDto } from '@core/dto/base.paginated.view-dto';
import { BaseSortablePaginationParams } from '@core/dto/base.query-params.input-dto';
import { PostModelType, Post } from '../../domain/post.entity';
import { PostOutputDto } from '../../api/output-dto/post.output-dto';

export class GetPostsQueryParams extends BaseSortablePaginationParams<string> {
  sortBy = 'createdAt';
}

export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getById(id: string): Promise<PostOutputDto> {
    const post = await this.PostModel.findOne({ _id: id });

    if (!post) {
      throw new NotFoundException('post not found');
    }

    return PostOutputDto.mapToView(post);
  }

  async getAllPosts(
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    const posts = await this.PostModel.find({})
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments({});

    const items = posts.map(PostOutputDto.mapToView);

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
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    const posts = await this.PostModel.find({ blogId })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments({ blogId });

    const items = posts.map(PostOutputDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
