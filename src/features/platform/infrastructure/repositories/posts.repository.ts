import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../../domain/post.entity';
import { UpdatePostDto } from '../../dto/post-dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({ _id: id });
  }

  async delete(id: string) {
    const result = await this.PostModel.deleteOne({ _id: id });

    return result.deletedCount === 1;
  }

  async updateById(id: string, body: UpdatePostDto): Promise<boolean> {
    const result = await this.PostModel.updateOne({ _id: id }, { $set: body });

    return result.matchedCount === 1;
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }
}
