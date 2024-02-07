import { User } from '../../auth/user.entity';

declare global {
  namespace Express {
    interface User {
      id: number;
    }
  }
}