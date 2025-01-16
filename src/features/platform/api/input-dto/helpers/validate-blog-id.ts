import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs.repository';

@ValidatorConstraint({ name: 'IsBlogExist', async: true })
@Injectable()
export class IsBlogExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async validate(value: any): Promise<boolean> {
    const blogDocument = await this.blogsRepository.findById(value);

    return Boolean(blogDocument);
  }

  defaultMessage(): string {
    return 'Blog does not exist';
  }
}

export function IsBlogExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsBlogExistConstraint,
    });
  };
}
