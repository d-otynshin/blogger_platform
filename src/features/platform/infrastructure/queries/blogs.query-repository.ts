import { FilterQuery, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { PaginatedViewDto } from '@core/dto/base.paginated.view-dto';
import { Blog, BlogModelType } from '../../domain/blog.entity';
import { BlogOutputDto } from '../../api/output-dto/blog.output-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PostOutputDto } from '../../api/output-dto/post.output-dto';
import {
  GetPostsQueryParams,
  PostsQueryRepository,
} from './posts.query-repository';

export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async getById(id: string): Promise<BlogOutputDto> {
    const blog = await this.BlogModel.findOne({ _id: id }).exec();

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return BlogOutputDto.mapToView(blog);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogOutputDto[]>> {
    const filter: FilterQuery<Blog> = {};

    if (query.searchNameTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }

    const users = await this.BlogModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.BlogModel.countDocuments(filter);

    const items = users.map(BlogOutputDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getAllPosts(
    id: Types.ObjectId,
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    return this.postsQueryRepository.getAll(id, query);
  }
}
