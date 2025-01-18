import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentOutputDto } from '../../api/output-dto/comment.output-dto';
import { GetPostsQueryParams } from './posts.query-repository';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { Post, PostModelType } from '../../domain/post.entity';

export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  async getCommentById(
    commentId: Types.ObjectId,
    userId?: string,
  ): Promise<CommentOutputDto> {
    const commentDocument = await this.CommentModel.findById(commentId);

    if (!commentDocument) {
      throw NotFoundDomainException.create('Comment not found', 'id');
    }

    return CommentOutputDto.mapToView(commentDocument, userId);
  }

  async getCommentsByPostId(
    postId: Types.ObjectId,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentOutputDto[]>> {
    const postDocument = await this.PostModel.findById(postId);
    if (!postDocument) {
      throw NotFoundDomainException.create('Post not found', 'postId');
    }

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
