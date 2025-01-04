import { Types } from 'mongoose';

export class CreatePostByBlogIdInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogName: string;
}

export class CreatePostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: Types.ObjectId;
}
