import { Controller, Delete, HttpCode } from '@nestjs/common';
import { BlogsService } from '../blogs/application/blogs-service';
import { PostsService } from '../posts/application/posts-service';
import { UsersService } from '../users/application/user-service';
import { CommentsService } from '../comments/application/comments-service';
import { SecurityService } from '../security/application/security-service';
import { PasswordRecoveryRepository } from '../auth/infrastructure/password-recovery-repository';
import { AttemptsService } from '../auth/application/attempts-service';

@Controller('/testing/all-data')
export class DeleteAllController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected usersService: UsersService,
    protected commentsService: CommentsService,
    protected securityService: SecurityService,
    protected attemptsService: AttemptsService,
    protected passwordRecoveryRepository: PasswordRecoveryRepository,
  ) {}

  @Delete()
  @HttpCode(204)
  async deleteAll() {
    await this.blogsService.deleteAll();
    await this.postsService.deleteAll();
    await this.usersService.deleteAll();
    await this.commentsService.deleteAll();
    await this.securityService.deleteAll();
    await this.attemptsService.deleteAll();
    await this.passwordRecoveryRepository.deleteAll();
  }
}
