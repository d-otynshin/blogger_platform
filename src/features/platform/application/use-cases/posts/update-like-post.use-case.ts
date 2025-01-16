import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Post, PostModelType } from '../../../domain/post.entity';
import { PostInteractionInputDto } from '../../../api/input-dto/posts.input-dto';

import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../../core/exceptions/domain-exceptions';
import { CreateInteractionPostCommand } from './create-interaction-post.use-case';

export class UpdateLikePostCommand {
  constructor(
    public postId: Types.ObjectId,
    public userId: Types.ObjectId,
    public login: string,
    public dto: PostInteractionInputDto,
  ) {}
}

@CommandHandler(UpdateLikePostCommand)
export class UpdateLikePostUseCase
  implements ICommandHandler<UpdateLikePostCommand>
{
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private commandBus: CommandBus,
  ) {}

  async execute(command: UpdateLikePostCommand) {
    const { postId, userId, login, dto } = command;

    // Retrieve the post document by its ID
    const postDocument = await this.PostModel.findById(postId);
    if (!postDocument) {
      throw NotFoundDomainException.create('Invalid post', 'postId');
    }

    const interaction = postDocument.interactions.find(
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
    await this.PostModel.findOneAndUpdate(
      { _id: postId, 'interactions.userId': userId },
      {
        $set: {
          'interactions.$.addedAt': new Date(),
          'interactions.$.action': dto.likeStatus,
        },
      },
    );

    return;
  }
}
