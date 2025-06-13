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
import { agendamentoSchema } from "./schema";
import { AgendamentoContext } from "./context";
import { toast } from "react-toastify";
import {
  Atualizar,
  BuscarRegistro,
  ListarPacientes,
  ListarExames,
} from "./api";
import { HiCheck, HiOutlineX } from "react-icons/hi";

export default function Edicao({ id }) {
  const [modalAtivo, setModalAtivo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pacientes, setPacientes] = useState(null);
  const [exames, setExames] = useState(null);
  const [buscaRegistro, setBuscaRegistro] = useState(null);
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
    watch, // monitora valor do campo em tempo real
    setValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pacienteid: "",
      exameid: "",
      // horini: new Date().toISOString().slice(0, 16), // Formato 'yyyy-MM-ddThh:mm',
      horini: exibeDataAtual(), // Formato 'yyyy-MM-ddThh:mm'
    },
    resolver: yupResolver(agendamentoSchema),
  });

  const onSubmit = async (data) => {
    setBusy((busy) => true);

    // informa id do objeto Json que está sendo editado
    // data.id = id;
    // temporariamente enquanto não há Usuário coloca id 1
    // pois há esse Usuário no BD
    // após isso colocar id do Usuário da sessão
    // data.usuarioId = 1;

    const dados = {
      id: id,
      pacienteid: data.pacienteid,
      exameid: data.exameid,
      horini: data.horini,
    };

    // const resultado = await Atualizar(data);
    const resultado = await Atualizar(dados);

    if (resultado.success) {
      closeModal();
      contextoAtual.atualizarDados(true);

      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((busy) => false);
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
    contextoAtual.fechaTela();
  };

  // const BuscarDados = async () => {
  //   setBusy(true);

  //   const resultado = await BuscarRegistro(id);
  //   let dtIni = null;

  //   if (resultado.success) {
  //     if (resultado.message !== "") toast.success(resultado.message);

  //     // horIni vem nesse formato: '1970-02-08T03:00:00' (JSON da api)
  //     // porém no reacthookforms o campo date exige:YYYY-MM-DD (formato iso)
  //     // o split T separa a data quando houver o texto YYYY-MM-DDTHH:mm:ss.sssZ,
  //     //o [0] pega a data no formato yyyy-MM-ddTHH:mm' para o campo datetime-local
  //     dtIni = resultado.data.horIni.slice(0, 16);
  //     // console.log(resultado.data);
  //     // console.log(dtNasc);
  //     reset({
  //       pacienteid: resultado.data.pacienteId,
  //       exameid: resultado.data.exameId,
  //       // horini: new Date().toISOString().slice(0, 16), // Formato 'yyyy-MM-ddThh:mm',
  //       horini: dtIni, // Formato 'yyyy-MM-ddThh:mm',
  //     });
  //   } else {
  //     if (resultado.message !== "") toast.error(resultado.message);
  //     closeModal();
  //   }

  //   setBusy((p) => false);
  // };

  const BuscarDados = async () => {
    setBusy(true);

    const resultado = await BuscarRegistro(id);

    if (resultado.success) {
      if (resultado.message !== "") toast.success(resultado.message);

      // horIni vem nesse formato: '1970-02-08T03:00:00' (JSON da api)
      // porém no reacthookforms o campo date exige:YYYY-MM-DD (formato iso)
      // o split T separa a data quando houver o texto YYYY-MM-DDTHH:mm:ss.sssZ,
      //o [0] pega a data no formato yyyy-MM-ddTHH:mm' para o campo datetime-local
      const dtIni = resultado.data.horIni.slice(0, 16);
      const codExame = resultado.data.exameId;
      // console.log(resultado.data);
      // console.log(dtNasc);
      reset({
        pacienteid: resultado.data.pacienteId,
        exameid: codExame,
        // horini: new Date().toISOString().slice(0, 16), // Formato 'yyyy-MM-ddThh:mm',
        horini: dtIni, // Formato 'yyyy-MM-ddThh:mm',
      });
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
      closeModal();
    }

    setBusy((p) => false);
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

  // useEffect(() => {
  //   if (buscaRegistro === null) setBuscaRegistro(true);

  //   if (buscaRegistro) {
  //     setBuscaRegistro(false);
  //     buscaPacientes();
  //     buscaExames();
  //     BuscarDados();
  //     // força timeout para mostrar a tela com todos os dados
  //     setTimeout(() => {
  //       setModalAtivo(true); // habilita após carregar os valores necessários
  //     }, 850);
  //   }
  // }, [buscaRegistro]);

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
    // console.log(inicio);
    // inclui duração em minutos pra hora final estimada
    const hrfimEst = new Date(inicio.getTime() + dur * 60000);
    // console.log(hrfimEst);
    // setHoraFimEst(hrfimEst.toISOString().slice(0, 16));
    // Ajusta a hora para o fuso horário local
    const hrLocal = new Date(hrfimEst).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo", // Fuso horário de São Paulo (GMT-03:00)
    });
    // console.log(hrLocal);

    // console.log(hrLocal);
    // console.log(typeof hrLocal);

    // setHoraFimEst((p) => hrLocal); // Agora a hora estará ajustada para o horário local
    setHoraFimEst((p) => hrfimEst); // Agora a hora estará ajustada para o horário local
  };

  useEffect(() => {
    const carregarTudo = async () => {
      await buscaPacientes();
      await buscaExames(); // Aguardo exames antes de buscar o registro
      await BuscarDados(); // pacientes e exames já existem na memória

      // Aguarda um pouco pra garantir renderização suave
      setTimeout(() => {
        setModalAtivo(true);
      }, 850);
    };

    if (buscaRegistro === null) setBuscaRegistro(true);

    if (buscaRegistro) {
      setBuscaRegistro(false);
      carregarTudo();
    }
  }, [buscaRegistro]);

  // Observar as mudanças de 'exameid' e 'horini'
  const codExame = watch("exameid");
  const valHor = watch("horini");

  useEffect(() => {
    // console.log("Exames:", exames);
    // console.log("Hora Inicial:", valHor);

    if (codExame && valHor && exames?.length) {
      const exameAtual = exames.find((x) => x.id == codExame);
      if (exameAtual) {
        setDuracaoExame(exameAtual.duracao);
        exibeHoraFinalEst({ target: { value: valHor } }, exameAtual.duracao);
      }
    }
  }, [codExame, valHor, exames]); // Só dispara quando os exames forem carregados

  // coloco na propriedade modalShow um timeout pra ele esperar de carregar os dados
  // na tela e aí exibe

  return (
    <Modal show={modalAtivo} onClose={closeModal}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Agendamento - Altera Registro</ModalHeader>
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
              {/* {PreenchePacientes()} */}
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
              // onChange={(e) => {
              //   const codExame = e.target.value;
              //   const exameSelecionado = exames?.find((x) => x.id == codExame);
              //   const novaDuracao = exameSelecionado?.duracao || null;
              //   // a partir da escolha do select ele informa a duração do exame informada no bd
              //   setDuracaoExame((p) => novaDuracao);

              //   // Chama a função exibeHoraFinalEst diretamente com valor atual do horini pelo Hook Forms
              //   const valhorIni = getValues("horini");
              //   // console.log(novaDuracao);
              //   // console.log(duracaoExame);
              //   // console.log(valhorIni);

              //   // macete pra chamar função informando como se fosse evento do Onchange
              //   // pelo e.target
              //   if (valhorIni && novaDuracao) {
              //     // console.log("Entrou");
              //     exibeHoraFinalEst(
              //       { target: { value: valhorIni } },
              //       novaDuracao
              //     ); // chamada direta
              //   }
              // }}
            >
              {/* {PreencheExames()} */}
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
              // onChange={(e) => exibeHoraFinalEst(e, duracaoExame)}
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
  );
}
