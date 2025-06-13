"use client";

import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Spinner,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  TextInput,
  Select,
} from "flowbite-react";

import { HiPlusCircle, HiCheck, HiOutlineX } from "react-icons/hi";
import { agendamentoSchema } from "./schema";
import { AgendamentoContext } from "./context";
import { Inserir, ListarPacientes, ListarExames } from "./api";
import { toast } from "react-toastify";

export default function NovoAgendamento() {
  const [modalAtivo, setModalAtivo] = useState(false);
  const [atualizar, setAtualizar] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pacientes, setPacientes] = useState(null);
  const [exames, setExames] = useState(null);
  const [duracaoExame, setDuracaoExame] = useState(null);
  const [horaFimEst, setHoraFimEst] = useState(null);

  const contextoAtual = useContext(AgendamentoContext);

  const exibeDataAtual = () => {
    // obtem data
    const dataAtual = new Date();

    // constrói data para informar em TextInput no Flowbite React:
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const dia = String(dataAtual.getDate()).padStart(2, "0");
    const hora = String(dataAtual.getHours()).padStart(2, "0");
    const minuto = String(dataAtual.getMinutes()).padStart(2, "0");

    // Formato desejado para o input datetime-local do TextInput Flowbite Reat
    const formatoData = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    //console.log(formatoData);
    return formatoData;
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue, // Pegando a função setValue para atualizar os campos do formulário em separado
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pacienteid: "",
      exameid: "",
      // horini: new Date().toISOString().slice(0, 16), // Formato 'yyyy-MM-ddThh:mm',
      horini: exibeDataAtual(), // Formato 'yyyy-MM-ddThh:mm',
    },
    resolver: yupResolver(agendamentoSchema),
  });

  const onSubmit = async (data) => {
    setBusy((p) => true);
    // Exibe os dados do formulário
    // console.log(data);

    // define status do Agendamento na inclusão
    // 0 (ativo)
    // data.status = 0;
    // informa que dados não são confirmados por padrão
    // data.dadosok = false;
    // informo
    // data.convocacao = false;
    // temporariamente enquanto não há Usuário coloca id 1
    // pois há esse Usuário no BD
    // após isso colocar id do Usuário da sessão
    //// data.usuarioId = 1;

    //console.log(data);

    const dados = {
      status: 0,
      dadosok: false,
      convocacao: false,
      confirmacao: false,
      pacienteid: data.pacienteid,
      exameid: data.exameid,
      horini: data.horini,
      numfila: 0,
    };

    // const resultado = await Inserir(data);
    const resultado = await Inserir(dados);
    // console.log(resultado);
    if (resultado.success) {
      closeModal();
      contextoAtual.atualizarDados(true);

      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((p) => false);
  };

  const closeModal = () => {
    reset({
      pacienteid: "",
      exameid: "",
      // horini: new Date().toISOString().slice(0, 16), // Formato 'yyyy-MM-ddThh:mm',
      horini: exibeDataAtual(), // Formato 'yyyy-MM-ddThh:mm',
    });
    setPacientes(null);
    setExames(null);
    setDuracaoExame(null);
    setHoraFimEst(null);
    setModalAtivo(false);
    setAtualizar(null);
    contextoAtual.fechaTela();
  };

  const buscaPacientes = async () => {
    let resultado = null;
    resultado = await ListarPacientes();
    // console.log(resultado);

    try {
      if (resultado.success) {
        // console.log("Lista de pacientes");
        // console.log(resultado.data);
        setPacientes(resultado.data);
      } else {
        setPacientes(null);
        if (resultado.message !== "")
          toast.error("Agendamento:" + resultado.message);
      }
    } catch {
      toast.error("Agendamento: unknown error(1)");
    }
  };

  const buscaExames = async () => {
    let resultado = null;
    resultado = await ListarExames();
    // console.log(resultado);

    try {
      if (resultado.success) {
        // console.log("Lista de pacientes");
        // console.log(resultado.data);
        setExames(resultado.data);
      } else {
        setExames(null);
        setDuracaoExame(null);
        setHoraFimEst(null);
        if (resultado.message !== "")
          toast.error("Agendamento:" + resultado.message);
      }
    } catch {
      toast.error("Agendamento: unknown error(2)");
    }
  };

  //toda vez que componente for renderizado na tela: carrega as tabelas usadas no select: Paciente e Exame
  // useEffect(() => {
  //   buscaPacientes();
  //   buscaExames();
  // }, []);

  // faz o carregamento de pacientes e exames mesmo tela estando com modalAtivo = false pra exatamente
  // forçar sempre ter os dados atualizados
  // esse componente já é carregado na tela então para evitar demora ao exibir os itens do select
  // ele é carregado em "background"
  useEffect(() => {
    if (atualizar === null) setAtualizar(true);

    if (atualizar) {
      buscaPacientes();
      buscaExames();
      setAtualizar((p) => false);
    }
  }, [atualizar]);

  // toda vez que modal for exibido ele zera os campos pois é novo registro
  useEffect(() => {
    if (modalAtivo) {
      // toda vez que formulário e modal forem exibidos
      // eu forço a exibição da data e hora mais atual no campo horini
      // setValue permite alterar um campo da tela em específico
      // o reset limpa todos os campos
      setValue("horini", exibeDataAtual()); // Aqui usamos setValue para atualizar o campo horini
    }
  }, [modalAtivo, setValue]); // por boas práticas é sugerido adicionar o setValue nas dependências

  // constroi Select de Pacientes
  const PreenchePacientes = () => {
    let resultado = null;

    if (!pacientes) {
      // pacientes nulo ou undefined, retorna opção bloqueada
      return (
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

    // Se pacientes não for vazio, mapeia os dados com pacientes usando spread
    resultado = [
      <option
        key={0}
        value=""
        disabled
        className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
      >
        [Escolha o Paciente]
      </option>,
      ...pacientes.map((p) => (
        <option
          key={p.id}
          value={p.id}
          className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        >
          {p.nome}
        </option>
      )),
    ];

    // console.log("Carregou Pacientes");
    // console.log(resultado);
    return resultado;
  };

  // constroi Select de exames
  const PreencheExames = () => {
    let resultado = null;

    if (!exames) {
      // exames nulo ou undefined, retorna opção bloqueada
      return (
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

    // Se pacientes não for vazio, mapeia os dados com pacientes usando spread
    resultado = [
      <option
        key={0}
        value=""
        disabled
        className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
      >
        [Escolha o Exame]
      </option>,
      ...exames.map((p) => (
        <option
          key={p.id}
          value={p.id}
          className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        >
          {p.nome}
        </option>
      )),
    ];

    // console.log("Carregou Pacientes");
    // console.log(resultado);
    return resultado;
  };

  const exibeHoraFinalEst = (e, duracao) => {
    const inicio = new Date(e.target.value); // obtém data e hora do campo TextInput
    const dur = duracao || duracaoExame; // fallback pro state, se necessário
    //    console.log(inicio);
    // inclui duração em minutos pra hora final estimada
    const hrfimEst = new Date(inicio.getTime() + dur * 60000);
    //console.log(hrfimEst);
    // setHoraFimEst(hrfimEst.toISOString().slice(0, 16));
    // Ajusta a hora para o fuso horário local
    const hrLocal = new Date(hrfimEst).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo", // Fuso horário de São Paulo (GMT-03:00)
    });

    // setHoraFimEst(hrLocal); // Agora a hora estará ajustada para o horário local
    setHoraFimEst(hrfimEst); // Agora a hora estará ajustada para o horário local
  };

  return (
    <>
      <Button
        className="mt-3"
        size="lg"
        onClick={() => {
          setModalAtivo(true);
        }}
      >
        {/* className = h-5 w-5 or size={10} */}
        <HiPlusCircle className="mr-1 h-7 w-7" />
        <span>Novo Agendamento</span>
      </Button>

      <Modal show={modalAtivo} onClose={closeModal}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Agendamento - Novo Registro</ModalHeader>
          {/* permite que modal tenha barra de rolagem, se preciso; 
          max-h screen: altura máxima do modal na altura da tela (exceto header e footer do modal)
          260px: medida pra alinhar cabeçalho e rodapé do modal
          */}
          <ModalBody className="overflow-auto max-h-[calc(100vh-260px)]">
            {/* Campo Paciente */}
            <div className="mb-4">
              <Label htmlFor="selPaciente" className="dark:text-white">
                Paciente
              </Label>
              <Select
                id="selPaciente"
                className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
                {...register("pacienteid")}
              >
                {PreenchePacientes()}
                {/* Chama a função para retornar conteúd JSX do select */}
              </Select>
              {errors.pacienteid && (
                <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                  {errors.pacienteid.message}
                </span>
              )}
            </div>

            {/* Campo Exame */}
            <div className="mb-4">
              <Label htmlFor="selExame" className="dark:text-white">
                Exame
              </Label>
              <Select
                id="selExame"
                className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
                {...register("exameid")}
                onChange={(e) => {
                  const codExame = e.target.value;
                  const exameSelecionado = exames?.find(
                    (x) => x.id == codExame
                  );
                  const novaDuracao = exameSelecionado?.duracao || null;
                  // a partir da escolha do select ele informa a duração do exame informada no bd
                  setDuracaoExame((p) => novaDuracao);

                  // Chama a função exibeHoraFinalEst diretamente com valor atual do horini pelo Hook Forms
                  const valhorIni = getValues("horini");
                  // console.log(novaDuracao);
                  // console.log(duracaoExame);
                  // console.log(valhorIni);

                  // macete pra chamar função informando como se fosse evento do Onchange
                  // pelo e.target
                  if (valhorIni && novaDuracao) {
                    // console.log("Entrou");
                    exibeHoraFinalEst(
                      { target: { value: valhorIni } },
                      novaDuracao
                    ); // chamada direta
                  }
                }}
              >
                {PreencheExames()}
                {/* Chama a função para retornar conteúd JSX do select */}
              </Select>
              {errors.exameid && (
                <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                  {errors.exameid.message}
                </span>
              )}
              {duracaoExame && (
                <p className="mb-2 text-sm text-blue-700 dark:text-blue-400">
                  Duração padrão do exame:{" "}
                  <strong>{duracaoExame} minutos </strong>
                </p>
              )}
            </div>

            {/* Campo HorIni */}
            <div className="mb-4">
              <Label htmlFor="horini" className="dark:text-white">
                Data/Hora Agendamento
              </Label>
              <TextInput
                id="horini"
                type="datetime-local"
                placeholder="Informe data e hora do agendamento do exame"
                {...register("horini")}
                onChange={(e) => exibeHoraFinalEst(e, duracaoExame)}
                className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
              />
              {errors.horini && (
                <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                  {errors.horini.message}
                </span>
              )}
              {horaFimEst && (
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-300">
                  Término previsto do exame:{" "}
                  <strong>
                    {new Date(horaFimEst).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </p>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="justify-end">
            <Button
              className="w-40 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
              size="lg"
              color="green"
              type="submit"
              disabled={busy}
            >
              {busy ? (
                <Spinner
                  size="sm"
                  aria-label="Spinner Salvar"
                  className="me-3 h-5 w-5"
                  light
                />
              ) : (
                <HiCheck className="mr-1 h-5 w-5" />
              )}
              Salvar
            </Button>

            <Button
              className="w-30 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white"
              size="lg"
              color="red"
              onClick={closeModal}
              disabled={busy}
            >
              <HiOutlineX className="mr-1 h-5 w-5" />
              Cancelar
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
