"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Spinner,
  Timeline,
  TimelineBody,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTime,
  TimelineTitle,
} from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import { ResumoContext } from "./context";
import { HiOutlineBackspace, HiCalendar } from "react-icons/hi";
import { toast } from "react-toastify";
import { BuscarRegistro } from "./api";

export default function Detalhe({ idAgenda, nome, dtAgend }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [buscaRegistro, setBuscaRegistro] = useState(null);
  const [dados, setDados] = useState(null); // dados exibidos na tabela
  const [dadosDetalhe, setDadosDetalhe] = useState(null); // dados exibidos na tabela
  const [busy, setBusy] = useState(false);

  const contextoAtual = useContext(ResumoContext);

  const formatarData = (data) => {
    if (!data) return "";
    const dateObj = new Date(data);

    const dia = dateObj.toLocaleString("pt-BR", { day: "2-digit" });
    const mes = dateObj.toLocaleString("pt-BR", { month: "2-digit" });
    const ano = dateObj.toLocaleString("pt-BR", { year: "numeric" });
    const hora = dateObj.toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${dia}/${mes}/${ano}\n${hora}`;
  };

  const handleClose = () => {
    setModalOpen(false);
    contextoAtual.fechaTela();
  };

  const buscaDados = async () => {
    const resultado = await BuscarRegistro(idAgenda);
    if (resultado.success) {
      if (resultado.data !== null) {
        // guarda valores originais do BD
        setDados(resultado.data);
        // console.log(resultado.data);
      }
    } else {
      setDados(null);
      if (resultado.message !== "")
        toast.error("Resumo Diário - Detalhe: " + resultado.message);
    }
  };

  const criaDetalheItem = (item, index) => {
    // console.log(item);
    let resultado = null;
    if (item) {
      resultado = (
        <TimelineItem key={index} className="bg-white dark:bg-gray-800">
          <TimelinePoint
            icon={HiCalendar}
            className="text-blue-500 dark:text-blue-300"
          />
          <TimelineContent className="text-gray-900 dark:text-white">
            <TimelineTime className="text-sm dark:text-gray-400">
              {item.data}
            </TimelineTime>
            <TimelineTitle className="font-semibold text-lg text-gray-800 dark:text-gray-200">
              {item.titulo}
            </TimelineTitle>
            <TimelineBody className="text-sm text-gray-700 dark:text-gray-300">
              {item.texto}
            </TimelineBody>
          </TimelineContent>
        </TimelineItem>
      );
    }
    // console.log(resultado);
    return resultado;
  };

  const montaDetalhe = (dados) => {
    setBusy((p) => true);

    if (!dados) {
      return;
    }

    // array contendo passos do agendamento selecionado
    const detalhes = [];

    // console.log(dados);

    // passo 1: registro do agendamento
    detalhes.push({
      // data: formatarData(dados[0].dtAgenda),
      data: formatarData(dados[0].horLancto),
      titulo: "Agendamento Cadastrado",
      texto:
        "Paciente: " +
        dados[0].pacienteNome +
        " ,Exame: " +
        dados[0].exameNome +
        " ,Data Agendamento: " +
        formatarData(dados[0].dtAgenda),
    });

    // agendamento cancelado
    if (dados[0].status === 1) {
      if (dados[0]?.horPresenca) {
        detalhes.push({
          data: formatarData(dados[0].horPresenca),
          titulo: "Confirmação de presença",
          texto: "Paciente confirmou comparecimento ao exame",
        });
      }

      if (dados[0]?.confirmacao) {
        detalhes.push({
          data: formatarData(dados[0].horConfirmacao),
          titulo: "Chamada para confirmar dados",
          texto: "Paciente foi chamado para confirmar dados",
        });
      }

      detalhes.push({
        data: formatarData(dados[0].horCancela),
        titulo: "Cancelamento",
        texto: "Agendamento Cancelado",
      });
    }

    // paciente confirmou presença:
    if (dados[0].status === 2) {
      detalhes.push({
        data: formatarData(dados[0].horPresenca),
        titulo: "Confirmação de presença",
        texto: "Paciente confirmou comparecimento ao exame",
      });

      if (dados[0]?.confirmacao) {
        detalhes.push({
          data: formatarData(dados[0].horConfirmacao),
          titulo: "Chamada para confirmar dados",
          texto: "Paciente foi chamado para confirmar dados",
        });
      }

      // caso tenha confirmado os dados do paciente:
      if (dados[0].dadosOk) {
        detalhes.push({
          data: formatarData(dados[0].horDados),
          titulo: "Confirmação de dados",
          texto: "Confirmação de dados para realização do exame",
        });
      }

      if (dados[0]?.numFila > 0) {
        detalhes.push({
          data: formatarData(dados[0].horFila),
          titulo: "Lista de Espera",
          texto:
            "Agendamento colocado em lista de espera na posição: " +
            dados[0]?.numFila,
        });
      }

      // caso tenha chamado paciente
      if (dados[0].convocacao) {
        detalhes.push({
          data: formatarData(dados[0].horConvocacao),
          titulo: "Chamada para Exame",
          texto: "Paciente foi chamado para realizar o exame agendado",
        });
      }
    }

    // paciente ausente:
    // não confirmou presença
    if (dados[0].status === 3) {
      detalhes.push({
        data: formatarData(dados[0].horAusencia),
        titulo: "Registro de ausência",
        texto: "Paciente não compareceu ao exame",
      });
    }

    // paciente desistiu:
    // paciente confirmou comparecimento porém desistiu
    if (dados[0].status === 4) {
      detalhes.push({
        data: formatarData(dados[0].horPresenca),
        titulo: "Confirmação de presença",
        texto: "Paciente confirmou comparecimento ao exame",
      });

      if (dados[0]?.confirmacao) {
        detalhes.push({
          data: formatarData(dados[0].horConfirmacao),
          titulo: "Chamada para confirmar dados",
          texto: "Paciente foi chamado para confirmar dados",
        });
      }

      // caso tenha confirmado os dados do paciente:
      if (dados[0].dadosOk) {
        detalhes.push({
          data: formatarData(dados[0].horDados),
          titulo: "Confirmação de dados",
          texto: "Confirmação de dados para realização do exame",
        });
      }

      if (dados[0]?.numFila > 0) {
        detalhes.push({
          data: formatarData(dados[0].horFila),
          titulo: "Lista de Espera",
          texto:
            "Agendamento colocado em lista de espera na posição: " +
            dados[0]?.numFila,
        });
      }

      // caso tenha chamado paciente
      if (dados[0].convocacao) {
        detalhes.push({
          data: formatarData(dados[0].horConvocacao),
          titulo: "Chamada para Exame",
          texto: "Paciente foi chamado para realizar o exame agendado",
        });
      }

      // informa desistência no final
      detalhes.push({
        data: formatarData(dados[0].horDes),
        titulo: "Registro de desistência",
        texto: "Motivo: " + dados[0].motDes,
      });
    }

    // agendamento finalizado:
    // paciente confirmou comparecimento porém desistiu
    if (dados[0].status === 5) {
      detalhes.push({
        data: formatarData(dados[0].horPresenca),
        titulo: "Confirmação de presença",
        texto: "Paciente confirmou comparecimento ao exame",
      });

      if (dados[0]?.confirmacao) {
        detalhes.push({
          data: formatarData(dados[0].horConfirmacao),
          titulo: "Chamada para confirmar dados",
          texto: "Paciente foi chamado para confirmar dados",
        });
      }

      // caso tenha confirmado os dados do paciente:
      if (dados[0].dadosOk) {
        detalhes.push({
          data: formatarData(dados[0].horDados),
          titulo: "Confirmação de dados",
          texto: "Confirmação de dados para realização do exame",
        });
      }

      if (dados[0]?.numFila > 0) {
        detalhes.push({
          data: formatarData(dados[0].horFila),
          titulo: "Lista de Espera",
          texto:
            "Agendamento colocado em lista de espera na posição: " +
            dados[0]?.numFila,
        });
      }

      // caso tenha chamado paciente
      if (dados[0].convocacao) {
        detalhes.push({
          data: formatarData(dados[0].horConvocacao),
          titulo: "Chamada para Exame",
          texto: "Paciente foi chamado para realizar o exame agendado",
        });
      }

      // informa finalização do exame
      detalhes.push({
        data: formatarData(dados[0].horFim),
        titulo: "Finalização do exame",
        texto: "Paciente realizou o exame com sucesso",
      });
    }

    // console.log(detalhes);

    // cria objeto
    const detalheTimeline = detalhes.map((item, index) => {
      return criaDetalheItem(item, index);
    });
    setDadosDetalhe(detalheTimeline);

    // console.log(detalheTimeline);

    setBusy((p) => false);
  };

  useEffect(() => {
    // toda a vez que os dados foram alterados ele constrói a timeline
    if (dados) {
      montaDetalhe(dados);
    }
  }, [dados]);

  // Buscar os dados ao carregar a página
  useEffect(() => {
    const carregarTudo = async () => {
      setBusy((p) => true);
      await buscaDados(); // busca dados do agendamento
      setBusy((p) => false);
    };

    if (buscaRegistro === null) setBuscaRegistro(true);

    if (buscaRegistro) {
      setBuscaRegistro(false);
      carregarTudo();
    }
  }, [buscaRegistro]);

  return (
    <Modal show={modalOpen} onClose={handleClose}>
      <ModalHeader className="dark:text-white">Agendamento - Fluxo</ModalHeader>
      <ModalBody className="overflow-auto max-h-[calc(100vh-260px)]">
        {busy ? (
          <div className="text-center">
            <Spinner color="info" className="mt-4 h-10 w-10" />
          </div>
        ) : (
          <Timeline>{dadosDetalhe}</Timeline>
        )}
      </ModalBody>
      <ModalFooter className="justify-end">
        <Button
          className="w-40 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
          size="lg"
          color="green"
          onClick={handleClose}
          disabled={busy}
        >
          <HiOutlineBackspace className="mr-1 h-5 w-5" />
          Voltar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
