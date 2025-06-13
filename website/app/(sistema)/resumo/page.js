"use client";

import { ResumoContext } from "./context";
import { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Label,
  TextInput,
  Badge,
  Pagination,
  Dropdown,
  DropdownItem,
  Tooltip,
  Select,
} from "flowbite-react";
import { ListarGrid, ListarExames, ListarPacientes } from "./api";
import { Spinner } from "flowbite-react";
import {
  FaQuestion,
  FaTimesCircle,
  FaUserCheck,
  FaUserSlash,
  FaUserTimes,
  FaUserLock,
} from "react-icons/fa";
import { HiOutlineSearch, HiEye } from "react-icons/hi";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { filtroSchema } from "./schema";
import Detalhe from "./detalhe";

const Home = () => {
  const [buscaRegistro, setBuscaRegistro] = useState(null);
  const [dados, setDados] = useState(null); // dados exibidos na tabela
  const [dadosOriginal, setDadosOriginal] = useState(null); // dados obtidos da api a cada montagem de tela
  const [busy, setBusy] = useState(false);
  const [busyBotao, setBusyBotao] = useState(false);
  const [operacao, setOperacao] = useState({
    idAgend: null,
    idPac: null,
    nome: null,
    acao: null,
    dtAgenda: null,
  });
  const [pesquisa, setPesquisa] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPagina = 10; // quantidade de itens por página
  const [exames, setExames] = useState([]); // Armazena as opções do select
  const [optExames, setOptExames] = useState(null); // Armazena as opções do select
  const [pacientes, setPacientes] = useState([]); // Armazena as opções do select
  const [optPacientes, setOptPacientes] = useState(null); // Armazena as opções do select
  const [situacao, setSituacao] = useState([]); // Armazena as opções do select
  const [optSituacao, setOptSituacao] = useState(null); // Armazena as opções do select

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      dtAgenda: new Date()
        .toLocaleDateString("pt-BR")
        .split("/")
        .reverse()
        .join("-"), // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
      exameId: "",
      pacienteId: "",
      sitAgenda: "",
    },
    resolver: yupResolver(filtroSchema),
  });

  let modal = null; // controla se exibirá modal para edição ou exclusão

  if (operacao.acao === "detalhe") {
    modal = (
      <Detalhe
        idAgenda={operacao.idAgend}
        nome={operacao.nome}
        dtAgend={operacao.dtAgenda}
      />
    );
  }

  const dadosSituacao = [
    { id: 1, nome: "Presença NÃO Confirmada" },
    { id: 2, nome: "Presença Confirmada" },
    { id: 3, nome: "Paciente Ausente" },
    { id: 4, nome: "Paciente Desistiu" },
    { id: 5, nome: "Agendamento Finalizado" },
    { id: 6, nome: "Agendamento Cancelado" },
  ];

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
          toast.error("Resumo:" + resultado.message);
      }
    } catch {
      setExames([]);
      toast.error("Resumo: unknown error(1)");
    }
  };

  // Função para preencher as opções do Select
  const PreencheExames = (dados) => {
    setBusy(true); // Inicia o carregamento
    let resultado = null;

    if (!dados) {
      setOptions(
        <option
          key={0}
          value=""
          disabled
          className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        >
          Carregando exames...
        </option>
      );
    }

    // cria opções do select
    resultado = [
      <option
        key={-1}
        value=""
        className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        disabled
      >
        Selecione
      </option>,
      <option
        key={0}
        value="0"
        className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
      >
        Todos
      </option>,
      ...dados.map((exame) => (
        <option
          key={exame.id}
          value={exame.id}
          className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        >
          {exame.nome}
        </option>
      )),
    ];
    setBusy(false);
    setOptExames(resultado);
    // limpo campo
    // reset({
    //   exameId: "",
    // });
  };

  const buscaPacientes = async () => {
    let resultado = null;
    resultado = await ListarPacientes();
    //console.log(resultado);

    try {
      if (resultado.success) {
        // console.log("Lista de pacientes");
        // console.log(resultado.data);
        setPacientes(resultado.data);
      } else {
        setPacientes([]);
        if (resultado.message !== "")
          toast.error("Resumo:" + resultado.message);
      }
    } catch {
      setPacientes([]);
      toast.error("Resumo: unknown error(2)");
    }
  };

  // Função para preencher as opções do Select
  const PreenchePacientes = (dados) => {
    setBusy(true); // Inicia o carregamento
    let resultado = null;

    if (!dados) {
      setOptions(
        <option
          key={0}
          value=""
          disabled
          className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        >
          Carregando pacientes...
        </option>
      );
    }

    // cria opções do select
    resultado = [
      <option
        key={-1}
        value=""
        className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        disabled
      >
        Selecione
      </option>,
      <option
        key={0}
        value="0"
        className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
      >
        Todos
      </option>,
      ...dados.map((paciente) => (
        <option
          key={paciente.id}
          value={paciente.id}
          className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        >
          {paciente.nome}
        </option>
      )),
    ];
    setBusy(false);
    // console.log(resultado);
    setOptPacientes(resultado);
    // limpo campo
    // reset({
    //   pacienteId: "",
    // });
  };

  const buscaSituacao = () => {
    let resultado = null;

    try {
      setSituacao(dadosSituacao);
    } catch {
      setSituacao([]);
      toast.error("Resumo: unknown error(3)");
    }
  };

  // Função para preencher as opções do Select
  const PreencheSituacao = (dados) => {
    setBusy(true); // Inicia o carregamento
    let resultado = null;

    if (!dados) {
      setOptions(
        <option
          key={0}
          value=""
          disabled
          className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        >
          Carregando situação...
        </option>
      );
    }

    // cria opções do select
    resultado = [
      <option
        key={-1}
        value=""
        className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        disabled
      >
        Selecione
      </option>,
      <option
        key={0}
        value="0"
        className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
      >
        Todos
      </option>,
      ...dadosSituacao.map((situacao) => (
        <option
          key={situacao.id}
          value={situacao.id}
          className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        >
          {situacao.nome}
        </option>
      )),
    ];
    setBusy(false);
    setOptSituacao(resultado);
    // limpo campo
    // reset({
    //   sitAgenda: "",
    // });
  };

  const BuscarDados = async (dados) => {
    // console.log("Lista deve ser atualizada");

    setBusyBotao((p) => true);
    // console.log(dados);

    let dtAtual = null;
    // se for passado valor então ele formata
    // caso contrário ele obtém data atual
    if (dados?.dtAgenda) {
      // Se valData foi passado, tenta criar uma data válida e formatar
      const data = new Date(dados?.dtAgenda);
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const dia = String(data.getDate()).padStart(2, "0");
      dtAtual = `${ano}-${mes}-${dia}`;
    } else {
      // obtem data atual (só parte data)
      // const dtAtual = new Date().toISOString().split("T")[0];
      const hoje = new Date().toLocaleDateString("pt-BR");
      const [dia, mes, ano] = hoje.split("/");
      dtAtual = `${ano}-${mes}-${dia}`;
    }

    // console.log(typeof valData);

    let dadosBody = {
      ...dados,
      dtAgenda: dtAtual,
    };
    // console.log(dadosBody);

    const resultado = await ListarGrid(dadosBody);
    // const valGrid = await ListarGrid();
    // console.log(resultado.data);

    if (resultado.success) {
      if (resultado.data !== null) {
        // guarda valores originais do BD
        setDadosOriginal(resultado.data);
        // console.log(typeof resultado.data);
        //console.log(resultado.data);
        // guarda valores em dados usados por tabela
        // filtraDados(resultado.data, "");
        setDados(filtraDados(resultado.data, "", paginaAtual, false, false));
      }
    } else {
      setDados(null);
      setDadosOriginal(null);
      if (resultado.message !== "")
        toast.error("Resumo Diário - Grid: " + resultado.message);
    }

    setBusyBotao((p) => false);
  };

  const defineStatusAgend = (valStatus) => {
    // cria ícone do status a partir de valores:
    //  0 (ativo), 1(cancelado), 2(paciente Presente para fazer exame), 3(desistiu do exame), 4 (ausente)
    let resultado = null;
    // console.log(typeof valStatus);

    // define ícone, cor e hint (ao passar mouse)
    switch (valStatus) {
      case 0:
        resultado = (
          <div className="flex flex-wrap gap-2">
            <Badge icon={FaQuestion} color="success" size="sm">
              Presença não confirmada
            </Badge>
          </div>
        );
        break;
      case 1:
        resultado = (
          <div className="flex flex-wrap gap-2">
            <Badge icon={FaTimesCircle} color="failure" size="sm">
              Agendamento Cancelado
            </Badge>
          </div>
        );
        break;
      case 2:
        resultado = (
          <div className="flex flex-wrap gap-2">
            <Badge icon={FaUserCheck} color="indigo" size="sm">
              Presença confirmada
            </Badge>
          </div>
        );
        break;
      case 3:
        resultado = (
          <div className="flex flex-wrap gap-2">
            <Badge icon={FaUserSlash} color="warning" size="sm">
              Ausência do paciente
            </Badge>
          </div>
        );
        break;
      case 4:
        resultado = (
          <div className="flex flex-wrap gap-2">
            <Badge icon={FaUserTimes} color="gray" size="sm">
              Desistência do paciente
            </Badge>
          </div>
        );
        break;
      case 5:
        resultado = (
          <div className="flex flex-wrap gap-2">
            <Badge icon={FaUserLock} color="purple" size="sm">
              Finalizado
            </Badge>
          </div>
        );
        break;
    }

    return resultado;
  };

  const formataDataBD = (valorData) => {
    // console.log(typeof valorData);
    const novaData = new Date(valorData);

    // Formata a data para o formato local (pt-BR) com hora e minuto
    const formatoLocal = novaData.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Para hora em formato 24h
    });

    // Substitui a vírgula por um espaço
    return formatoLocal.replace(",", "");
  };

  const filtraDados = (
    dadosAtual,
    valorPesquisado,
    pagAtual,
    somentePesquisa = false,
    somentePaginacao = false
  ) => {
    // console.log("Entrou no filtro");
    // console.log(typeof dadosAtual);
    // console.log("Dados no Inicio do filtro:");
    // console.log(dadosAtual);
    // console.log("Critério de pesquisa:");
    // console.log(valorPesquisado);

    // filtra dados a partir da pesquisa com critério like
    // dados pesquisados: Nome, descrição e instrução do exame
    let grid = null;

    if (!dadosAtual) {
      // console.log("Sem dados");
      return dadosAtual;
    }

    // quando NÃO é paginação ele constrói dados com filtro se precisar
    if (!somentePaginacao) {
      // sem critério de pesquisa retorna todos os dados
      if (!valorPesquisado) {
        // console.log("Oi");
        grid = dadosAtual;
      } else {
        grid = dadosAtual.filter((item) => {
          return (
            item.pacienteNome
              ?.toLowerCase()
              .includes(valorPesquisado.toLowerCase()) ||
            item.exameNome
              ?.toLowerCase()
              .includes(valorPesquisado.toLowerCase()) ||
            item.horIni?.toLowerCase().includes(valorPesquisado.toLowerCase())
          );
        });
      }
    } else {
      grid = dadosAtual;
    }

    // ----- constrói paginação

    // total de itens por página a partir dos dados
    setTotalPaginas(Math.ceil(grid.length / itensPagina));

    // como os dados estão em um array de objetos,
    // a qtde de itens que pegarei será definido por:
    // número de página atual (definido em setTotalPaginas) * qtde de itens por Pagina
    // Ex: Há 25 itens e definir 5 itens/páginas
    // Então na pagina 1 pego os itens de índice: 0 a 5
    // Pagina 2 pego os itens: 6 a 10
    // e nas outras páginas segue o mesmo conceito
    // (pagAtual - 1) => pois começo pelo índice 0 no array
    let idxInicio = 0;
    // se é somente pesquisa a página atual sempre será a primeira
    if (somentePesquisa) {
      idxInicio = 0;
    } else {
      idxInicio = (pagAtual - 1) * itensPagina;
    }

    // seleciono os dados a partir do indice
    const dadosPagina = grid.slice(idxInicio, idxInicio + itensPagina);
    // atribuo itens por pagina em variavel grid para construir linhas da tabela
    grid = dadosPagina;

    // constrói linhas da tabela após fazer o filtro (ou não):
    grid = grid.map((p) => {
      const dtAgend = formataDataBD(p?.dtAgenda);
      // console.log(dtAgend);
      const dtUltOperacao = formataDataBD(p?.horOperacao);
      // console.log("Hora obtida do banco");
      // console.log(dtAgend);
      // console.log(p?.status);
      // constroí ações
      // envio de e-mail SOMENTE pra agendamento ativo
      // Editar SOMENTE para agendamento ativo
      let acoesGrid = null;
      let acoesBT = null;

      // define o botão
      acoesBT = (
        <Button
          className="h-10 w-35"
          color="green"
          onClick={() => {
            setOperacao({
              idAgend: p.id,
              idPac: p.pacienteId,
              nome: p.pacienteNome,
              acao: "detalhe",
              dtAgenda: dtAgend,
            });
          }}
        >
          <HiEye className="mr-2 h-5 w-5" />
          Visualizar
        </Button>
      );

      acoesGrid = <div className="flex items-center gap-x-4">{acoesBT}</div>;

      return (
        <TableRow key={p.id} className="text-gray-800 dark:text-white">
          <TableCell>{p.pacienteNome?.substring(0, 35)}</TableCell>
          <TableCell>{p.exameNome?.substring(0, 25)}</TableCell>
          <TableCell>{dtAgend}</TableCell>
          <TableCell>{defineStatusAgend(p?.status)}</TableCell>
          <TableCell>{acoesGrid}</TableCell>
        </TableRow>
      );
    });

    return grid;
  };

  const fecharModal = () => {
    setOperacao({
      idAgend: null,
      idPac: null,
      nome: null,
      acao: null,
      dtAgenda: null,
    });
  };

  const onSubmit = (data) => {
    BuscarDados(data);
  };

  // efeito após mudar valor de campo pesquisa
  useEffect(() => {
    // guarda valores em dados usados por tabela
    // filtraDados(dadosOriginal, pesquisa);
    setDados(filtraDados(dadosOriginal, pesquisa, 1, true, false));
    if (pesquisa == "") {
      // quando não tem mais pesquisa a página atual sempre é a primeira
      setPaginaAtual(1);
    }
  }, [pesquisa]);

  // efeito após mudar valor de página atual
  useEffect(() => {
    // guarda valores em dados usados por tabela
    // filtraDados(dadosOriginal, pesquisa);
    setDados(filtraDados(dadosOriginal, pesquisa, paginaAtual, false, true));
  }, [paginaAtual]);

  useEffect(() => {
    // if (dadosExames && dadosExames.length > 0) {
    PreencheExames(exames); // Preenche os itens quando os dados estiverem disponíveis
  }, [exames]); // Sempre que os dados na props mudarem, chamo a função PreencheItens

  useEffect(() => {
    // if (dadosExames && dadosExames.length > 0) {
    PreenchePacientes(pacientes); // Preenche os itens quando os dados estiverem disponíveis
  }, [pacientes]); // Sempre que os dados na props mudarem, chamo a função PreencheItens

  useEffect(() => {
    // if (dadosExames && dadosExames.length > 0) {
    PreencheSituacao(situacao); // Preenche os itens quando os dados estiverem disponíveis
  }, [situacao]); // Sempre que os dados na props mudarem, chamo a função PreencheItens

  // Buscar os dados ao carregar a página
  useEffect(() => {
    const carregarTudo = async () => {
      setBusy((p) => true);
      await buscaExames(); // busca lista de exames
      await buscaPacientes(); // busca lista de exames
      buscaSituacao();
      setBusy((p) => false);
    };

    if (buscaRegistro === null) setBuscaRegistro(true);

    if (buscaRegistro) {
      setBuscaRegistro(false);
      carregarTudo();
    }
  }, [buscaRegistro]);

  return (
    <>
      {busy ? (
        <div className="text-center">
          <Spinner color="info" className="mt-4 h-10 w-10" />
        </div>
      ) : (
        <>
          <p className="text-2xl mb-3  text-gray-800 dark:text-white">
            Atendimento - Resumo de Atividades
          </p>
          <div className="mt-4 mb-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-x-4 mt-4">
                <div className="flex flex-col">
                  <Label htmlFor="filtroData" className="dark:text-white">
                    Filtro:
                  </Label>
                  <TextInput
                    id="filtroData"
                    type="date"
                    placeholder="Informe a data de agendamento"
                    {...register("dtAgenda")}
                    className="w-1/3 py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
                  />
                  {errors.dtAgenda && (
                    <span className="text-sm font-semibold  text-red-500 dark:text-red-400">
                      {errors.dtAgenda.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="exame" className="dark:text-white">
                    Selecione um Exame:
                  </Label>
                  <Select
                    id="exame"
                    {...register("exameId")}
                    className="py-2 flex-grow dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
                  >
                    {optExames}
                  </Select>
                  {errors.exameId && (
                    <span className="text-sm font-semibold  text-red-500 dark:text-red-400">
                      {errors.exameId.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 mt-4">
                <div className="flex flex-col">
                  <Label htmlFor="pacientes" className=" dark:text-white">
                    Selecione um Paciente:
                  </Label>
                  <Select
                    id="pacientes"
                    {...register("pacienteId")}
                    className="py-2 flex-grow dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
                  >
                    {optPacientes}
                  </Select>
                  {errors.pacienteId && (
                    <span className="text-sm font-semibold  text-red-500 dark:text-red-400">
                      {errors.pacienteId.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="situacao" className=" dark:text-white">
                    Selecione Situação do Agendamento:
                  </Label>
                  <Select
                    id="situacao"
                    {...register("sitAgenda")}
                    className="py-2 flex-grow dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
                  >
                    {optSituacao}
                  </Select>
                  {errors.sitAgenda && (
                    <span className="text-sm font-semibold  text-red-500 dark:text-red-400">
                      {errors.sitAgenda.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-center space-x-6 mt-4">
                <Button className="flex items-center" size="sm" type="submit">
                  {busyBotao ? (
                    <Spinner
                      size="sm"
                      aria-label="Spinner Salvar"
                      className="me-3 h-5 w-5"
                      light
                    />
                  ) : (
                    <HiOutlineSearch className="mr-2 h-7 w-7" />
                  )}
                  <span>Pesquisar Agendamentos</span>
                </Button>
              </div>
            </form>
          </div>

          <ResumoContext.Provider
            value={{
              // atualizarDados: () => {
              //   BuscarDados(getValues("dtAgenda"));
              // },
              fechaTela: fecharModal,
            }}
          >
            {modal}
          </ResumoContext.Provider>

          {/* Campo Pesquisa */}
          <div className="mt-8 mb-10 flex flex-row items-center justify-start">
            <Label htmlFor="pesquisa" className="text-xl dark:text-black">
              Pesquisa:
            </Label>

            <TextInput
              id="pesquisa"
              className="ml-4 w-180 dark:text-white dark:font-semibold dark:border-gray-400 border-gray-300"
              placeholder="Informe Nome do Exame | Nome Paciente | Data/Hora do Agendamento"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>

          <div className="mt-8 overflow-x-auto">
            <Table hoverable className="dark:bg-gray-700">
              <TableHead className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHeadCell className="text-gray-800 dark:text-white">
                    Paciente
                  </TableHeadCell>
                  <TableHeadCell className="text-gray-800 dark:text-white">
                    Exame
                  </TableHeadCell>
                  <TableHeadCell className="text-gray-800 dark:text-white">
                    Data Agend.
                  </TableHeadCell>
                  <TableHeadCell className="text-gray-800 dark:text-white">
                    Situação
                  </TableHeadCell>
                  <TableHeadCell className="text-gray-800 dark:text-white">
                    <span>&nbsp;</span>
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>{dados}</TableBody>
            </Table>

            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={paginaAtual}
                totalPages={totalPaginas}
                onPageChange={(page) => setPaginaAtual(page)}
                className="bg-white text-black font-semibold dark:text-white dark:font-semibold"
                previousLabel="Anterior"
                nextLabel="Próximo"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Home;
