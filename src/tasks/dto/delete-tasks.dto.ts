import { IsString } from 'class-validator';

export class deleteTaskDTO {
  @IsString()
  email: string;

  @IsString()
  taskName: string;
}
