import * as Yup from "yup";

export const passwordSchema = Yup.object({
  codVer: Yup.string().required(
    "Código de Verificação: preenchimento do campo é obrigatório"
  ),
  senhaNova: Yup.string()
    .min(6, "Nova Senha: necessário mínimo de 6 caracteres")
    .max(20, "Nova Senha: permitido máximo de 20 caracteres")
    .required("Nova Senha: preenchimento do campo é obrigatório")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/,
      "Nova Senha deve conter pelo menos 1 letra maiúscula, 1 minúscula e 1 caractere especial"
    ),
  senhaConfirma: Yup.string()
    .oneOf([Yup.ref("senhaNova")], "A confirmação deve ser IGUAL à nova senha")
    .required("Confirma Senha: preenchimento do campo é obrigatório"),
}).required();
