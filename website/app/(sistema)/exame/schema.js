import * as Yup from "yup";

export const exameSchema = Yup.object({
  nome: Yup.string()
    .min(5, "Nome: necessário mínimo de 5 caracteres")
    .max(200, "Nome: permitido até 200 caracteres")
    .required("Nome: preenchimento do campo é obrigatório"),
  descricao: Yup.string()
    .min(5, "Descrição: necessário mínimo de 5 caracteres")
    .max(250, "Descrição: permitido até 250 caracteres")
    .required("Descrição: preenchimento do campo é obrigatório"),
  duracao: Yup.number() // define que é número
    .transform((value, originalValue) => {
      // se o valor original for campo vazio: retorna undefined
      // assim evita converter texto vazio para numero onde dá erro NaN
      return originalValue === "" ? undefined : value;
    })
    .test(
      "duracao-required", // nome do texto
      "Duração do Exame: preenchimento do campo é obrigatório", // mensagem caso teste dê falso
      (value) =>
        value !== undefined && value !== null && value !== "" && !isNaN(value) // se o valor for: undefined, null, vazio ou Nan vai gerar mensagem de erro
    )
    .integer("Duração do Exame: valor deve ser um número inteiro")
    .min(
      10,
      "Duração do Exame: tempo do exame deve ser no mínimo de 10 minutos"
    )
    .max(
      600,
      "Duração do Exame: tempo do exame deve ser no máximo de 600 minutos"
    ),
  instrucoes: Yup.string()
    .min(5, "Instruções de Preparo: necessário mínimo de 5 caracteres")
    .max(300, "Instruções de Preparo: permitido até 300 caracteres")
    .required("Instruções de Preparo: preenchimento do campo é obrigatório"),
  ativo: Yup.boolean() // verifica checkbox
    .required("Exame Status: campo obrigatório para preenchimento")
    .oneOf(
      [true, false],
      "Exame Status: necessário informar se exame está ou não ativo"
    ),
}).required();
