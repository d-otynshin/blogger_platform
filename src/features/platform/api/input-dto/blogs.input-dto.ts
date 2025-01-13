import { IsString, IsUrl, Length } from 'class-validator';
import { CreateBlogDto, UpdateBlogDto } from '../../dto/blog-dto';
import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from '../../domain/blog.entity';

export class CreateBlogInputDto implements CreateBlogDto {
  @IsString()
  @Length(nameConstraints.minLength, nameConstraints.maxLength)
  name: string;

  @IsString()
  @Length(descriptionConstraints.minLength, descriptionConstraints.maxLength)
  description: string;

  @IsString()
  @IsUrl()
  @Length(websiteUrlConstraints.minLength, websiteUrlConstraints.maxLength)
  websiteUrl: string;
}

// TODO: refactor blog inputs

export class UpdateBlogInputDto implements UpdateBlogDto {
  @IsString()
  @Length(nameConstraints.minLength, nameConstraints.maxLength)
  name: string;

  @IsString()
  @Length(descriptionConstraints.minLength, descriptionConstraints.maxLength)
  description: string;

  @IsString()
  @IsUrl()
  @Length(websiteUrlConstraints.minLength, websiteUrlConstraints.maxLength)
  websiteUrl: string;
}
