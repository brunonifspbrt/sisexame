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
  const url = process.env.API_URL + "/agendamento/gridatendimento";

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

export async function Finalizar(data) {
  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    body: JSON.stringify(data),
  };

  // console.log("Objeto Json");
  // console.log(args.body);

  const url = process.env.API_URL + "/agendamento/finaliza";

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

export async function ChamarPaciente(data) {
  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    body: JSON.stringify(data),
  };

  // console.log("Objeto Json");
  // console.log(args.body);

  const url = process.env.API_URL + "/agendamento/convocacao";

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

export async function RegistrarAusencia(data) {
  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    body: JSON.stringify(data),
  };

  // console.log("Objeto Json");
  // console.log(args.body);

  const url = process.env.API_URL + "/agendamento/ausenciapac";

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

export async function RegistrarDesistencia(data) {
  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    body: JSON.stringify(data),
  };

  // console.log("Objeto Json");
  // console.log(args.body);

  const url = process.env.API_URL + "/agendamento/desistenciapac";

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

export async function RegistrarListaEspera(data) {
  const args = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    body: JSON.stringify(data),
  };

  // console.log("Objeto Json");
  // console.log(args.body);

  const url = process.env.API_URL + "/agendamento/listaesperapac";

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
