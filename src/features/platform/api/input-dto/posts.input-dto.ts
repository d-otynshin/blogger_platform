import { Types } from 'mongoose';
import { IsString, Length } from 'class-validator';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../domain/post.entity';

export class CreatePostByBlogIdInputDto {
  @IsString()
  @Length(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;

  @IsString()
  @Length(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsString()
  @Length(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;

  @IsString()
  blogName: string;
}

// TODO: add extra DTO?
export class CreatePostInputDto {
  @IsString()
  @Length(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;

  @IsString()
  @Length(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsString()
  @Length(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;

  @IsString()
  blogId: Types.ObjectId;
}
