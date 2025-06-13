"use client";

import { AgendamentoContext } from "./context";
import { useEffect, useState } from "react";
import {
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
import { HiOutlinePencil, HiMail, HiCog, HiBan } from "react-icons/hi";
import NovoAgendamento from "./novo";
import Edicao from "./edicao";
import { toast } from "react-toastify";
import ReenviaEmail from "./email";
import CancelaAgend from "./cancela";

const Home = () => {
  const [atualizar, setAtualizar] = useState(null);
  const [dados, setDados] = useState(null); // dados exibidos na tabela
  const [dadosOriginal, setDadosOriginal] = useState(null); // dados obtidos da api a cada montagem de tela
  const [busy, setBusy] = useState(false);
  const [operacao, setOperacao] = useState({
    id: null,
    acao: null,
    nome: null,
    dtAgenda: null,
  });
  const [pesquisa, setPesquisa] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPagina = 10; // quantidade de itens por página

  let modal = null; // controla se exibirá modal para edição ou exclusão

  if (operacao.acao === "editar") {
    modal = <Edicao id={operacao.id} />;
  } else if (operacao.acao === "email") {
    modal = (
      <ReenviaEmail
        id={operacao.id}
        nome={operacao.nome}
        dtAgend={operacao.dtAgenda}
      />
    );
  } else if (operacao.acao === "cancelar") {
    modal = (
      <CancelaAgend
        id={operacao.id}
        nome={operacao.nome}
        dtAgend={operacao.dtAgenda}
      />
    );
  }

  const atualizarLista = async () => {
    // console.log("Lista deve ser atualizada");

    setBusy((p) => true);

    // const resultado = "null";
    const resultado = await ListarGrid();
    // const valGrid = await ListarGrid();
    // console.log(valGrid.data);

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
        toast.error("Paciente: " + resultado.message);
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

  const handleReenviaEmail = () => {};

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
      let acoesDrop = null;
      if (p?.status === 0 || p?.status === 1 || p?.status === 2) {
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
            {p?.status === 0 && (
              <DropdownItem
                icon={HiOutlinePencil}
                className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
                onClick={() => {
                  setOperacao({
                    id: p.id,
                    acao: "editar",
                    nome: null,
                    dtAgenda: null,
                  });
                }}
              >
                Editar
              </DropdownItem>
            )}

            <DropdownItem
              icon={HiMail}
              className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
              onClick={() => {
                setOperacao({
                  id: p.id,
                  acao: "email",
                  nome: p.pacienteNome,
                  dtAgenda: dtAgend,
                });
              }}
            >
              Reenviar E-mail
            </DropdownItem>

            {(p?.status === 0 || p?.status === 2) && (
              <DropdownItem
                icon={HiBan}
                className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
                onClick={() => {
                  setOperacao({
                    id: p.id,
                    acao: "cancelar",
                    nome: p.pacienteNome,
                    dtAgenda: dtAgend,
                  });
                }}
              >
                Cancelar
              </DropdownItem>
            )}
          </Dropdown>
        );
      }
      // if (p?.status != 0) {
      //   acoesDrop = null;
      // } else {
      //   acoesDrop = (
      //     <Dropdown
      //       label={
      //         <div className="flex items-center gap-1">
      //           <HiCog className="text-lg" />
      //           <span className="font-bold dark:text-white">Ações</span>
      //         </div>
      //       }
      //       placement="right"
      //       size="sm"
      //     >
      //       <DropdownItem
      //         icon={HiOutlinePencil}
      //         className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //         onClick={() => {
      //           setOperacao({
      //             id: p.id,
      //             acao: "editar",
      //             nome: null,
      //             dtAgenda: null,
      //           });
      //         }}
      //       >
      //         Editar
      //       </DropdownItem>
      //       <DropdownItem
      //         icon={HiMail}
      //         className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //         onClick={() => {
      //           setOperacao({
      //             id: p.id,
      //             acao: "email",
      //             nome: p.pacienteNome,
      //             dtAgenda: dtAgend,
      //           });
      //         }}
      //       >
      //         Reenviar E-mail
      //       </DropdownItem>
      //       <DropdownItem
      //         icon={HiBan}
      //         className="text-base text-gray-800 dark:text-gray-100 dark:font-semibold"
      //         onClick={() => {
      //           setOperacao({
      //             id: p.id,
      //             acao: "cancelar",
      //             nome: p.pacienteNome,
      //             dtAgenda: dtAgend,
      //           });
      //         }}
      //       >
      //         Cancelar
      //       </DropdownItem>
      //     </Dropdown>
      //   );
      // }
      return (
        <TableRow key={p.id} className="text-gray-800 dark:text-white">
          <TableCell>{p.pacienteNome?.substring(0, 35)}</TableCell>
          <TableCell>{p.exameNome?.substring(0, 25)}</TableCell>
          <TableCell>{dtAgend}</TableCell>
          <TableCell>{defineStatusAgend(p?.status)}</TableCell>
          <TableCell>{acoesDrop}</TableCell>
        </TableRow>
      );
    });

    return grid;
  };

  const fecharModal = () => {
    setOperacao({ id: null, acao: null, nome: null, dtAgenda: null });
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
        Agendamentos
      </p>
      <AgendamentoContext.Provider
        value={{ atualizarDados: setAtualizar, fechaTela: fecharModal }}
      >
        <NovoAgendamento />
        {modal}
      </AgendamentoContext.Provider>

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
