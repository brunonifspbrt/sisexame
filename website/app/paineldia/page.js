"use client";
import { useEffect, useState } from "react";
import { Card, Spinner } from "flowbite-react";
import PainelCabecalho from "./cabecalho";
import PainelDetalhe from "./detalhe";
import { ListarExames, ListarDados } from "./api";
import { toast } from "react-toastify";
import PainelFiltro from "./filtro";

const PainelPage = () => {
  const [buscaRegistro, setBuscaRegistro] = useState(null);
  const [dadosOriginal, setDadosOriginal] = useState([]); // armazena dados que chegam da API (sem filtro)
  const [dadosFiltrados, setDadosFiltrados] = useState([]); // armazena dados com filtro atual
  // const [dataAtual, setDataAtual] = useState(null); // obtem data do dia
  const [dataAtual, setDataAtual] = useState(new Date()); // obtem data do dia
  const [busy, setBusy] = useState(false); // identifica se está ocupado ou não
  const [exames, setExames] = useState([]);
  const [exameCod, setExameCod] = useState(null);
  const [exibeMsg, setExibeMsg] = useState(false);

  // console.log("Data Atual");
  // console.log(dataAtual);

  const buscaExames = async () => {
    let resultado = null;
    resultado = await ListarExames();
    //console.log(resultado);

    try {
      if (resultado.success) {
        // console.log("Lista de pacientes");
        // console.log(resultado.data);
        setExames(resultado.data);
      } else {
        setExames([]);
        if (resultado.message !== "")
          toast.error("Painel:" + resultado.message);
      }
    } catch {
      toast.error("Painel: unknown error(1)");
    }
  };

  // busca dados da API
  const buscaDados = async (valorData) => {
    // let dtPainel;
    // // se for passado valor então ele formata
    // // caso contrário ele obtém data atual
    // if (dataAtual) {
    //   console.log("Oi");
    //   // Se valData foi passado, tenta criar uma data válida e formatar
    //   const data = new Date(dataAtual);
    //   const ano = data.getFullYear();
    //   const mes = String(data.getMonth() + 1).padStart(2, "0");
    //   const dia = String(data.getDate()).padStart(2, "0");
    //   dtPainel = `${ano}-${mes}-${dia}`;
    // } else {
    //   console.log("Oi 2");
    //   // obtem data atual (só parte data)
    //   // const dtAtual = new Date().toISOString().split("T")[0];
    //   const hoje = new Date().toLocaleDateString("pt-BR");
    //   const [dia, mes, ano] = hoje.split("/");
    //   dtPainel = `${ano}-${mes}-${dia}`;
    // }

    const data = new Date(valorData || dataAtual);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    const dtPainel = `${ano}-${mes}-${dia}`;

    const dados = {
      dataPainel: dtPainel,
      codExame: null,
    };

    // console.log(dados);

    // if (exameCod) {
    //   dados.codExame = exameCod;
    // } else {
    //   dados.codExame = null;
    // }

    // console.log("Objeto Json");
    // console.log(dados);
    let resultado = null;
    resultado = await ListarDados(dados);
    //console.log(resultado);

    try {
      if (resultado.success) {
        // console.log("Lista de pacientes");
        // console.log(resultado.data);
        setDadosOriginal(resultado.data);
      } else {
        setDadosOriginal([]);
        if (resultado.message !== "")
          toast.error("Painel:" + resultado.message);
      }
    } catch {
      toast.error("Painel: unknown error(2)");
    }
  };
  // const buscaDados = async () => {
  //   // obtem data atual (só parte data)
  //   const dtPainel = new Date().toISOString().split("T")[0];

  //   const dados = {
  //     dataPainel: dtPainel,
  //     codExame: null,
  //   };

  //   // if (exameCod) {
  //   //   dados.codExame = exameCod;
  //   // } else {
  //   //   dados.codExame = null;
  //   // }

  //   // console.log("Objeto Json");
  //   // console.log(dados);
  //   let resultado = null;
  //   resultado = await ListarDados(dados);
  //   //console.log(resultado);

  //   try {
  //     if (resultado.success) {
  //       // console.log("Lista de pacientes");
  //       // console.log(resultado.data);
  //       setDadosOriginal(resultado.data);
  //     } else {
  //       setDadosOriginal([]);
  //       if (resultado.message !== "")
  //         toast.error("Painel:" + resultado.message);
  //     }
  //   } catch {
  //     toast.error("Painel: unknown error(2)");
  //   }
  // };

  const atualizaCodExame = (codExame) => {
    // filtra os dados
    // console.log("Filtro Exame aplicado:");
    // console.log(codExame);
    if (codExame > 0) {
      setExameCod((p) => codExame);
    } else {
      setExameCod((p) => null);
    }
  };

  const atualizaDataAgendamento = (valorData) => {
    if (!valorData) return;

    const dataConvertida = new Date(valorData);

    if (isNaN(dataConvertida.getTime())) {
      setDataAtual(new Date());
      buscaDados(new Date());
    } else {
      setDataAtual(dataConvertida);
      buscaDados(dataConvertida);
    }

    // filtra os dados
    // console.log("Filtro Exame aplicado:");
    // console.log(valorData);
    // if (valorData > 0) {
    //   setDataAtual(valorData);
    //   buscaDados();
    // }
  };

  const filtraDados = (codEx, dadosBD) => {
    // filtra os dados
    // filtra dados
    // Inicializa a variável que controla a exibição da mensagem
    // setExibeMsg((p) => false);
    let exibirMensagem = false;

    if (codEx && dadosBD.length > 0) {
      const filtrados = dadosBD.filter((item) => item.exameCod == codEx);
      // console.log("Dados BD sendo filtrados:");
      // console.log("Cod. Exame: " + codEx);
      // console.log(filtrados.length);
      // console.log(filtrados);
      setDadosFiltrados(filtrados);
    } else {
      // setDadosFiltrados(dadosBD.length > 2 ? dadosBD.slice(0, 1) : dadosBD);
      // sem filtro: só passa primeiro código de exame pra não deixar a tela confusa
      setDadosFiltrados(dadosBD.slice(0, 1));
      // console.log("Vai Exibir Mensagem");
      // console.log(dadosBD.length > 2);
      // setExibeMsg((p) => dadosBD.length > 2);
      // Define a exibição da mensagem se houver mais de 2 registros
      exibirMensagem = dadosBD.length > 2;
    }
    // setExibeMsg((p) => true);
    // Atualiza o estado de exibição da mensagem
    setExibeMsg(exibirMensagem);
  };

  useEffect(() => {
    filtraDados(exameCod, dadosOriginal);
  }, [exameCod, dadosOriginal]);

  // Buscar os dados ao carregar a página
  useEffect(() => {
    const carregarTudo = async () => {
      setBusy((p) => true);
      await buscaExames(); // busca lista de exames
      await buscaDados(); // busca dados com/sem tipo de exame filtrado
      setBusy((p) => false);
    };

    if (buscaRegistro === null) setBuscaRegistro(true);

    if (buscaRegistro) {
      setBuscaRegistro(false);
      carregarTudo();
    }
  }, [buscaRegistro]);

  // aqui eu atualizo, de tempo em tempo os dados da API
  // isso só vai ocorrer se exameCod > 0
  // useEffect(() => {
  //   let intervalo;

  //   if (exameCod > 0) {
  //     intervalo = setInterval(async () => {
  //       // setBusy(true);
  //       console.log("Atenção: Busca na API pois tem código de exame!");
  //       await buscaDados();
  //       filtraDados(exameCod, dadosOriginal);
  //       // setBusy(false);
  //     }, 5000); // Executa a cada  segundos
  //   }

  //   // Cleanup do intervalo quando exameCod for nulo ou quando o componente for desmontado
  //   return () => {
  //     if (intervalo) clearInterval(intervalo);
  //   };
  // }, [exameCod]);

  useEffect(() => {
    let intervalo;

    if (exameCod > 0) {
      intervalo = setInterval(async () => {
        // setBusy(true);
        // console.log("Atenção: Busca na API pois tem código de exame!");
        await buscaDados(dataAtual); // passar a dataAtual aqui
        filtraDados(exameCod, dadosOriginal);
        // setBusy(false);
      }, 5000); // Executa a cada  segundos
    }

    // Cleanup do intervalo quando exameCod for nulo ou quando o componente for desmontado
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [exameCod, dataAtual]);

  return (
    <div className="w-full min-h-[calc(100vh-80px)]">
      {busy ? (
        <div className="mt-2 flex justify-center items-center min-h-[300px]">
          <Spinner size="xl" aria-label="Spinner Carregando" light />
        </div>
      ) : (
        <>
          <PainelCabecalho dtAgendamento={dataAtual} />
          {/* Mostrar a mensagem de alerta se houver mais de 2 registros */}
          {exibeMsg && (
            <div className="mt-2 mb-4 text-2xl text-yellow-800 dark:text-yellow-400 text-center font-semibold">
              Há muitos exames para exibição, aplique o filtro para melhor
              visualização.
            </div>
          )}
          <Card className="mt-1 mb-3 bg-gray-800">
            <PainelFiltro
              dadosExames={exames}
              atualizaExame={atualizaCodExame}
              atualizaDtAgenda={atualizaDataAgendamento}
            />
          </Card>
          <Card className="mb-3 dark:bg-gray-800 dark:text-white">
            {dadosFiltrados.map((exame, index) => (
              <PainelDetalhe key={index} exame={exame} />
            ))}
          </Card>
        </>
      )}
    </div>
  );
};

export default PainelPage;
