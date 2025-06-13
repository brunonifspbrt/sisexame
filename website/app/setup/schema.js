import * as Yup from "yup";

export const setupSchema = Yup.object({
  nome: Yup.string()
    .min(6, "Nome: necessário mínimo de 6 caracteres")
    .max(200, "Nome: permitido máximo de 200 caracteres")
    .required("Nome: preenchimento do campo é obrigatório"),
  email: Yup.string()
    .min(6, "E-mail: necessário mínimo de 6 caracteres")
    .email("Email: preencher campo no formato de e-mail") // deve estar no formato de e-mail
    .required("E-mail: preenchimento do campo é obrigatório"),
  senha: Yup.string()
    .min(6, "Nova Senha: necessário mínimo de 6 caracteres")
    .max(20, "Nova Senha: permitido máximo de 20 caracteres")
    .required("Nova Senha: preenchimento do campo é obrigatório")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/,
      "Nova Senha deve conter pelo menos 1 letra maiúscula, 1 minúscula e 1 caractere especial"
    ),
  atraso: Yup.number() // define que é número
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
