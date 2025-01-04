import { Types } from 'mongoose';

export class CreatePostByBlogIdInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogName: string;
}

// TODO: add extra DTO

export class CreatePostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: Types.ObjectId;
}
