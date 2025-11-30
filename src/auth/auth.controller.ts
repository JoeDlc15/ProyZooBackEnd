import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-aut-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*@Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }*/
  @Post('create') //hostname/auth/create
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login') //hostname/auth/login
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }


  @Get()
  findAll() {
    return this.authService.findAll();
  }

  /*@Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }*/
  @Get('find/:id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }


  @Patch('edit/:id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }
}
