import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostInteractionInputDto } from '../../../api/input-dto/posts.input-dto';

import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CreateInteractionPostCommand } from './create-interaction-post.use-case';
import { PostsSQLRepository } from '../../../infrastructure/repositories/posts-sql.repository';

export class UpdateLikePostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public login: string,
    public dto: PostInteractionInputDto,
  ) {}
}

@CommandHandler(UpdateLikePostCommand)
export class UpdateLikePostUseCase
  implements ICommandHandler<UpdateLikePostCommand>
{
  constructor(
    private commandBus: CommandBus,
    private postsRepository: PostsSQLRepository,
  ) {}

  async execute(command: UpdateLikePostCommand) {
    const { postId, userId, login, dto } = command;

    // Retrieve the post document by its ID
    const postData = await this.postsRepository.findById(postId);
    if (!postData) {
      throw NotFoundDomainException.create('Invalid post', 'postId');
    }

    const interaction = postData.interactions.find(
      (interaction) => interaction.userId === userId,
    );

    if (!interaction) {
      await this.commandBus.execute(
        new CreateInteractionPostCommand({
          postId,
          userId,
          login,
          action: dto.likeStatus,
        }),
      );

      return;
    }

    // Verify that the user is authorized to update the comment
    if (interaction.userId !== userId) {
      throw ForbiddenDomainException.create('Forbidden', 'userId');
    }

    // Update the existing one with the new like status
    // await this.PostModel.findOneAndUpdate(
    //   { _id: postId, 'interactions.userId': userId },
    //   {
    //     $set: {
    //       'interactions.$.addedAt': new Date(),
    //       'interactions.$.action': dto.likeStatus,
    //     },
    //   },
    // );

    return;
  }
}
