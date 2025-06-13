"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableCell,
  TableRow,
  Button,
  Card,
  TextInput,
  Spinner,
  Badge,
  Pagination,
} from "flowbite-react";
import { terminalSchema } from "./schema";
import {
  HiCheckCircle,
  HiClock,
  HiBackspace,
  HiBadgeCheck,
} from "react-icons/hi";
import { BuscarAgendamentos, ConfirmaPresenca } from "./api";
import { toast } from "react-toastify";
import { TerminalContext } from "./context";
import ModalConfirmacao from "./modal";

export default function Page() {
  const [nome, setNome] = useState(null);
  const [codpaciente, setCodPaciente] = useState(null);
  const [busy, setBusy] = useState(false);
  const [exibicao, setExibicao] = useState(null);
  const [dados, setDados] = useState(null);
  const [dadosOriginal, setDadosOriginal] = useState(null); // dados obtidos da api a cada montagem de tela
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPagina = 5; // qtde itens por página
  const [modalConfirma, setModalConfirma] = useState(false);
  const [iniciaTimer, setIniciaTimer] = useState(false); // se em x segundos não clicar no botão então eu volto a tela de pesquisa
  const timerRef = useRef(null); // referência para obter ID do timer

  const botoes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cpf: "",
    },
    resolver: yupResolver(terminalSchema),
  });

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

  const verificaStatus = (valStatus) => {
    // cria ícone do status a partir de valores:
    //  0 (ativo), 1(cancelado), 2(paciente Presente para fazer exame), 3(desistiu do exame), 4 (ausente)
    let resultado = null;
    // console.log(typeof valStatus);

    // define ícone, cor e hint (ao passar mouse)
    switch (valStatus) {
      case 0:
        resultado = (
          <div className="flex flex-wrap gap-2">
            <Badge icon={HiClock} color="warning" size="sm">
              {" "}
              Aguardando confirmação do Paciente
            </Badge>
          </div>
        );
        break;
    }

    return resultado;
  };

  const exibeDados = (dadosAtual, pagAtual) => {
    let grid = null;

    if (!dadosAtual) {
      //console.log("Sem dados");
      return null;
    }

    // constrói com páginação
    grid = dadosAtual;

    // total de páginas por conjunto de dados
    setTotalPaginas(Math.ceil(grid?.length / itensPagina));

    // seleção de itens por página a partir de variavel itensPagina
    let idxInicio = (pagAtual - 1) * itensPagina; // dados no array começam em 0, por isso -1
    // seleciono dados do array a partir do índice e da página atual
    const dadosPagina = grid.slice(idxInicio, idxInicio + itensPagina);
    // console.log(dadosPagina);
    // constrói linhas da tabela
    grid = dadosPagina.map((p) => {
      const dtAgend = formataDataBD(p?.horIni);
      // console.log(dtAgend);
      return (
        <TableRow key={p.id} className="text-gray-800 dark:text-white">
          <TableCell>{p.exameNome?.substring(0, 35)}</TableCell>
          <TableCell>{dtAgend}</TableCell>
          <TableCell>{verificaStatus(p.status)}</TableCell>
        </TableRow>
      );
    });

    return grid;
  };

  const onSubmit = async (data) => {
    setBusy((p) => true);
    setExibicao((p) => false);
    // console.log(data);

    const dados = {
      ...data,
    };

    // const resultado = await BuscarAgendamentos(data);
    const resultado = await BuscarAgendamentos(dados);
    // console.log(resultado.success);
    // console.log(resultado.data);
    // console.log(resultado.data?.length);
    // caso sucesso identifica nome e exames agendados para o CPF informado
    if (resultado.success) {
      if (resultado.data.length > 0) {
        setNome(resultado.data[0].pacienteNome); // pega nome paciente do primeiro registro
        setCodPaciente(resultado.data[0].pacienteId);
        setDadosOriginal(resultado.data);
        setDados(exibeDados(resultado.data, paginaAtual)); // constrói linhas da tabela
        setExibicao((p) => true);
        setIniciaTimer(true);
      } else {
        setNome(null);
        setCodPaciente(null);
        setDadosOriginal(null);
        setDados(null);
        toast.error("Terminal: Não há agendamentos para o CPF informado!");
        // console.log("Vazio");
      }
    } else {
      if (resultado.message !== "")
        toast.error("Terminal: " + resultado.message);
    }
    setBusy((p) => false);
  };

  const handleConfirma = async () => {
    setBusy((p) => true);
    setIniciaTimer((p) => false);

    // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
    const dtHoje = new Date()
      .toLocaleDateString("pt-BR")
      .split("/")
      .reverse()
      .join("-");

    const dados = {
      pacientecod: codpaciente,
      dtagenda: dtHoje,
    };
    // console.log(dados);

    const resultado = await ConfirmaPresenca(dados);
    // console.log(resultado.success);
    // caso sucesso identifica nome e exames agendados para o CPF informado
    if (resultado.success) {
      finalizaPesquisa();
      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      // console.log(resultado.message);
      if (resultado.message !== "")
        toast.error("Terminal: " + resultado.message);
    }
    setBusy((p) => false);
  };

  const finalizaPesquisa = () => {
    setExibicao(false);
    setModalConfirma(false);
    setIniciaTimer(false);
    setBusy(false);
    setNome(null);
    setCodPaciente(null);
    setDados(null);
    setDadosOriginal(null);
    setPaginaAtual(1);
    reset({
      cpf: "",
    });
  };

  // "chama" modal para confirmar diálogo
  let modal = null;
  if (modalConfirma) {
    modal = (
      <TerminalContext.Provider
        value={{
          atualizarDados: handleConfirma,
          fechaTela: finalizaPesquisa,
        }}
      >
        <ModalConfirmacao />
      </TerminalContext.Provider>
    );
  }

  // const formataCPF = (value) => {
  //   if (!value) return value;
  //   return value
  //     .replace(/\D/g, "")
  //     .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  // };

  const handleBotaoDigito = (num) => {
    // Atualiza o CPF no campo com os números clicados
    // const currentCPF = formataCPF(getValues("cpf") + num);
    const cpfAtual = getValues("cpf") + num;
    // console.log(currentCPF);
    setValue("cpf", cpfAtual); // Atualiza o estado do CPF
    // força validar o campo caso esteja usando os botões
    // trigger("cpf");
  };

  const handleRemoveDigito = () => {
    // Atualiza o CPF no campo com os números clicados
    // const currentCPF = formataCPF(getValues("cpf") + num);
    const cpfAtual = getValues("cpf");
    // console.log(currentCPF);
    setValue("cpf", cpfAtual.slice(0, -1)); // Atualiza o estado do CPF
    // força validar o campo caso esteja usando os botões
    // trigger("cpf");
  };

  // efeito após mudar valor de página atual
  useEffect(() => {
    // guarda valores em dados usados por tabela
    setDados(exibeDados(dadosOriginal, paginaAtual)); // constrói linhas da tabela
  }, [paginaAtual]);

  useEffect(() => {
    // cria timeout de x segundos
    // console.log("Effect do Timer");

    if (iniciaTimer) {
      // Time inicializa somente quando iniciaTimer = true
      timerRef.current = setTimeout(() => {
        // console.log("Timer passou 5 segundo!");
        // limpa variavel do timer
        timerRef.current = null;
        // limpe timeout caso exista
        clearTimeout(timerRef.current);
        finalizaPesquisa();
        toast.error("Terminal: Tempo expirado, tente novamente!");
      }, 10000);
    }

    // limpa o timer se iniciaTimer mudar o valor OU se componente for desmontado
    // Função de limpeza do useEffect:
    // a) Ocorre quando o componente total for desmontado
    // b) Ocorre antes do efeito ser executado novamente e precise fazer limpeza de algum valor
    return () => {
      if (timerRef.current) {
        // limpe timeout caso exista
        clearTimeout(timerRef.current);
        // limpa variavel do timer
        timerRef.current = null;
      }
    };
  }, [iniciaTimer]);

  return (
    <div className="min-h-screen w-full bg-gray-400 flex flex-col items-center justify-center p-4 overflow-auto">
      {!exibicao ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-md rounded p-8 max-w-md w-full space-y-4 dark:bg-gray-900 dark:text-white"
        >
          <div className="mb-4">
            <h2 className="text-3xl font-bold dark:text-white text-center">
              Informe seu CPF
            </h2>
            <TextInput
              id="cpf"
              placeholder="Digite seu CPF (somente números)"
              className="w-full py-2 border-gray-300 rounded   dark:text-white dark:font-semibold"
              sizing="md"
              type="tel"
              {...register("cpf")}
              // value={formataCPF(getValues("cpf"))} // Formata o CPF exibido
              // onChange={(e) => setValue("cpf", formataCPF(e.target.value))}
            />
            {errors.cpf && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.cpf.message}
              </span>
            )}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {botoes.map((num) => (
                <Button
                  key={num}
                  size="sm"
                  onClick={() => handleBotaoDigito(num)}
                  className="w-full h-16  dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white"
                >
                  {num}
                </Button>
              ))}
              <Button
                size="sm"
                onClick={() => handleRemoveDigito()}
                className="w-full h-16  dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white"
              >
                <HiBackspace className="mr-1 h-6 w-6" />
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            color="blue"
            className="w-full dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white"
            size="lg"
            disabled={busy}
          >
            {busy ? (
              <Spinner
                size="sm"
                aria-label="Spinner Acessar"
                className="me-3 h-5 w-5"
                light
              />
            ) : (
              <HiCheckCircle className="mr-1 h-5 w-5" />
            )}
            Continuar
          </Button>
        </form>
      ) : (
        <>
          <div className="w-full max-w-4xl space-y-6">
            {/* Exibição dos exames com Table */}
            <Card className="max-w-full">
              <h2 className="mb-3 text-2xl font-semibold text-center dark:text-white">
                Bem-vindo(a):{" "}
                <span className="text-blue-700 dark:text-blue-400">{nome}</span>
              </h2>

              <div className="mb-1 mt-4 flex items-center justify-center">
                <h5 className="text-xl text-center font-bold leading-none text-gray-900 dark:text-white">
                  Estes são os exames agendados para você no dia de hoje!
                </h5>
              </div>

              <div className="mt-3">
                <h6 className="text-sm text-center font-bold leading-none text-gray-900 dark:text-white">
                  Você pode{" "}
                  <span className="text-green-700 dark:text-green-400">
                    confirmar presença
                  </span>{" "}
                  para realizar todos os exames ou{" "}
                  <span className="text-red-700 dark:text-red-400">
                    clicar em voltar para desistir!
                  </span>
                </h6>
              </div>

              <div className="mt-4 overflow-x-auto">
                <Table striped className="dark:bg-gray-700">
                  <TableHead className="bg-gray-100 dark:bg-gray-800">
                    <TableRow>
                      <TableHeadCell className="text-gray-800 dark:text-white">
                        Tipo do Exame
                      </TableHeadCell>
                      <TableHeadCell className="text-gray-800 dark:text-white">
                        Data Agendada
                      </TableHeadCell>
                      <TableHeadCell className="text-gray-800 dark:text-white">
                        Situação
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
                    className="text-black font-semibold dark:text-white dark:font-semibold"
                    previousLabel="Anterior"
                    nextLabel="Próximo"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button
                  className="w-60 h-12 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
                  size="lg"
                  color="green"
                  disabled={busy}
                  onClick={() => {
                    setModalConfirma(true);
                  }}
                >
                  {busy ? (
                    <Spinner
                      size="sm"
                      aria-label="Spinner Acessar"
                      className="me-3 h-5 w-5"
                      light
                    />
                  ) : (
                    <HiBadgeCheck className="mr-1 h-5 w-5" />
                  )}
                  Confirmar Presença
                </Button>
                <Button
                  className="w-45 h-12 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white"
                  color="red"
                  onClick={finalizaPesquisa}
                  disabled={busy}
                >
                  <HiBackspace className="mr-1 h-5 w-5" />
                  Voltar
                </Button>
              </div>
            </Card>
          </div>
          {modal}
        </>
      )}
    </div>
  );
}
