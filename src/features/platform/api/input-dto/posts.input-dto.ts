import { Types } from 'mongoose';
import { IsIn, IsNotEmpty, Length } from 'class-validator';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../domain/post.entity';
import { LikeStatus } from '../../dto/interaction-dto';
import { IsTrimmed } from '../../../../core/decorators/is-trimmed';
import { IsObjectId } from '../../../../core/decorators/is-objectid';
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
  @IsObjectId()
  @IsBlogExist()
  blogId: Types.ObjectId;
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
  @IsObjectId()
  @IsBlogExist()
  blogId: Types.ObjectId;
}

export class PostInteractionInputDto {
  @IsTrimmed()
  @IsNotEmpty()
  @IsIn([LikeStatus.Like, LikeStatus.Dislike, LikeStatus.None])
  likeStatus: LikeStatus.Like | LikeStatus.Dislike;
}
