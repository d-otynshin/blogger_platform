import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Post, PostModelType } from '../../../domain/post.entity';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { PostInteractionInputDto } from '../../../api/input-dto/posts.input-dto';

import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exceptions';
import { CreateInteractionPostCommand } from './create-interaction-post.use-case';
import { TInteraction } from '../../../dto/interaction-dto';

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
    private postsRepository: PostsRepository,
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
      const createdInteraction: TInteraction = await this.commandBus.execute(
        new CreateInteractionPostCommand({
          postId,
          userId,
          login,
          action: dto.likeStatus,
        }),
      );

      postDocument.interactions.push(createdInteraction);
    } else {
      // Update the existing one with the new like status
      postDocument.interactions.push({
        ...interaction,
        addedAt: new Date(),
        action: dto.likeStatus,
      });
    }

    // Save the updated post document to the database
    await this.postsRepository.save(postDocument);

    return;
  }
}
