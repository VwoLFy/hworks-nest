import { UpdateBlogDto } from '../../blogger.blogs/application/dto/UpdateBlogDto';
import { CreateBlogDto } from '../../blogger.blogs/application/dto/CreateBlogDto';
import { randomUUID } from 'crypto';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/domain/user.entity';

@Entity('Blogs')
export class Blog {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: Date;
  @Column()
  isMembership: boolean;
  @Column('uuid', { nullable: true })
  userId: string;
  @Column()
  userLogin: string;
  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: Date;
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;

  constructor({ ...dto }: CreateBlogDto, userId: string, userLogin: string) {
    this.id = randomUUID();
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
    this.createdAt = new Date();
    this.isMembership = false;
    this.userId = userId;
    this.userLogin = userLogin;
    this.isBanned = false;
    this.banDate = null;
  }

  updateBlog(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  setBan(isBanned: boolean) {
    this.isBanned = isBanned;

    if (isBanned) {
      this.banDate = new Date();
    } else {
      this.banDate = null;
    }
  }

  bindBlogWithUser(userId: string, userLogin: string) {
    this.userId = userId;
    this.userLogin = userLogin;
  }
}
