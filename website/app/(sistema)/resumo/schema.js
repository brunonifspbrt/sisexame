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
  exameId: Yup.number()
    .transform((value, originalValue) => {
      // se o valor original for campo vazio: retorna undefined
      // assim evita converter texto vazio para numero onde dá erro NaN
      return originalValue === "" ? undefined : value;
    })
    .required("Por favor, selecione um exame.")
    // .positive("ID de exame inválido.")
    .min(0, "ID de exame inválido.")
    .integer("ID de exame inválido."),
  pacienteId: Yup.number()
    .transform((value, originalValue) => {
      // se o valor original for campo vazio: retorna undefined
      // assim evita converter texto vazio para numero onde dá erro NaN
      return originalValue === "" ? undefined : value;
    })
    .required("Por favor, selecione um paciente.")
    // .positive("ID de Paciente inválido.")
    .min(0, "ID de Paciente inválido.")
    .integer("ID de Paciente inválido."),
  sitAgenda: Yup.number()
    .transform((value, originalValue) => {
      // se o valor original for campo vazio: retorna undefined
      // assim evita converter texto vazio para numero onde dá erro NaN
      return originalValue === "" ? undefined : value;
    })
    .required("Por favor, selecione um status de agendamento.")
    // .positive("Status de Agendamento inválido.")
    .min(0, "Status de Agendamento inválido.")
    .integer("Status de Agendamento inválido."),
}).required();
