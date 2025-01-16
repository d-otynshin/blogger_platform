import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentOutputDto } from '../../api/output-dto/comment.output-dto';
import { GetPostsQueryParams } from './posts.query-repository';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getCommentById(
    commentId: Types.ObjectId,
    userId?: Types.ObjectId,
  ): Promise<CommentOutputDto> {
    const commentDocument = await this.CommentModel.findById(commentId);

    return CommentOutputDto.mapToView(commentDocument, userId);
  }

  async getCommentsByPostId(
    postId: Types.ObjectId,
    query: GetPostsQueryParams,
    userId?: Types.ObjectId,
  ): Promise<PaginatedViewDto<CommentOutputDto[]>> {
    const comments = await this.CommentModel.find({ postId })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments({ postId });

    const items = comments.map((comment) =>
      CommentOutputDto.mapToView(comment, userId),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
