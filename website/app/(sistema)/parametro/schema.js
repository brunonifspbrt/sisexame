import * as Yup from "yup";

export const parametroSchema = Yup.object({
  atrasoMaximo: Yup.number() // define que é número
    .transform((value, originalValue) => {
      // se o valor original for campo vazio: retorna undefined
      // assim evita converter texto vazio para numero onde dá erro NaN
      return originalValue === "" ? undefined : value;
    })
    .test(
      "duracao-required", // nome do texto
      "Atraso Máximo do Paciente: preenchimento do campo é obrigatório", // mensagem caso teste dê falso
      (value) =>
        value !== undefined && value !== null && value !== "" && !isNaN(value) // se o valor for: undefined, null, vazio ou Nan vai gerar mensagem de erro
    )
    .integer("Atraso Máximo do Paciente: valor deve ser um número inteiro")
    .min(
      10,
      "Atraso Máximo do Paciente: atraso deve ser no mínimo de 10 minutos"
    )
    .max(
      120,
      "Atraso Máximo do Paciente: atraso deve ser no máximo de 120 minutos (2 horas)"
    )
    .required(
      "Atraso Máximo do Paciente: preenchimento do campo é obrigatório"
    ),
}).required();
