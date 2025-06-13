import * as Yup from "yup";

export const terminalSchema = Yup.object({
  cpf: Yup.string()
    .length(11, "CPF: deve conter 11 caracteres")
    .matches(/^\d+$/, "CPF: deve conter apenas números") // verifica se foi infomado somente números
    .required("CPF: preenchimento do campo é obrigatório"),
}).required();
