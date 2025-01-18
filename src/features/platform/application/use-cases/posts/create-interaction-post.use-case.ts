import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { TInteraction } from '../../../dto/interaction-dto';
import { Post, PostModelType } from '../../../domain/post.entity';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { PostInteractionDto } from '../../../dto/post-dto';
import { Types } from 'mongoose';

export class CreateInteractionPostCommand {
  constructor(public dto: PostInteractionDto) {}
}

@CommandHandler(CreateInteractionPostCommand)
export class CreateInteractionPostUseCase
  implements ICommandHandler<CreateInteractionPostCommand>
{
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async execute({ dto }: CreateInteractionPostCommand) {
    const createdInteraction: TInteraction = {
      userId: new Types.ObjectId(dto.userId),
      login: dto.login,
      action: dto.action,
      addedAt: new Date(),
    };

    const postDocument = await this.PostModel.findByIdAndUpdate(
      dto.postId,
      { $push: { interactions: createdInteraction } },
      { new: true },
    );

    if (!postDocument) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid post', 'content');
    }

    return;
  }
}
