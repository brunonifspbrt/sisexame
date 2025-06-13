"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Spinner,
} from "flowbite-react";
import { useContext, useState } from "react";
import { AgendConfContext } from "./context";
import { HiMicrophone } from "react-icons/hi";
import { ChamarPacienteDados } from "./api";
import { toast } from "react-toastify";

export default function Chamada({ idAgenda, nome, dtAgend }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  const contextoAtual = useContext(AgendConfContext);

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

  const handleConfirma = async () => {
    setBusy(true);

    const dados = {
      agendamentoId: idAgenda,
    };

    const resultado = await ChamarPacienteDados(dados);

    // console.log("Bloco Resultado 1");
    // console.log(resultado);

    if (resultado.success) {
      // console.log("Bloco Resultado");
      // console.log(resultado);
      // console.log("Bloco Resultado MSG");
      // console.log(resultado.message);
      handleClose();
      // contextoAtual.atualizarDados(true);
      contextoAtual.atualizarDados();
      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((p) => false);
  };

  return (
    <Modal show={modalOpen} onClose={handleClose}>
      <ModalHeader className="dark:text-white">
        Atendimento - Chamada Conf. Dados
      </ModalHeader>
      <ModalBody className="dark:text-white">
        Confirma a chamada do paciente {` "${nome}"`} agendado às{" "}
        {` "${formatarData(dtAgend)}"`}?
      </ModalBody>
      <ModalFooter className="justify-end">
        <Button
          className="w-50 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
          size="lg"
          type="button"
          color="green"
          disabled={busy}
          onClick={handleConfirma}
        >
          {busy ? (
            <Spinner
              size="sm"
              aria-label="Spinner Salvar"
              className="me-3 h-5 w-5"
              light
            />
          ) : (
            <HiMicrophone className="mr-1 h-5 w-5" />
          )}
          Chamar Paciente
        </Button>
        <Button
          className="w-30 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white"
          size="lg"
          color="red"
          onClick={handleClose}
          disabled={busy}
        >
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
