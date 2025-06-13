import * as Yup from "yup";

export const usuarioSchema = Yup.object({
  nome: Yup.string()
    .min(5, "Nome: necessário mínimo de 5 caracteres")
    .max(200, "Nome: permitido até 200 caracteres")
    .required("Nome: preenchimento do campo é obrigatório"),
  email: Yup.string()
    .min(6, "E-mail: necessário mínimo de 6 caracteres")
    .max(200, "E-mail: permitido até 200 caracteres")
    .email("Email: preencher campo no formato de e-mail") // deve estar no formato de e-mail
    .required("E-mail: preenchimento do campo é obrigatório"),
  dtnasc: Yup.date()
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
  foto: Yup.mixed() // O campo foto é um array de FileList, Yup.mixed() é para arquivos, objetos e arrays
    .nullable() // permite nulo
    .notRequired() // O campo foto é opcional: ele só vai validar se o campo estiver preenchido
    .test(
      "verificaFoto",
      "Foto: formato de arquivo informado é inválido. Use: .jpg, .jpeg, .png ou .gif.",
      function (value) {
        // console.log("Arquivo");
        // console.log(value);
        // se array de arquivos do FileInput é vazio então nem verifica
        // se vazio, null ou undefined ele NÃO vai testar o conteúdo
        // pois o campo é OPCIONAL (not Required)
        if (!value || value.length === 0) return true; // não selecionou arquivo

        // value é array de FileList
        // pra isso preciso achar o file.name pra saber o nome do item
        // só testa o campo se ele tiver preenchido
        const arquivo = value[0];
        return /\.(jpg|jpeg|png|gif)$/i.test(arquivo.name); // aplica regex
      }
    ), // caso NÃO seja nulo ele vai verificar se é: undefined ou <> de "". Caso seja ele vai ver se há o tipo de arquivo informado no caminho

  ativo: Yup.boolean() // verifica checkbox
    .required("Usuário Status: campo obrigatório para preenchimento")
    .oneOf(
      [true, false],
      "Usuário Status: necessário informar se usuário está ou não ativo"
    ),
}).required();

export const usuarioEditSchema = Yup.object({
  nome: Yup.string()
    .min(5, "Nome: necessário mínimo de 5 caracteres")
    .max(200, "Nome: permitido até 200 caracteres")
    .required("Nome: preenchimento do campo é obrigatório"),
  dtnasc: Yup.date()
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
  foto: Yup.mixed() // O campo foto é um array de FileList, Yup.mixed() é para arquivos, objetos e arrays
    .nullable() // permite nulo
    .notRequired() // O campo foto é opcional: ele só vai validar se o campo estiver preenchido
    .test(
      "verificaFoto",
      "Foto: formato de arquivo informado é inválido. Use: .jpg, .jpeg, .png ou .gif.",
      function (value) {
        // console.log("Arquivo");
        // console.log("Valor da foto", value); // Log para depuração
        // se array de arquivos do FileInput é vazio então nem verifica
        // se vazio, null ou undefined ele NÃO vai testar o conteúdo
        // pois o campo é OPCIONAL (not Required)
        // if (!value || value.length === 0) return true; // não selecionou arquivo

        // Se o valor for vazio ou um array vazio, não faz validação (campo opcional)
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return true;
        }

        // Verifico se é Blob (imagem veio da API) ou File (selecionou pelo File Input)
        const arquivo = value instanceof Blob ? value : value[0]; // Verifica se é um Blob ou um File
        // console.log("Arquivo X(Blob ou File)", arquivo); // Log para depuração
        // console.log("É arquivo?"); // Log para depuração
        // console.log(arquivo instanceof File); // Vai retornar true se arquivo for uma instância de File, ou false caso contrário.
        // console.log("Nome do Arquivo", arquivo.name); // Log para depuração

        // Se for um Blob, então ele não terá um nome
        // no caso só consigo verificar se é imagem válida pois NÃO HOUVE ALTERAÇÃO DE IMAGEM
        if (arquivo instanceof Blob) {
          // console.log("Tipo de MIME do arquivo (Blob):", arquivo.type); // Log para depuração
          // Para um Blob, verificamos o tipo mime, que também pode indicar o formato da imagem
          // return /\.(jpg|jpeg|png|gif)$/i.test(arquivo.type); // Validação pelo tipo MIME
          // Garanto que o tipo MIME seja minúsculo para evitar falhas de validação devido a maiúsculas
          const tipoMime = arquivo.type.toLowerCase();
          // const validaBlob = /\.(jpg|jpeg|png|gif)$/i.test(tipoMime); // Validação pelo tipo MIME
          const validaBlob = /^(image\/(jpeg|jpg|png|gif))$/i.test(tipoMime);
          // console.log("Validação:");
          // console.log(validaBlob);
          return validaBlob;
        }

        // Agora se for tipo File implica que ele escolheu arquivo do FileInput
        if (arquivo instanceof File) {
          // console.log("Nome do arquivo (File):", arquivo.name); // Log para depuração
          // return /\.(jpg|jpeg|png|gif)$/i.test(arquivo.name); // Validação pelo nome do arquivo
          const validaFile = /\.(jpg|jpeg|png|gif)$/i.test(arquivo.name); // Validação pelo tipo MIME
          // console.log("Validação:");
          // console.log(validaFile);
          return validaFile;
        }

        return false; // Caso não seja nem File nem Blob
      }
    ), // caso NÃO seja nulo ele vai verificar se é: undefined ou <> de "". Caso seja ele vai ver se há o tipo de arquivo informado no caminho

  ativo: Yup.boolean() // verifica checkbox
    .required("Usuário Status: campo obrigatório para preenchimento")
    .oneOf(
      [true, false],
      "Usuário Status: necessário informar se usuário está ou não ativo"
    ),
}).required();

export const usuarioEmailSchema = Yup.object({
  emailNovo: Yup.string()
    .min(6, "E-mail: necessário mínimo de 6 caracteres")
    .max(200, "E-mail: permitido até 200 caracteres")
    .email("Email: preencher campo no formato de e-mail") // deve estar no formato de e-mail
    .required("E-mail: preenchimento do campo é obrigatório"),
}).required();
