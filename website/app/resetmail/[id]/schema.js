import * as Yup from "yup";

export const mailSchema = Yup.object({
  codVer: Yup.string().required(
    "Código de Verificação: preenchimento do campo é obrigatório"
  ),
}).required();
