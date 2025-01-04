import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../../domain/blog.entity';
import { UpdateBlogDto } from '../../dto/blog-dto';
import { Types } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(id: Types.ObjectId): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({ _id: id });
  }

  async delete(id: Types.ObjectId) {
    const result = await this.BlogModel.deleteOne({ _id: id });

    return result.deletedCount === 1;
  }

  async updateById(id: Types.ObjectId, body: UpdateBlogDto): Promise<boolean> {
    const result = await this.BlogModel.updateOne({ _id: id }, { $set: body });

    return result.matchedCount === 1;
  }

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }
}
