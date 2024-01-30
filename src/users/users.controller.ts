import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Permissions } from 'src/auth/authorization/decorators/permissions.decorator';
import { Roles } from 'src/auth/authorization/decorators/roles.decorator';
import { Permission } from 'src/auth/authorization/permission.type';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Roles(UserRoles.Super)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions(Permission.CreateUser)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Permissions(Permission.ReadUser)
  @Get()
  findAll() {
    return this.usersService.findAllWithoutPagination({});
  }

  @Permissions(Permission.ReadUser)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Permissions(Permission.UpdateUser)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Permissions(Permission.DeleteUser)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
