import { IsUrl, Length } from 'class-validator';
import { CreateBlogDto, UpdateBlogDto } from '../../dto/blog-dto';
import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from '../../domain/blog.entity';
import { IsTrimmed } from '../../../../core/decorators/is-trimmed';

export class CreateBlogInputDto implements CreateBlogDto {
  @IsTrimmed()
  @Length(nameConstraints.minLength, nameConstraints.maxLength)
  name: string;

  @IsTrimmed()
  @Length(descriptionConstraints.minLength, descriptionConstraints.maxLength)
  description: string;

  @IsTrimmed()
  @IsUrl()
  @Length(websiteUrlConstraints.minLength, websiteUrlConstraints.maxLength)
  websiteUrl: string;
}

// TODO: refactor blog inputs

export class UpdateBlogInputDto implements UpdateBlogDto {
  @IsTrimmed()
  @Length(nameConstraints.minLength, nameConstraints.maxLength)
  name: string;

  @IsTrimmed()
  @Length(descriptionConstraints.minLength, descriptionConstraints.maxLength)
  description: string;

  @IsTrimmed()
  @IsUrl()
  @Length(websiteUrlConstraints.minLength, websiteUrlConstraints.maxLength)
  websiteUrl: string;
}
