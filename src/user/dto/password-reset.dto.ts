import { Matches, MinLength } from "class-validator";



export class PasswordReset{

    @MinLength(6, { message: "Senha deve ter no mínimo 6 caracteres" })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message: "A senha deve conter pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 símbolo",
    })
    newPassword: string;

}