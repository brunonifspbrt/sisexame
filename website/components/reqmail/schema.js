import * as Yup from "yup";

export const usuariomailSchema = Yup.object({
  emailNovo: Yup.string()
    .min(6, "E-mail: necessário mínimo de 6 caracteres")
    .max(200, "E-mail: permitido até 200 caracteres")
    .email("Email: preencher campo no formato de e-mail") // deve estar no formato de e-mail
    .required("E-mail: preenchimento do campo é obrigatório"),
}).required();
