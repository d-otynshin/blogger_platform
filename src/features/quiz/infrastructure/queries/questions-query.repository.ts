import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/question.entity';
import {
  GetQuestionsQueryParams,
  QnPublicationStatus,
} from '../../lib/helpers';
import {
  formatSortDirection,
  toSnakeCase,
} from '../../../../core/libs/transfrom-snake-case';
import { QuestionViewDto } from '../../dto/question-view.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private questionsOrm: Repository<Question>,
  ) {}

  async findAll(query: GetQuestionsQueryParams) {
    const queryBuilder = this.questionsOrm.createQueryBuilder('question');

    if (query.bodySearchTerm) {
      queryBuilder.orWhere('question.body ILIKE :body', {
        body: `%${query.bodySearchTerm}%`,
      });
    }

    if (query.publishedStatus === QnPublicationStatus.PUBLISHED) {
      queryBuilder.orWhere('post.published = :published', { published: true });
    }

    if (query.publishedStatus === QnPublicationStatus.NOT_PUBLISHED) {
      queryBuilder.orWhere('post.published = :published', { published: false });
    }

    queryBuilder.orderBy(
      toSnakeCase(query.sortBy),
      formatSortDirection(query.sortDirection),
    );

    queryBuilder.skip(query.calculateSkip());
    queryBuilder.take(query.pageSize);

    const [questions, totalCount] = await queryBuilder.getManyAndCount();

    const items = questions.map(QuestionViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
