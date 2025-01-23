import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInteractionInputDto } from '../../../api/input-dto/posts.input-dto';
import { CreateInteractionPostCommand } from './create-interaction-post.use-case';
import { PostsSQLRepository } from '../../../infrastructure/repositories/posts-sql.repository';
import { ForbiddenDomainException, NotFoundDomainException } from '../../../../../core/exceptions/domain-exceptions';

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

    const postData = await this.postsRepository.findById(postId);

    if (!postData) {
      throw NotFoundDomainException.create('Post not found', 'postId');
    }

    // Retrieve the post document by its ID
    const postInteractions =
      await this.postsRepository.getInteractionsById(postId);

    const interaction = postInteractions.find(
      (interaction) => interaction.user_id === userId,
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
    if (interaction.user_id !== userId) {
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
