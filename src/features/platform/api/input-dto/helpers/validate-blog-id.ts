import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsSQLRepository } from '../../../infrastructure/repositories/blogs-sql.repository';

@ValidatorConstraint({ name: 'IsBlogExist', async: true })
@Injectable()
export class IsBlogExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsSQLRepository) {}
  async validate(value: any): Promise<boolean> {
    const blogData = await this.blogsRepository.findById(value);

    return Boolean(blogData);
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
