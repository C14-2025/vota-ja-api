export default interface IUserResponseDTO {
  id: string;
  name: string;
  email: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
