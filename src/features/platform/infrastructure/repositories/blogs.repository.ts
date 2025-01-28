import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../domain/blog.entity';
import { CreateBlogDto, UpdateBlogDto } from '../../dto/blog-dto';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private blogsTypeOrmRepository: Repository<Blog>,
  ) {}

  async createInstance(dto: CreateBlogDto): Promise<Blog> {
    const blog: Blog = this.blogsTypeOrmRepository.create({
      name: dto.name,
      description: dto.description,
      website_url: dto.websiteUrl,
      is_membership: false,
    });

    return this.blogsTypeOrmRepository.save(blog);
  }

  async findById(id: string): Promise<Blog> {
    return this.blogsTypeOrmRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await this.blogsTypeOrmRepository.delete(id);

    return deleteResult.affected > 0;
  }

  async updateById(id: string, dto: UpdateBlogDto): Promise<boolean> {
    const updateResult = await this.blogsTypeOrmRepository
      .createQueryBuilder()
      .update(Blog)
      .set({
        name: dto.name,
        description: dto.description,
        website_url: dto.websiteUrl,
      })
      .where('id = :id', { id })
      .execute();

    return updateResult.affected > 0;
  }

  async deleteAll() {
    const result = await this.blogsTypeOrmRepository.delete({});

    return result.affected > 0;
  }
}
