import { IsString } from 'class-validator';

export class deleteTaskDTO {
    @IsString()
    taskName: string;
}