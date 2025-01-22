import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInteractionInputDto } from '../../../api/input-dto/posts.input-dto';
import { CreateInteractionPostCommand } from './create-interaction-post.use-case';
import { PostsSQLRepository } from '../../../infrastructure/repositories/posts-sql.repository';
import { ForbiddenDomainException } from '../../../../../core/exceptions/domain-exceptions';

export class UpdateLikePostCommand {
  constructor(
    public postId: string,
    public userId: string,
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
    const { postId, userId, dto } = command;

    // Retrieve the post document by its ID
    const postInteractions =
      await this.postsRepository.getInteractionById(postId);

    const interaction = postInteractions.find(
      (interaction) => interaction.userId === userId,
    );

    if (!interaction) {
      await this.commandBus.execute(
        new CreateInteractionPostCommand({
          postId,
          userId,
          action: dto.likeStatus,
        }),
      );

      return;
    }

    // Verify that the user is authorized to update the comment
    if (interaction.userId !== userId) {
      throw ForbiddenDomainException.create('Forbidden', 'userId');
    }

    await this.postsRepository.updateInteractionById(
      postId,
      userId,
      dto.likeStatus,
    );

    return;
  }
}
