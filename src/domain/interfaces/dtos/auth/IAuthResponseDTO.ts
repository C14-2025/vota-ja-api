export default interface IAuthResponseDTO {
  readonly accessToken: string;
  readonly user: { id: string; email: string };
}
