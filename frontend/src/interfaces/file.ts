export interface IFile {
  id: number;
  name: string;
  filename: string;
  size: number;
  uploadDate: string;
  path: string;
  owner: {
    userId: number;
    username: string;
  };
  total_shared: number;
}
