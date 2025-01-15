import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { TInteraction } from '../../../dto/interaction-dto';
import { Post, PostModelType } from '../../../domain/post.entity';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { PostInteractionDto } from '../../../dto/post-dto';

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
      userId: dto.userId,
      login: dto.login,
      action: dto.action,
      addedAt: new Date(),
    };

    const commentDocument = await this.PostModel.findByIdAndUpdate(
      dto.postId,
      { $push: { interactions: createdInteraction } },
      { new: true },
    );

    if (!commentDocument) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid post', 'content');
    }

    return createdInteraction;
  }
}
