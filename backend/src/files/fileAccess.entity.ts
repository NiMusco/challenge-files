import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { File } from './file.entity';
import { User } from '../auth/user.entity';

@Entity()
export class FileAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => File, (file) => file.accesses)
  file: File;

  @ManyToOne(() => User)
  user: User;
}
