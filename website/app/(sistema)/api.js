"use server";

export async function ListaDadosAdmin() {
  const args = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
  };

  // console.log(args.body);

  // console.log(args.body);
  const url = process.env.API_URL + "/dashboard/dashadmin";

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

export async function ListaDadosSec() {
  const args = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
  };

  // console.log(args.body);

  // console.log(args.body);
  const url = process.env.API_URL + "/dashboard/dashsec";

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
