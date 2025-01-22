import { CommentOutputDto } from '../../api/output-dto/comment.output-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { GetPostsQueryParams } from './get-posts-query-params';
import { CommentsSQLRepository } from '../repositories/comments-sql.repository';
import { PostsSQLRepository } from '../repositories/posts-sql.repository';

export class CommentsQueryRepository {
  constructor(
    private readonly commentRepository: CommentsSQLRepository,
    private readonly postsRepository: PostsSQLRepository,
  ) {}

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentOutputDto> {
    const commentData = await this.commentRepository.getById(commentId);

    if (!commentData) {
      throw NotFoundDomainException.create('Comment not found', 'id');
    }

    return CommentOutputDto.mapToView(commentData, userId);
  }

  async getCommentsByPostId(
    postId: string,
    query: GetPostsQueryParams,
    // userId?: string,
  ): Promise<PaginatedViewDto<CommentOutputDto[]>> {
    const postData = await this.postsRepository.findById(postId);
    if (!postData) {
      throw NotFoundDomainException.create('Post not found', 'postId');
    }

    // const comments = await this.commentRepository.find({ postId })
    //   .sort({ [query.sortBy]: query.sortDirection })
    //   .skip(query.calculateSkip())
    //   .limit(query.pageSize);

    const comments = [];
    const totalCount = 0;

    // const items = comments.map((comment) =>
    //   CommentOutputDto.mapToView(comment, userId),
    // );

    return PaginatedViewDto.mapToView({
      items: comments,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
