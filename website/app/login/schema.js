import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string()
    .min(6, "E-mail: necessário mínimo de 6 caracteres")
    .email("Email: preencher campo no formato de e-mail") // deve estar no formato de e-mail
    .required("E-mail: preenchimento do campo é obrigatório"),
  senha: Yup.string().required("Senha: preenchimento do campo é obrigatório"),
}).required();
