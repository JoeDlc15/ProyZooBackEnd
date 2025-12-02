import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; // <--- IMPORTANTE

import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-aut-dto'; // Asegúrate que el nombre del archivo coincida con el tuyo
import { User } from './entities/auth.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService, // <--- Inyectamos el servicio de JWT
  ) {}

  // --- CREAR USUARIO (REGISTRO) ---
  async create(createAuthDto: CreateAuthDto) {
    try {
      const { password, ...userData } = createAuthDto;
      
      // 1. Encriptar la contraseña
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10), // Encriptamos aquí directo
      });

      // 2. Guardar en BD
      await this.userRepository.save(user);
      //delete user.password; // No devolvemos la contraseña por seguridad

      // 3. Devolvemos usuario y token (opcional, para autologin al registrarse)
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  // --- LOGIN (INICIO DE SESIÓN) ---
  async login(loginAuthDto: LoginAuthDto) {
    const { password, email } = loginAuthDto;

    // 1. Buscamos el usuario por email (pidiendo password explícitamente)
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'fullName', 'roles', 'isActive'] 
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales no válidas (email)');
    }
    /*
    if (!user.isActive) {
      throw new UnauthorizedException('El usuario está inactivo, hable con el administrador');
    }*/

    // 2. Verificamos la contraseña
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales no válidas (password)');
    }

    // 3. ¡SOLUCIÓN! Devolvemos la info del usuario + el TOKEN
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles
      },
      token: this.getJwtToken({ id: user.id }) // <--- Generamos el JWT aquí
    };
  }

  // --- BUSCAR TODOS LOS USUARIOS ---
  async findAll() {
    // Devuelve todos los usuarios pero SIN la contraseña
    return await this.userRepository.find({
      select: ['id', 'email', 'fullName', 'isActive', 'roles', 'firebaseUuid']
    });
  }

  // --- BUSCAR UN USUARIO POR ID ---
  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'fullName', 'isActive', 'roles', 'firebaseUuid'] // <--- Ocultamos password
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return user;
  }

  // --- ACTUALIZAR USUARIO ---
  async update(id: string, updateAuthDto: UpdateAuthDto) {
    const user = await this.findOne(id); // Reusamos findOne para validar existencia
    
    // Si viene password nuevo, hay que encriptarlo
    if (updateAuthDto.password) {
        updateAuthDto.password = bcrypt.hashSync(updateAuthDto.password, 10);
    }

    // Mezclamos los datos nuevos con los viejos
    this.userRepository.merge(user, updateAuthDto);
    
    await this.userRepository.save(user);
    return user;
  }

  // --- ELIMINAR USUARIO ---
  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: `Usuario eliminado correctamente` };
  }


  // --- MÉTODOS PRIVADOS AUXILIARES ---

  // Generador de Tokens
  private getJwtToken(payload: { id: string }) {
    return this.jwtService.sign(payload);
  }

  // Manejador de errores de Base de Datos
  private handleDBErrors(error: any): never {
    if (error.code === '23505') 
      throw new BadRequestException(error.detail);

    console.log(error);
    throw new BadRequestException('Please check server logs');
  }

  // Helper para buscar por email si lo necesitas en otro lado
  async findPerEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }
}

/*import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-aut-dto';

import { JwtService } from '@nestjs/jwt'; // <--- Importar

@Injectable()
export class AuthService {
  /*create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }*/
/*
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService // <--- Inyectar
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
  /*async findAll() {
    //return `This action returns all auth`;
    // Busca todos los usuarios, pero selecciona solo campos seguros (sin password)
    const users = await this.userRepository.find({
      select: ['id', 'email', 'fullName', 'isActive', 'roles']
    });
    return users;
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
/*
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
/*
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
  }}*/
/*
  async findPerEmail(email: string) {
      const user = await this.userRepository.findOne({
        where: { email }
      });
      return !!user;
  }

  /*update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }*///*/*
/*async login(loginAuthDto: LoginAuthDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginAuthDto.email }
    });

    if (user && await this.comparePassword(loginAuthDto.password, user.password)) {
        // RETORNAMOS EL TOKEN
        return {
          user: {
             id: user.id,
             email: user.email,
             fullName: user.fullName
          },
          token: this.jwtService.sign({ id: user.id }) // <--- Generar Token
        };
    }

    throw new BadRequestException({ message: 'Credenciales inválidas' });
  }
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
/*
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
*/