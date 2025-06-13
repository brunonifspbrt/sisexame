"use server";

export async function ListarGrid(data) {
  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    body: JSON.stringify(data),
  };

  // console.log(args.body);

  // console.log(args.body);
  const url = process.env.API_URL + "/resumo/gridresumo";

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

export async function ListarExames(data) {
  const args = {
    method: "GET",
    headers: {
      "x-api-key": process.env.API_KEY,
    },
    cache: "no-store",
  };

  const url = process.env.API_URL + "/resumo/selectexames";

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
      // console.log(resultData);
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

export async function ListarPacientes(data) {
  const args = {
    method: "GET",
    headers: {
      "x-api-key": process.env.API_KEY,
    },
    cache: "no-store",
  };

  const url = process.env.API_URL + "/resumo/selectpacientes";

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
      // console.log(resultData);
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

  const url = process.env.API_URL + "/resumo/" + id;

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
