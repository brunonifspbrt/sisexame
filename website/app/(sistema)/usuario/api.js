"use server";

import crypto from "crypto"; // Importa o módulo crypto para criar o hash SHA256
// Função para criar hash em sha256
function createSHA256Hash(valor) {
  const hash = crypto.createHash("sha256");
  hash.update(valor);
  return hash.digest("hex");
}

// Salt deve ser o mesmo aqui e em telas de alteração de senha
const codSalt = "aq5y47kbn35";

// Função para gerar senha aleatória (primeiro acesso)
function GerarSenhaAleatoria() {
  // Obtém data e hora para incluir na senha aleatória de 10 caracteres
  // Formato: 20230427123045987
  const dataHoraAtual = new Date().toISOString().replace(/[-T:\.Z]/g, ""); // Formato YYYYMMDDHHMMSSfff

  // Gero números aleatórios
  const letras =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let senhaBuilder = "";

  // Inclui parte da data e hora na senha (últimos 4 dígitos)
  senhaBuilder += dataHoraAtual.slice(-4); // Pegando os últimos 4 dígitos da data/hora

  // Adiciona 2 caracteres aleatórios
  for (let i = 0; i < 2; i++) {
    senhaBuilder += letras[Math.floor(Math.random() * letras.length)];
  }

  // Gera 4 dígitos aleatórios adicionais
  for (let i = 0; i < 4; i++) {
    senhaBuilder += Math.floor(Math.random() * 10); // Adiciona um dígito aleatório entre 0 e 9
  }

  // Retorno a senha aleatória de 10 caracteres
  return senhaBuilder;
}

export async function Inserir(data) {
  // Adiciona o campo urlsite ao FormData existente
  data.append("urlsite", process.env.SITE_URL);
  // console.log(data);

  // Sempre para novo usuário crio aqui a senha aleatoria (mesma usada na API)
  const codver = GerarSenhaAleatoria(); // retorno da função GerarSenhaAleatoria
  data.append("codini", codver); // Adiciono o valor de Codigo Aleatorio no FormData
  const codverhash = createSHA256Hash(codver + codSalt);
  data.append("codinihash", codverhash); // Adiciono o valor de Codigo Aleatorio no FormData

  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      // "Content-Type": "application/json", não é json é formdata
      "x-api-key": process.env.API_KEY,
    },
    // body: JSON.stringify(data),
    body: data,
  };

  const url = process.env.API_URL + "/usuario";

  // console.log("Corpo da requisição");
  // console.log(data);

  let retorno = {
    success: undefined,
    message: "",
    data: "",
  };

  try {
    const result = await fetch(url, args); // Espera o fetch terminar
    const resultData = await result.json(); // Espera a conversão para JSON
    // console.log("Sucesso");
    // console.log(result.status);
    // console.log("Mensagem");
    // console.log(resultData);
    // console.log("Senha Nova");
    // console.log(resultData.novaSenha);
    if (result.status === 200) {
      //ações em caso de sucesso
      retorno.success = true;
      retorno.message = resultData;
      // retorno.data = resultData.novaSenha;
    } else {
      //ações em caso de erro
      let errorMessage = "";
      if (resultData.errors != null) {
        const totalErros = Object.keys(resultData.errors).length;
        for (let i = 0; i < totalErros; i++) {
          errorMessage += Object.values(resultData.errors)[i];
        }
      } else {
        errorMessage = resultData;
      }

      retorno.success = false;
      retorno.message = errorMessage;
    }
  } catch (error) {
    // Erro geral (erro na requisição ou na conversão para JSON)
    retorno.success = false;
    retorno.message = error.message;
  }

  // Agora, o retorno só será mostrado após a execução completa do fetch
  //   console.log("Olhe como ficou o objeto retorno");
  //   console.log(retorno);

  return retorno;
}

export async function Excluir(id) {
  const args = {
    method: "DELETE",
    headers: {
      "x-api-key": process.env.API_KEY,
    },
  };

  const url = process.env.API_URL + "/usuario/" + id;

  let retorno = {
    success: undefined,
    message: "",
  };

  try {
    // console.log(id);
    const result = await fetch(url, args); // Espera o fetch terminar
    const resultData = await result.text(); // Converte resultado em texto

    if (result.status === 200) {
      //ações em caso de sucesso
      retorno.success = true;
      retorno.message = "Usuário removido com sucesso";
    } else {
      //ações em caso de erro
      let errorMessage = "";
      if (resultData.errors != null) {
        const totalErros = Object.keys(resultData.errors).length;
        for (let i = 0; i < totalErros; i++) {
          errorMessage += Object.values(resultData.errors)[i];
        }
      } else {
        errorMessage = resultData;
      }

      retorno.success = false;
      retorno.message = errorMessage;
    }
  } catch (error) {
    // Erro geral (erro na requisição ou na conversão para JSON)
    retorno.success = false;
    retorno.message = error.message;
  }

  // Agora, o retorno só será mostrado após a execução completa do fetch
  //   console.log("Olhe como ficou o objeto retorno");
  //   console.log(retorno);

  return retorno;
}

export async function BuscarRegistro(id) {
  const args = {
    method: "GET",
    headers: {
      "x-api-key": process.env.API_KEY,
    },
    cache: "no-store",
  };

  const url = process.env.API_URL + "/usuario/" + id;

  let retorno = {
    success: undefined,
    message: "",
    data: null,
  };

  try {
    // console.log(id);
    const result = await fetch(url, args); // Espera o fetch terminar
    const resultData = await result.json(); // Converte resultado em json

    if (result.status === 200) {
      //ações em caso de sucesso
      retorno.success = true;
      retorno.data = resultData;
    } else {
      //ações em caso de erro
      let errorMessage = "";
      if (resultData.errors != null) {
        const totalErros = Object.keys(resultData.errors).length;
        for (let i = 0; i < totalErros; i++) {
          errorMessage += Object.values(resultData.errors)[i];
        }
      } else {
        errorMessage = resultData;
      }

      retorno.success = false;
      retorno.message = errorMessage;
    }
  } catch (error) {
    // Erro geral (erro na requisição ou na conversão para JSON)
    retorno.success = false;
    retorno.message = error.message;
  }

  // Agora, o retorno só será mostrado após a execução completa do fetch
  //   console.log("Olhe como ficou o objeto retorno");
  //   console.log(retorno);

  return retorno;
}

export async function BuscarFoto(id) {
  const args = {
    method: "GET",
    headers: {
      "x-api-key": process.env.API_KEY,
    },
    cache: "no-store",
  };

  // const url = process.env.API_URL + "/fotos/" + id;
  // const apiUrl = process.env.API_URL.replace("/api", ""); // Remove "/api" se ele existir
  // expressão regular:
  // \/api: refere-se a /api
  // $ no final de api: garante que vai retirar somente /api que existir no final da string
  // Exs:
  // a) http://localhost:8080/api = http://localhost:8080
  // b) http://api:8080/api = http://api:8080
  const apiUrl = process.env.API_URL.replace(/\/api$/, "");

  const url = apiUrl + "/fotos/" + id + ".jpg"; // Ex: http://localhost:5175/fotos/1.jpg
  // console.log(url);
  let retorno = {
    success: undefined,
    message: "",
    data: null,
  };

  try {
    // console.log(id);
    const result = await fetch(url, args); // Espera o fetch terminar
    // console.log(result);
    if (result.status === 200) {
      //como são dados binários (e não JSON) eu transformo em Blob
      // blob representa dados de arquivo em formato binário
      const fotoBlob = await result.blob();
      // console.log("Conteúdo da imagem"); // Verifique se o blob é uma imagem
      // console.log(fotoBlob); // Verifique se o blob é uma imagem
      // Gera uma URL temporária para a foto
      //ações em caso de sucesso
      retorno.success = true;
      retorno.data = fotoBlob; // passa blob diretamente
    } else {
      //ações em caso de erro
      let errorMessage = "";

      try {
        // Tenta transformar o corpo da resposta de erro em JSON
        const resultData = await result.json();
        if (resultData.errors != null) {
          const totalErros = Object.keys(resultData.errors).length;
          for (let i = 0; i < totalErros; i++) {
            errorMessage += Object.values(resultData.errors)[i];
          }
        } else {
          errorMessage = resultData.message;
        }
      } catch (error) {
        console.log("Busca Foto - Erro (1): " + error.Message);
        retorno.success = false;
        retorno.message = error.Message;
      }
    }
  } catch (error) {
    // Erro geral (erro na requisição ou na conversão para JSON)
    console.log("Busca Foto - Erro (2): " + error.Message);
    retorno.success = false;
    retorno.message = error.message;
  }

  // Agora, o retorno só será mostrado após a execução completa do fetch
  //   console.log("Olhe como ficou o objeto retorno");
  //   console.log(retorno);

  return retorno;
}

// export async function BuscarFoto(id) {
//   const args = {
//     method: "GET",
//     headers: {
//       "x-api-key": process.env.API_KEY,
//     },
//     cache: "no-store",
//   };

//   const url = process.env.API_URL + "/foto/" + id;

//   let retorno = {
//     success: undefined,
//     message: "",
//     data: null,
//   };

//   try {
//     // console.log(id);
//     const result = await fetch(url, args); // Espera o fetch terminar

//     if (result.status === 200) {
//       const fotoBlob = await result.blob(); // Pego a foto como um blob (pois conteudo é binario)
//       // Gera uma URL temporária para a foto
//       const fotoUrl = URL.createObjectURL(fotoBlob);
//       //ações em caso de sucesso
//       retorno.success = true;
//       retorno.data = fotoUrl; // passa a url pra usar no componente Img
//     } else {
//       //ações em caso de erro
//       let errorMessage = "";
//       if (resultData.errors != null) {
//         const totalErros = Object.keys(resultData.errors).length;
//         for (let i = 0; i < totalErros; i++) {
//           errorMessage += Object.values(resultData.errors)[i];
//         }
//       } else {
//         errorMessage = resultData;
//       }

//       retorno.success = false;
//       retorno.message = errorMessage;
//     }
//   } catch (error) {
//     // Erro geral (erro na requisição ou na conversão para JSON)
//     retorno.success = false;
//     retorno.message = error.message;
//   }

//   // Agora, o retorno só será mostrado após a execução completa do fetch
//   //   console.log("Olhe como ficou o objeto retorno");
//   //   console.log(retorno);

//   return retorno;
// }

export async function Atualizar(data, idUsuario) {
  // Adiciona o campo urlsite ao FormData existente
  data.append("urlsite", process.env.SITE_URL);
  // console.log(data);

  const args = {
    method: "PUT",
    headers: {
      Accept: "application/json",
      // "Content-Type": "application/json", não é json é formdata
      "x-api-key": process.env.API_KEY,
    },
    body: data,
  };

  // console.log("Objeto Json");
  // console.log(args.body);

  const url = process.env.API_URL + "/usuario/" + idUsuario;
  //console.log(url);

  let retorno = {
    success: undefined,
    message: "",
  };

  try {
    const result = await fetch(url, args); // Espera o fetch terminar
    const resultData = await result.json(); // Espera a conversão para JSON

    if (result.status === 200) {
      //ações em caso de sucesso
      retorno.success = true;
      retorno.message = "Usuário atualizado com sucesso";
    } else {
      //ações em caso de erro
      let errorMessage = "";
      if (resultData.errors != null) {
        const totalErros = Object.keys(resultData.errors).length;
        for (let i = 0; i < totalErros; i++) {
          errorMessage += Object.values(resultData.errors)[i];
        }
      } else {
        errorMessage = resultData;
      }

      retorno.success = false;
      retorno.message = errorMessage;
    }
  } catch (error) {
    // Erro geral (erro na requisição ou na conversão para JSON)
    retorno.success = false;
    retorno.message = error.message;
  }

  // Agora, o retorno só será mostrado após a execução completa do fetch
  //   console.log("Olhe como ficou o objeto retorno");
  //   console.log(retorno);

  return retorno;
}

// export async function Atualizar(data) {
//   const args = {
//     method: "PUT",
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//       "x-api-key": process.env.API_KEY,
//     },
//     body: JSON.stringify(data),
//   };

//   // console.log("Objeto Json");
//   // console.log(args.body);

//   const url = process.env.API_URL + "/usuario/" + data.id;

//   let retorno = {
//     success: undefined,
//     message: "",
//   };

//   try {
//     const result = await fetch(url, args); // Espera o fetch terminar
//     const resultData = await result.json(); // Espera a conversão para JSON

//     if (result.status === 200) {
//       //ações em caso de sucesso
//       retorno.success = true;
//       retorno.message = "Usuário atualizado com sucesso";
//     } else {
//       //ações em caso de erro
//       let errorMessage = "";
//       if (resultData.errors != null) {
//         const totalErros = Object.keys(resultData.errors).length;
//         for (let i = 0; i < totalErros; i++) {
//           errorMessage += Object.values(resultData.errors)[i];
//         }
//       } else {
//         errorMessage = resultData;
//       }

//       retorno.success = false;
//       retorno.message = errorMessage;
//     }
//   } catch (error) {
//     // Erro geral (erro na requisição ou na conversão para JSON)
//     retorno.success = false;
//     retorno.message = error.message;
//   }

//   // Agora, o retorno só será mostrado após a execução completa do fetch
//   //   console.log("Olhe como ficou o objeto retorno");
//   //   console.log(retorno);

//   return retorno;
// }

export async function ListarGrid(data) {
  const args = {
    method: "GET",
    headers: {
      "x-api-key": process.env.API_KEY,
    },
    cache: "no-store",
  };

  const url = process.env.API_URL + "/usuario/gridusuario";

  let retorno = {
    success: undefined,
    message: "",
    data: null,
  };

  try {
    const result = await fetch(url, args); // Espera o fetch terminar
    const resultData = await result.json(); // Espera a conversão para JSON

    if (result.status === 200) {
      //ações em caso de sucesso
      retorno.success = true;
      retorno.data = resultData;
    } else {
      //ações em caso de erro
      let errorMessage = "";
      if (resultData.errors != null) {
        const totalErros = Object.keys(resultData.errors).length;
        for (let i = 0; i < totalErros; i++) {
          errorMessage += Object.values(resultData.errors)[i];
        }
      } else {
        errorMessage = resultData;
      }

      retorno.success = false;
      retorno.message = errorMessage;
    }
  } catch (error) {
    // Erro geral (erro na requisição ou na conversão para JSON)
    retorno.success = false;
    retorno.message = error.message;
  }

  // Agora, o retorno só será mostrado após a execução completa do fetch
  //   console.log("Olhe como ficou o objeto retorno");
  //   console.log(retorno);

  return retorno;
}

export async function SolicitaAltSenha(data) {
  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    // body: JSON.stringify(data),
    body: JSON.stringify({
      ...data,
      urlSite: `${process.env.SITE_URL}/resetpwd/${data.usuarioId}`, // adiciona o caminho do site para resetar senha
    }),
  };

  //   console.log("Objeto Json");
  //   console.log(args.body);

  const url = process.env.API_URL + "/usuario/reqpwd";

  let retorno = {
    success: undefined,
    message: "",
  };

  try {
    const result = await fetch(url, args); // Espera o fetch terminar
    const resultData = await result.json(); // Espera a conversão para JSON

    if (result.status === 200) {
      //ações em caso de sucesso
      retorno.success = true;
      // retorno.message = "Email reenviado com sucesso";
      retorno.message = resultData;
    } else {
      //ações em caso de erro
      let errorMessage = "";
      if (resultData.errors != null) {
        const totalErros = Object.keys(resultData.errors).length;
        for (let i = 0; i < totalErros; i++) {
          errorMessage += Object.values(resultData.errors)[i];
        }
      } else {
        errorMessage = resultData;
      }

      retorno.success = false;
      retorno.message = errorMessage;
    }
  } catch (error) {
    // Erro geral (erro na requisição ou na conversão para JSON)
    retorno.success = false;
    retorno.message = error.message;
  }

  // Agora, o retorno só será mostrado após a execução completa do fetch
  //   console.log("Olhe como ficou o objeto retorno");
  //   console.log(retorno);

  return retorno;
}

export async function SolicitaAltEmail(data) {
  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    // body: JSON.stringify(data),
    body: JSON.stringify({
      ...data,
      urlsite: `${process.env.SITE_URL}/resetmail/${data.usuarioID}`, // adiciona o caminho do site para resetar senha
    }),
  };

  //   console.log("Objeto Json");
  //   console.log(args.body);

  const url = process.env.API_URL + "/usuario/reqmail";

  let retorno = {
    success: undefined,
    message: "",
  };

  try {
    const result = await fetch(url, args); // Espera o fetch terminar
    const resultData = await result.json(); // Espera a conversão para JSON

    if (result.status === 200) {
      //ações em caso de sucesso
      retorno.success = true;
      // retorno.message = "Email reenviado com sucesso";
      retorno.message = resultData;
    } else {
      //ações em caso de erro
      let errorMessage = "";
      if (resultData.errors != null) {
        const totalErros = Object.keys(resultData.errors).length;
        for (let i = 0; i < totalErros; i++) {
          errorMessage += Object.values(resultData.errors)[i];
        }
      } else {
        errorMessage = resultData;
      }

      retorno.success = false;
      retorno.message = errorMessage;
    }
  } catch (error) {
    // Erro geral (erro na requisição ou na conversão para JSON)
    retorno.success = false;
    retorno.message = error.message;
  }

  // Agora, o retorno só será mostrado após a execução completa do fetch
  //   console.log("Olhe como ficou o objeto retorno");
  //   console.log(retorno);

  return retorno;
}

export async function EnviarEmailAcesso(data) {
  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    // body: JSON.stringify(data),
    body: JSON.stringify({
      ...data,
      urlSite: `${process.env.SITE_URL}`, // adiciona o caminho do site para resetar senha
    }),
  };

  //   console.log("Objeto Json");
  //   console.log(args.body);

  const url = process.env.API_URL + "/usuario/emailacesso";

  let retorno = {
    success: undefined,
    message: "",
  };

  try {
    const result = await fetch(url, args); // Espera o fetch terminar
    const resultData = await result.json(); // Espera a conversão para JSON

    if (result.status === 200) {
      //ações em caso de sucesso
      retorno.success = true;
      // retorno.message = "Email reenviado com sucesso";
      retorno.message = resultData;
    } else {
      //ações em caso de erro
      let errorMessage = "";
      if (resultData.errors != null) {
        const totalErros = Object.keys(resultData.errors).length;
        for (let i = 0; i < totalErros; i++) {
          errorMessage += Object.values(resultData.errors)[i];
        }
      } else {
        errorMessage = resultData;
      }

      retorno.success = false;
      retorno.message = errorMessage;
    }
  } catch (error) {
    // Erro geral (erro na requisição ou na conversão para JSON)
    retorno.success = false;
    retorno.message = error.message;
  }

  // Agora, o retorno só será mostrado após a execução completa do fetch
  //   console.log("Olhe como ficou o objeto retorno");
  //   console.log(retorno);

  return retorno;
}
