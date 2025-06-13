import * as Yup from "yup";

// // Validação personalizada para o horário (reproduzindo a lógica de "HorarioValido")
// const horarioValido = (value) => {
//   const dataMinima = new Date("1990-01-01");
//   const dataMaxima = new Date("2050-12-31");

//   // Verifica se é uma data válida
//   if (!value || isNaN(new Date(value))) {
//     return "O horário fornecido não é válido.";
//   }

//   const data = new Date(value);

//   // Verifica a data
//   if (data < dataMinima || data > dataMaxima) {
//     return "A data deve estar entre 01/01/1990 e 31/12/2050.";
//   }

//   // Verifica se o horário está entre 08:00 e 18:00
//   const hora = data.getHours();
//   if (hora < 8 || hora > 18) {
//     return "O horário deve estar entre 08:00 e 18:00.";
//   }

//   return true;
// };

export const agendamentoSchema = Yup.object({
  pacienteid: Yup.number()
    .transform((value, originalValue) => {
      // se o valor original for campo vazio: retorna undefined
      // assim evita converter texto vazio para numero onde dá erro NaN
      return originalValue === "" ? undefined : value;
    })
    .required("Paciente: Necessário informar paciente para agendamento")
    .integer(
      "Paciente: não foi possível identificar paciente. Tente novamente"
    ),
  exameid: Yup.number()
    .transform((value, originalValue) => {
      // se o valor original for campo vazio: retorna undefined
      // assim evita converter texto vazio para numero onde dá erro NaN
      return originalValue === "" ? undefined : value;
    })
    .required("Exame: Necessário informar exame para agendamento")
    .integer("Exame: não foi possível identificar Exame. Tente novamente"),
  horini: Yup.date()
    .required("Data Agendamento: preenchimento do campo é obrigatório")
    .typeError("Informe data válida")
    .min(
      new Date("1990-01-01"),
      "Data do Agendamento não pode ser menor que 01/01/1990"
    )
    .max(
      new Date("2050-12-31"),
      "Data do Agendamento não pode ser menor que 31/12/2050"
    )
    .test(
      "ano-valido", // nome da função
      "Data de Nascimento: ano deve estar entre 1990 e 2050", // mensagem de erro caso teste falhe
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
        return year >= 1990 && year <= 2050;
      }
    ),
}).required();

//  // Validação de Horário de Início (HorIni)
//  horini: Yup.date()
//  .required("Horário de início é obrigatório")
//  .test(
//    "horario-valido",
//    "O horário deve estar entre 08:00 e 18:00 e a data entre 01/01/1990 e 31/12/2050",
//    horarioValido
//  )
