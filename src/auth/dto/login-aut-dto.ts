import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginAuthDto {

    @IsEmail()
    email: string;

    /*
    @IsString()
    token: string;*/

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