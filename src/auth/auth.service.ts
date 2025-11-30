import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-aut-dto';

@Injectable()
export class AuthService {
  /*create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }*/

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
async create(createAuthDto: CreateAuthDto) {

    const userExists= await this.findPerEmail(createAuthDto.email);

    if(!userExists){

      const hashedPassword= await this.hashPassword(createAuthDto.password);

      const userRegister = await this.userRepository.create({
        email: createAuthDto.email,
        fullName: createAuthDto.fullName,
        firebaseUuid: createAuthDto.firebaseUuid,
        password: hashedPassword
      });
      await this.userRepository.save(userRegister);
      return {
        email: userRegister.email,
        fullName: userRegister.fullName,
        id: userRegister.id
      };
    }else{
      throw new BadRequestException(
        {
          message: 'El correo electrónica ya esta registrado',
          exists: true
        }
      )
    }
  }

  /*
  async create(createAuthDto: CreateAuthDto) {
    const userExists= await this.findPerEmail(createAuthDto.email);
    if(!userExists){
      const userRegister = await this.userRepository.create({
        email: createAuthDto.email,
        fullName: createAuthDto.fullName,
        password: createAuthDto.password
      });
      await this.userRepository.save(userRegister);
      return {
        email: userRegister.email,
        fullName: userRegister.fullName,
        id: userRegister.id
      };
    }else{
      throw new BadRequestException(
        {
          message: 'El correo electrónica ya esta registrado',
          exists: true
        }
      )
    }
  }*/

  /* // ESTO FUE CREADO PARA VALIDAR EL DATO QUE SE INGRESA EN EL REGISTRO
  async create(createAuthDto: CreateAuthDto) {
    const userRegister = await this.userRepository.create({
      email: createAuthDto.email,
      fullName: createAuthDto.fullName,
      firebaseUuid: createAuthDto.firebaseUuid,
    }); 

    await this.userRepository.save(userRegister);
    return userRegister;
  }*/

  /*async register(createAuthDto: CreateAuthDto) {      
    
    const userExists = await this.findPerEmail(createAuthDto.email);
    if(!userExists){
          const userRegister = await this.userRepository.create({
            email: createAuthDto.email,
            fullName: createAuthDto.fullName,
            firebaseUuid: createAuthDto.firebaseUuid,
          }); 

      await this.userRepository.save(userRegister);
      return {
        email: userRegister.email,
        fullName: userRegister.fullName,
        id: userRegister.id
      };
    }else{
      throw new BadRequestException(
        {
          message: 'El correo electrónico ya está registrado',
          exists: true
        }
      )
    }

  }
*/
  findAll() {
    return `This action returns all auth`;
  }


  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /*findOne(id: string) {
    return `This action returns a #${id} auth`;
  }*/

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: {id}
    });
    if(user){
      return user
    }else{
      throw new BadRequestException(
        {
          message: 'El usuario no existe',
          exists: false
        }
      )
    }
  }

  async login(loginAuthDto: LoginAuthDto){ {

    //const hashedPassword = await this.hashPassword(loginAuthDto.password);

    const user = await this.userRepository.findOne({
      where: {email: loginAuthDto.email}
    });

    if(user){

      const isMatchePassword = await this.comparePassword(loginAuthDto.password, user.password);
      if(!isMatchePassword){
        throw new BadRequestException({
          message: 'usuario o Contraseña incorrecta',
          exists: false
        })
      }
      return{
        email: user.email,
        fullName: user.fullName,
        id: user.id
      }
    }else{
      throw new BadRequestException(
        {
          message: 'Usuario no encontrado',
          exists: false
        }
      )
    }
  }}

  async findPerEmail(email: string) {
      const user = await this.userRepository.findOne({
        where: { email }
      });
      return !!user;
  }

  /*update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }*/

  async update(id: string, updateAuthDto: UpdateAuthDto) {
  
    const user = await this.userRepository.findOne ({
      where: {id}
    })

    if(!user){
      throw new NotFoundException(`El usuario con id ${id} no fue encontrado.`);
    }

    if (updateAuthDto.email && updateAuthDto.email !== user.email) {
      
      const emailExists = await this.findPerEmail(updateAuthDto.email);
      
      if (emailExists) {
        throw new BadRequestException('El correo electrónico ya está registrado por otro usuario.');
      }
    }

    user.email = updateAuthDto.email || user.email;
    await this.userRepository.save(user);
    return user;

  }

  /*remove(id: number) {
    return `This action removes a #${id} auth`;
  }*/

   async remove(id: string) {
    
    const user = await this.userRepository.findOne ({
      where: { id}
    })

    if(!user){
      throw new NotFoundException(`El usuario con id ${id} no fue encontrado.`);

    }

    await this.userRepository.remove(user);

    return { message: `Usuario con id ${id} eliminado correctamente.` };
  }
}
