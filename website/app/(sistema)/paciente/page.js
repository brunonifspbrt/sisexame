"use client";

import { PacienteContext } from "./context";
import NovoPaciente from "./novo";
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
  Pagination,
} from "flowbite-react";
import { Listar } from "./api";
import { Button, Spinner } from "flowbite-react";
import ExclusaoPaciente from "./exclusao";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import Edicao from "./edicao";
import { toast } from "react-toastify";

const Home = () => {
  const [atualizar, setAtualizar] = useState(null);
  const [dados, setDados] = useState(null); // dados exibidos na tabela
  const [dadosOriginal, setDadosOriginal] = useState(null); // dados obtidos da api a cada montagem de tela
  const [busy, setBusy] = useState(false);
  const [operacao, setOperacao] = useState({
    id: null,
    acao: null,
    nome: null,
  });
  const [pesquisa, setPesquisa] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPagina = 10; // quantidade de itens por página

  let modal = null; // controla se exibirá modal para edição ou exclusão

  if (operacao.acao === "editar") {
    modal = <Edicao id={operacao.id} />;
  } else if (operacao.acao === "excluir") {
    modal = <ExclusaoPaciente id={operacao.id} nome={operacao.nome} />;
  }

  const atualizarLista = async () => {
    // console.log("Lista deve ser atualizada");

    setBusy((p) => true);

    const resultado = await Listar();
    //console.log(resultado.data);

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
            item.cpf?.toLowerCase().includes(valorPesquisado.toLowerCase()) ||
            item.nome?.toLowerCase().includes(valorPesquisado.toLowerCase()) ||
            item.email?.toLowerCase().includes(valorPesquisado.toLowerCase()) ||
            item.obs?.toLowerCase().includes(valorPesquisado.toLowerCase())
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
      // para cada iteração converto string de data em campo data para então formatar em dd/mm/yyyy
      // pela função toLocaleDateString
      const dtNasc = new Date(p?.dataNascimento).toLocaleDateString("pt-BR");
      return (
        <TableRow key={p.id} className="text-gray-800 dark:text-white">
          <TableCell>{p.cpf}</TableCell>
          <TableCell>{p.nome?.substring(0, 35)}</TableCell>
          <TableCell>{dtNasc}</TableCell>
          <TableCell>{p.email?.substring(0, 35)}</TableCell>
          <TableCell>
            <Button
              className="h-10 w-20"
              color="green"
              onClick={() => {
                setOperacao({ id: p.id, acao: "editar", nome: null });
              }}
            >
              Editar
            </Button>
          </TableCell>
          <TableCell className="justify-items-start">
            <Button
              className="h-10 w-20"
              color="purple"
              onClick={() => {
                setOperacao({ id: p.id, acao: "excluir", nome: p.nome });
              }}
            >
              Remover
            </Button>
          </TableCell>
        </TableRow>
      );
    });

    return grid;
  };

  const fecharModal = () => {
    setOperacao({ id: null, acao: null });
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
      <p className="text-2xl mb-3 text-gray-800 dark:text-white">Pacientes</p>
      <PacienteContext.Provider
        value={{ atualizarDados: setAtualizar, fechaTela: fecharModal }}
      >
        <NovoPaciente />
        {modal}
      </PacienteContext.Provider>

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
          className="ml-4 w-180  dark:text-white dark:font-semibold dark:border-gray-400 border-gray-300"
          placeholder="Informe CPF, nome, e-mail ou observação do paciente"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
      </div>

      <div className="mt-8 overflow-x-auto">
        <Table hoverable className="dark:bg-gray-700">
          <TableHead className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableHeadCell className="text-gray-800 dark:text-white">
                CPF
              </TableHeadCell>
              <TableHeadCell className="text-gray-800 dark:text-white">
                Nome
              </TableHeadCell>
              <TableHeadCell className="text-gray-800 dark:text-white">
                Nascimento
              </TableHeadCell>
              <TableHeadCell className="text-gray-800 dark:text-white">
                E-mail
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
