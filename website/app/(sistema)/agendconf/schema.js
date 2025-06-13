import * as Yup from "yup";

export const filtroSchema = Yup.object({
  dtAgenda: Yup.date()
    .required("Data de Agendamento: preenchimento do campo é obrigatório")
    .typeError("Informe uma data válida!")
    .min(
      new Date("1900-01-01"),
      "Data de Agendamento: data não pode ser menor que 01/01/1900"
    )
    .max(
      new Date("2050-12-31"),
      "Data de Agendamento: data não pode ser maior que 31/12/2050"
    )
    .test(
      "ano-valido", // nome da função
      "Data de Agendamento: ano deve iniciar a partir de 1900", // mensagem de erro caso teste falhe
      function (value) {
        if (!value) return true; //se não tiver valor no campo retorna true pois o tratamento é feito em required
        const year = value.getFullYear(); // obtém ano do campo informado
        // // o split T separa a data quando houver o texto YYYY-MM-DDTHH:mm:ss.sssZ, o [0] pega a data no formato YYYY-MM-DD
        // console.log("Data teste");
        // console.log(value);
        // console.log(year);
        //const yearString = value.toISOString().split("-")[0];
        // teste será válido somente se ano for maior que 1900
        // caso o ano seja do formato de data: 02/01/0001 (onde converte 0001) ele não aceitará
        // aqui confirmo se a data que veio de FullYear (que pode converter 0001 para 1901)
        // é a mesma da string que peguei
        // return year >= 1900 && yearString === `${year}`;
        return year >= 1900;
      }
    ),
}).required();

export const pacienteSchema = Yup.object({
  cpf: Yup.string()
    .length(11, "CPF: deve conter 11 caracteres")
    .matches(/^\d+$/, "CPF: deve conter apenas números") // verifica se foi infomado somente números
    .required("CPF: preenchimento do campo é obrigatório"),
  nome: Yup.string()
    .min(5, "Nome: necessário mínimo de 5 caracteres")
    .max(200, "Nome: permitido até 200 caracteres")
    .required("Nome: preenchimento do campo é obrigatório"),
  email: Yup.string()
    .min(6, "E-mail: necessário mínimo de 6 caracteres")
    .max(200, "E-mail: permitido até 200 caracteres")
    .email("Email: preencher campo no formato de e-mail") // deve estar no formato de e-mail
    .required("E-mail: preenchimento do campo é obrigatório"),
  datanascimento: Yup.date()
    .required("Data de Nascimento: preenchimento do campo é obrigatório")
    .typeError("Informe uma data válida!")
    .min(
      new Date("1900-01-01"),
      "Data de Nascimento: data não pode ser menor que 01/01/1900"
    )
    .max(
      new Date("2050-12-31"),
      "Data de Nascimento: data não pode ser maior que 31/12/2050"
    )
    .test(
      "ano-valido", // nome da função
      "Data de Nascimento: ano deve iniciar a partir de 1900", // mensagem de erro caso teste falhe
      function (value) {
        if (!value) return true; //se não tiver valor no campo retorna true pois o tratamento é feito em required
        const year = value.getFullYear(); // obtém ano do campo informado
        // // o split T separa a data quando houver o texto YYYY-MM-DDTHH:mm:ss.sssZ, o [0] pega a data no formato YYYY-MM-DD
        // console.log("Data teste");
        // console.log(value);
        // console.log(year);
        //const yearString = value.toISOString().split("-")[0];
        // teste será válido somente se ano for maior que 1900
        // caso o ano seja do formato de data: 02/01/0001 (onde converte 0001) ele não aceitará
        // aqui confirmo se a data que veio de FullYear (que pode converter 0001 para 1901)
        // é a mesma da string que peguei
        // return year >= 1900 && yearString === `${year}`;
        return year >= 1900;
      }
    ),
  obs: Yup.string().max(500, "Observação: permitido até 500 caracteres"),
}).required();
