import { applyDecorators } from '@nestjs/common';
import { IsString } from 'class-validator';
import { Trim } from './trim';

export const IsTrimmed = () =>
  applyDecorators(IsString(), Trim());
