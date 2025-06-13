"use server";

export async function Inserir(data) {
  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    body: JSON.stringify(data),
  };

  const url = process.env.API_URL + "/exame";

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
      retorno.message = "Exame salvo com sucesso";
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

export async function Listar(data) {
  const args = {
    method: "GET",
    headers: {
      "x-api-key": process.env.API_KEY,
    },
    cache: "no-store",
  };

  const url = process.env.API_URL + "/exame";

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

export async function Excluir(id) {
  const args = {
    method: "DELETE",
    headers: {
      "x-api-key": process.env.API_KEY,
    },
  };

  const url = process.env.API_URL + "/exame/" + id;

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
      retorno.message = "Exame removido com sucesso";
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

  const url = process.env.API_URL + "/exame/" + id;

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

export async function Atualizar(data) {
  const args = {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    body: JSON.stringify(data),
  };

  const url = process.env.API_URL + "/exame/" + data.id;

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
      retorno.message = "Exame atualizado com sucesso";
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
