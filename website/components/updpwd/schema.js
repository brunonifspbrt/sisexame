import * as Yup from "yup";

export const passwordSchema = Yup.object({
  senhaAntiga: Yup.string()
    .max(20, "Senha Atual: permitido máximo de 20 caracteres")
    .required("Senha Atual: preenchimento do campo é obrigatório"),
  senhaNova: Yup.string()
    .min(6, "Nova Senha: necessário mínimo de 6 caracteres")
    .max(20, "Nova Senha: permitido máximo de 20 caracteres")
    .required("Nova Senha: preenchimento do campo é obrigatório")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/,
      "Nova Senha deve conter pelo menos 1 letra maiúscula, 1 minúscula e 1 caractere especial"
    )
    .test(
      "senha-diferente",
      "A nova senha NÃO pode ser igual à senha atual",
      function (value) {
        // const { senhaAntiga } = this.parent; // Acessa o valor de senhaAntiga
        const senhaAntiga = this.parent.senhaAntiga; // Acessa o valor de senhaAntiga
        return value !== senhaAntiga; // Valida se senhaNova é diferente de senhaAntiga
      }
    ),
  senhaConfirma: Yup.string()
    .oneOf([Yup.ref("senhaNova")], "A confirmação deve ser IGUAL à nova senha")
    .required("Confirma Senha: preenchimento do campo é obrigatório"),
}).required();
