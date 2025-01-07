import { Injectable } from '@nestjs/common';
import { hash, compare, genSalt } from 'bcrypt';

@Injectable()
export class CryptoService {
  async createPasswordHash(password: string): Promise<string> {
    const salt = await genSalt(10);

    return hash(password, salt);
  }

  comparePasswords(args: { password: string; hash: string }): Promise<boolean> {
    return compare(args.password, args.hash);
  }
}
