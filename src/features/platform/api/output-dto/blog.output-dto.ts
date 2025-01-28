import { Blog } from '../../domain/blog.entity';

export class BlogOutputDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  static mapToView(blog: Blog): BlogOutputDto {
    const dto = new BlogOutputDto();

    dto.id = blog.id;
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.website_url;
    dto.createdAt = blog.created_at;
    dto.isMembership = false;

    return dto;
  }
}

export class BlogSQLOutputDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  static mapToView(blog: any): BlogSQLOutputDto {
    const dto = new BlogSQLOutputDto();

    dto.id = blog.id;
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.website_url;
    dto.createdAt = blog.created_at;
    dto.isMembership = blog.is_membership;

    return dto;
  }
}
