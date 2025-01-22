import { IsIn, IsNotEmpty, Length } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../domain/post.entity';
import { LikeStatus } from '../../dto/interaction-dto';
import { IsTrimmed } from '../../../../core/decorators/is-trimmed';
import { IsBlogExist } from './helpers/validate-blog-id';

export class CreatePostByBlogIdInputDto {
  @IsTrimmed()
  @Length(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;

  @IsTrimmed()
  @Length(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsTrimmed()
  @Length(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;

  blogName: string;
}

// TODO: add extra DTO?
export class CreatePostInputDto {
  @IsTrimmed()
  @Length(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;

  @IsTrimmed()
  @Length(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsTrimmed()
  @Length(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;

  @IsTrimmed()
  @IsNotEmpty()
  @IsBlogExist()
  blogId: string;
}

export class UpdatePostInputDto {
  @IsTrimmed()
  @Length(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;

  @IsTrimmed()
  @Length(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsTrimmed()
  @Length(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;

  @IsTrimmed()
  @IsNotEmpty()
  @IsBlogExist()
  blogId: string;
}

export class UpdatePostByBlogIdDtoInputDto extends OmitType(
  CreatePostByBlogIdInputDto,
  ['blogName'] as const,
) {}

export class PostInteractionInputDto {
  @IsTrimmed()
  @IsNotEmpty()
  @IsIn([LikeStatus.Like, LikeStatus.Dislike, LikeStatus.None])
  likeStatus: LikeStatus.Like | LikeStatus.Dislike;
}
