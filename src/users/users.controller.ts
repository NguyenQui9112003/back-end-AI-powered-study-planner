import { Body, Controller, Post } from '@nestjs/common';
import { createUserDTO } from './dto/create-users.dto';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
    constructor(private userService: UsersService) { }

    // @Roles('admin')
    @Post()
    async create(@Body() createUserDto: createUserDTO) {
        return await this.userService.create(createUserDto);
    }
}