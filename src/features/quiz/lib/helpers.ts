import { BaseSortablePaginationParams } from '../../../core/dto/base.query-params.input-dto';

export enum QuestionsSortBy {
  CreatedAt = 'createdAt',
}

export enum GamesSortBy {
  PairCreatedAt = 'pairCreatedDate',
  Status = 'status',
}

export enum QnPublicationStatus {
  ALL = 'all',
  PUBLISHED = 'published',
  NOT_PUBLISHED = 'notPublished',
}

export class GetQuestionsQueryParams extends BaseSortablePaginationParams<QuestionsSortBy> {
  sortBy = QuestionsSortBy.CreatedAt;
  bodySearchTerm: string | null = null;
  publishedStatus: QnPublicationStatus | null = QnPublicationStatus.ALL;
}

export class GetGamesQueryParams extends BaseSortablePaginationParams<GamesSortBy> {
  sortBy = GamesSortBy.Status;
}
