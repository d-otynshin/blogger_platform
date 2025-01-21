import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TInteraction } from '../../../dto/interaction-dto';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { PostInteractionDto } from '../../../dto/post-dto';
import { PostsSQLRepository } from '../../../infrastructure/repositories/posts-sql.repository';

export class CreateInteractionPostCommand {
  constructor(public dto: PostInteractionDto) {}
}

@CommandHandler(CreateInteractionPostCommand)
export class CreateInteractionPostUseCase
  implements ICommandHandler<CreateInteractionPostCommand>
{
  constructor(private postsRepository: PostsSQLRepository) {}

  async execute({ dto }: CreateInteractionPostCommand) {
    const createdInteraction: TInteraction = {
      userId: dto.userId,
      login: dto.login,
      action: dto.action,
      addedAt: new Date(),
    };

    // TODO: add update like
    // const postDocument = await this.PostModel.findByIdAndUpdate(
    //   dto.postId,
    //   { $push: { interactions: createdInteraction } },
    //   { new: true },
    // );

    const postData = [createdInteraction];

    if (!postData) {
      // TODO: update error details
      throw BadRequestDomainException.create('Invalid post', 'content');
    }

    return;
  }
}
