import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";
export class CreateAuthDto {

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(3, {
        message: 'El Nombre Completo es muy corto (mínimo 3 caracteres)' 
    })
    @MaxLength(100)
    fullName: string;
    
    @IsString()
    firebaseUuid: string;
    
    @IsString()
    @MinLength(6)
    @MaxLength(12)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        {
            message: 'La contraseña debe tener al entre 6 y 12 caracteres, al menos una letra mayúscula, una letra minúscula y un número o caracter especial.'
        }
    )
    password: string;

}