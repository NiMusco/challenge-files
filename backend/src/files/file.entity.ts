import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { FileAccess } from '../files/fileAccess.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  filename: string;

  @Column()
  path: string; // The S3 key or file path

  @Column('bigint')
  size: number; // File size in bytes

  @ManyToOne(() => User, (user) => user.files)
  user: User;

  @CreateDateColumn()
  uploadDate: Date;

  @OneToMany(() => FileAccess, (fileAccess) => fileAccess.file)
  accesses: FileAccess[];
}
