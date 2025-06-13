"use client";

import { AtendimentoContext } from "./context";
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
} from "flowbite-react";
import { ListarGrid } from "./api";
import { Spinner } from "flowbite-react";
// import ExclusaoPaciente from "./exclusao";
import {
  FaQuestion,
  FaTimesCircle,
  FaUserCheck,
  FaUserSlash,
  FaUserTimes,
  FaUserLock,
} from "react-icons/fa";
import {
  HiMicrophone,
  HiOutlineShieldCheck,
  HiCog,
  HiOutlineSearch,
  HiCheckCircle,
  HiXCircle,
  HiOutlineXCircle,
  HiOutlineUserRemove,
  HiOutlineSortDescending,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { filtroSchema } from "./schema";
import Finaliza from "./finaliza";
import Chamada from "./chamada";
import RegistraAusencia from "./ausencia";
import Desistencia from "./desistencia";
import ListaEspera from "./listaespera";

const Home = () => {
  // const [atualizar, setAtualizar] = useState(null);
  const [atualizar, setAtualizar] = useState(false); // não carrega dados ao exibir tela, primeiro define o filtro
  const [dados, setDados] = useState(null); // dados exibidos na tabela
  const [dadosOriginal, setDadosOriginal] = useState(null); // dados obtidos da api a cada montagem de tela
  const [busy, setBusy] = useState(false);
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
    },
    resolver: yupResolver(filtroSchema),
  });

  let modal = null; // controla se exibirá modal para edição ou exclusão

  if (operacao.acao === "finalizar") {
    modal = (
      <Finaliza
        idAgenda={operacao.idAgend}
        nome={operacao.nome}
        dtAgend={operacao.dtAgenda}
      />
    );
  } else if (operacao.acao === "chamar") {
    modal = (
      <Chamada
        idAgenda={operacao.idAgend}
        nome={operacao.nome}
        dtAgend={operacao.dtAgenda}
      />
    );
  } else if (operacao.acao === "ausente") {
    modal = (
      <RegistraAusencia
        idAgenda={operacao.idAgend}
        nome={operacao.nome}
        dtAgend={operacao.dtAgenda}
      />
    );
  } else if (operacao.acao === "desistir") {
    modal = <Desistencia AgendID={operacao.idAgend} />;
  } else if (operacao.acao === "espera") {
    modal = (
      <ListaEspera
        idAgenda={operacao.idAgend}
        nome={operacao.nome}
        dtAgend={operacao.dtAgenda}
      />
    );
  }

  const atualizarLista = async (valData) => {
    // console.log("Lista deve ser atualizada");

    setBusy((p) => true);

    // se for passado valor então ele formata
    // caso contrário ele obtém data atual
    // if (valData) {
    //   // Se valData foi passado, tenta criar uma data válida e formatar
    //   const data = new Date(valData);
    //   const ano = data.getFullYear();
    //   const mes = String(data.getMonth() + 1).padStart(2, "0");
    //   const dia = String(data.getDate()).padStart(2, "0");
    //   dtAtual = `${ano}-${mes}-${dia}`;
    // } else {
    //   // obtem data atual (só parte data)
    //   // const dtAtual = new Date().toISOString().split("T")[0];
    //   const hoje = new Date().toLocaleDateString("pt-BR");
    //   const [dia, mes, ano] = hoje.split("/");
    //   dtAtual = `${ano}-${mes}-${dia}`;
    // }

    // console.log(typeof valData);
    let dtAtual = valData;

    if (!valData) {
      const hoje = new Date().toLocaleDateString("pt-BR");
      const [dia, mes, ano] = hoje.split("/");
      dtAtual = `${ano}-${mes}-${dia}`;
      // console.log(dtAtual);
    }

    const dados = { dtAgenda: dtAtual };

    // const resultado = "null";
    const resultado = await ListarGrid(dados);
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
        toast.error("Atendimento - Grid: " + resultado.message);
    }

    setBusy((p) => false);
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
              Paciente Ausente
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
      const dtAgend = formataDataBD(p?.horIni);
      // console.log("Hora obtida do banco");
      // console.log(dtAgend);
      // console.log(p?.status);
      // constroí ações
      // envio de e-mail SOMENTE pra agendamento ativo
      // Editar SOMENTE para agendamento ativo
      let acoesGrid = null;
      let acoesDrop = null;
      let acoesChamada = null;

      let dadosCheck = p?.dadosOk ? (
        <div className="flex flex-wrap gap-2">
          <Badge icon={HiCheckCircle} color="success" size="sm">
            Verificado
          </Badge>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Badge icon={HiXCircle} color="failure" size="sm">
            Não Verificado
          </Badge>
        </div>
      );

      // status 0 = agendamento ativo e SEM presença do paciente confirmada
      if (p?.status == 0) {
        acoesChamada = null;
        // só permite aplicar ausência
        acoesDrop = (
          <Dropdown
            label={
              <div className="flex items-center gap-1">
                <HiCog className="text-lg" />
                <span className="font-bold dark:text-white">Ações</span>
              </div>
            }
            placement="right"
            size="sm"
          >
            <DropdownItem
              icon={HiOutlineUserRemove}
              className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
              onClick={() => {
                setOperacao({
                  idAgend: p.id,
                  idPac: p.pacienteId,
                  nome: p.pacienteNome,
                  acao: "ausente",
                  dtAgenda: p.horIni,
                });
              }}
            >
              Informar Ausência
            </DropdownItem>
          </Dropdown>
        );
      } else if (p?.status == 2 && p.dadosOk) {
        acoesChamada = !p?.convocacao ? (
          <Tooltip content="Chamar paciente">
            <Button
              color="green"
              size="sm"
              className="w-22 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
              onClick={() =>
                setOperacao({
                  idAgend: p.id,
                  idPac: p.pacienteId,
                  nome: p.pacienteNome,
                  acao: "chamar",
                  dtAgenda: p.horIni,
                })
              }
            >
              <HiMicrophone size={18} className="text-white" />
            </Button>
          </Tooltip>
        ) : null;

        acoesDrop = (
          <Dropdown
            label={
              <div className="flex items-center gap-1">
                <HiCog className="text-lg" />
                <span className="font-bold dark:text-white">Ações</span>
              </div>
            }
            placement="right"
            size="sm"
          >
            {p?.convocacao && (
              <DropdownItem
                icon={HiOutlineShieldCheck}
                className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
                onClick={() => {
                  setOperacao({
                    idAgend: p.id,
                    idPac: p.pacienteId,
                    nome: p.pacienteNome,
                    acao: "finalizar",
                    dtAgenda: p.horIni,
                  });
                }}
              >
                Finalizar Atendimento
              </DropdownItem>
            )}

            <DropdownItem
              icon={HiOutlineXCircle}
              className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
              onClick={() => {
                setOperacao({
                  idAgend: p.id,
                  idPac: p.pacienteId,
                  nome: p.pacienteNome,
                  acao: "desistir",
                  dtAgenda: p.horIni,
                });
              }}
            >
              Informar Desistência
            </DropdownItem>

            {p?.convocacao && (
              <DropdownItem
                icon={HiOutlineSortDescending}
                className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
                onClick={() => {
                  setOperacao({
                    idAgend: p.id,
                    idPac: p.pacienteId,
                    nome: p.pacienteNome,
                    acao: "espera",
                    dtAgenda: p.horIni,
                  });
                }}
              >
                Lista de Espera
              </DropdownItem>
            )}
          </Dropdown>
        );
      }

      acoesGrid = (
        <div className="flex items-center gap-x-4">
          {acoesChamada}
          {acoesDrop}
        </div>
      );

      // if (p?.status == 5) {
      //   acoesDrop = null;
      // } else {
      //   acoesDrop = (
      //     <div className="flex items-center gap-x-4">
      //       <Tooltip content="Chamar paciente">
      //         <Button
      //           color="green"
      //           size="sm"
      //           className="w-22 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
      //           onClick={() =>
      //             setOperacao({
      //               idAgend: p.id,
      //               idPac: p.pacienteId,
      //               nome: p.pacienteNome,
      //               acao: "chamar",
      //               dtAgenda: p.horIni,
      //             })
      //           }
      //         >
      //           <HiMicrophone size={18} className="text-white" />
      //         </Button>
      //       </Tooltip>
      //       <Dropdown
      //         label={
      //           <div className="flex items-center gap-1">
      //             <HiCog className="text-lg" />
      //             <span className="font-bold dark:text-white">Ações</span>
      //           </div>
      //         }
      //         placement="right"
      //         size="sm"
      //       >
      //         {/* <DropdownItem
      //           icon={HiMicrophone}
      //           className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //           onClick={() => {
      //             setOperacao({
      //               idAgend: p.id,
      //               idPac: p.pacienteId,
      //               nome: null,
      //               acao: "chamar",
      //               dtAgenda: null,
      //             });
      //           }}
      //         >
      //           Chamar Paciente
      //         </DropdownItem> */}
      //         <DropdownItem
      //           icon={HiOutlineShieldCheck}
      //           className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //           onClick={() => {
      //             setOperacao({
      //               idAgend: p.id,
      //               idPac: p.pacienteId,
      //               nome: p.pacienteNome,
      //               acao: "finalizar",
      //               dtAgenda: p.horIni,
      //             });
      //           }}
      //         >
      //           Finalizar Atendimento
      //         </DropdownItem>
      //         <DropdownItem
      //           icon={HiOutlineXCircle}
      //           className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //           onClick={() => {
      //             setOperacao({
      //               idAgend: p.id,
      //               idPac: p.pacienteId,
      //               nome: p.pacienteNome,
      //               acao: "desistir",
      //               dtAgenda: p.horIni,
      //             });
      //           }}
      //         >
      //           Informar Desistência
      //         </DropdownItem>
      //         <DropdownItem
      //           icon={HiOutlineUserRemove}
      //           className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //           onClick={() => {
      //             setOperacao({
      //               idAgend: p.id,
      //               idPac: p.pacienteId,
      //               nome: p.pacienteNome,
      //               acao: "ausente",
      //               dtAgenda: p.horIni,
      //             });
      //           }}
      //         >
      //           Informar Ausência
      //         </DropdownItem>
      //       </Dropdown>
      //     </div>
      //   );
      //   // acoesDrop = (
      //   //   <Dropdown
      //   //     label={
      //   //       <div className="flex items-center gap-1">
      //   //         <HiCog className="text-lg" />
      //   //         <span className="font-bold dark:text-white">Ações</span>
      //   //       </div>
      //   //     }
      //   //     placement="right"
      //   //     size="sm"
      //   //   >
      //   //     <DropdownItem
      //   //       icon={HiMicrophone}
      //   //       className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //   //       onClick={() => {
      //   //         setOperacao({
      //   //           idAgend: p.id,
      //   //           idPac: p.pacienteId,
      //   //           nome: null,
      //   //           acao: "chamar",
      //   //           dtAgenda: null,
      //   //         });
      //   //       }}
      //   //     >
      //   //       Chamar Paciente
      //   //     </DropdownItem>
      //   //     <DropdownItem
      //   //       icon={HiOutlineShieldCheck}
      //   //       className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //   //       onClick={() => {
      //   //         setOperacao({
      //   //           idAgend: p.id,
      //   //           idPac: p.pacienteId,
      //   //           nome: p.pacienteNome,
      //   //           acao: "finalizar",
      //   //           dtAgenda: p.horIni,
      //   //         });
      //   //       }}
      //   //     >
      //   //       Finalizar Agendamento
      //   //     </DropdownItem>
      //   //     <DropdownItem
      //   //       icon={HiOutlineXCircle}
      //   //       className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //   //       onClick={() => {
      //   //         setOperacao({
      //   //           idAgend: p.id,
      //   //           idPac: p.pacienteId,
      //   //           nome: p.pacienteNome,
      //   //           acao: "desistir",
      //   //           dtAgenda: p.horIni,
      //   //         });
      //   //       }}
      //   //     >
      //   //       Informar Desistência
      //   //     </DropdownItem>
      //   //     <DropdownItem
      //   //       icon={HiOutlineUserRemove}
      //   //       className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //   //       onClick={() => {
      //   //         setOperacao({
      //   //           idAgend: p.id,
      //   //           idPac: p.pacienteId,
      //   //           nome: p.pacienteNome,
      //   //           acao: "ausente",
      //   //           dtAgenda: p.horIni,
      //   //         });
      //   //       }}
      //   //     >
      //   //       Informar Ausência
      //   //     </DropdownItem>
      //   //   </Dropdown>
      //   // );
      // }
      return (
        <TableRow key={p.id} className="text-gray-800 dark:text-white">
          <TableCell>{p.pacienteNome?.substring(0, 35)}</TableCell>
          <TableCell>{p.exameNome?.substring(0, 25)}</TableCell>
          <TableCell>{dtAgend}</TableCell>
          <TableCell>{defineStatusAgend(p?.status)}</TableCell>
          <TableCell>{dadosCheck}</TableCell>
          {/* <TableCell>{acoesDrop}</TableCell> */}
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

  const onSubmit = (dados) => {
    let dtFiltro;
    const ano = dados.dtAgenda.getFullYear();
    const mes = String(dados.dtAgenda.getMonth() + 1).padStart(2, "0");
    const dia = String(dados.dtAgenda.getDate()).padStart(2, "0");
    dtFiltro = `${ano}-${mes}-${dia}`;
    atualizarLista(dtFiltro);
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
    if (atualizar === null) setAtualizar(true);

    if (atualizar) {
      atualizarLista();
      setAtualizar((p) => false);
    }
  }, [atualizar]);

  return (
    <>
      <p className="text-2xl mb-3  text-gray-800 dark:text-white">
        Atendimentos - Chamada de Pacientes
      </p>
      <div className="mt-4 mb-5">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-row items-center gap-2 mt-1">
            <Label htmlFor="filtroData" className="dark:text-white">
              Filtro:
            </Label>
            <TextInput
              id="filtroData"
              type="date"
              placeholder="Informe a data de agendamento"
              {...register("dtAgenda")}
              className="ml-2 py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />

            <Button className="flex items-center" size="sm" type="submit">
              {/* className = h-5 w-5 or size={10} */}
              <HiOutlineSearch className="mr-1 h-7 w-7" />
              <span>Exibir Agendamentos</span>
            </Button>
          </div>
          {errors.dtAgenda && (
            <span className="text-sm font-semibold  text-red-500 dark:text-red-400">
              {errors.dtAgenda.message}
            </span>
          )}
        </form>
      </div>

      <AtendimentoContext.Provider
        value={{
          atualizarDados: () => {
            atualizarLista(getValues("dtAgenda"));
          },
          fechaTela: fecharModal,
        }}
      >
        {modal}
      </AtendimentoContext.Provider>

      {busy && (
        <div className="text-center">
          <Spinner color="info" className="mt-4 h-10 w-10" />
        </div>
      )}

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
                Data
              </TableHeadCell>
              <TableHeadCell className="text-gray-800 dark:text-white">
                Status
              </TableHeadCell>
              <TableHeadCell className="text-gray-800 dark:text-white">
                Dados Cliente
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
  );
};

export default Home;
