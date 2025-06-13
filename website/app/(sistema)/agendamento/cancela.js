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
import { AgendamentoContext } from "./context";
import { HiBan } from "react-icons/hi";
import { Cancelar } from "./api";
import { toast } from "react-toastify";

export default function CancelaAgend({ id, nome, dtAgend }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  const contextoAtual = useContext(AgendamentoContext);

  const handleClose = () => {
    setModalOpen(false);
    contextoAtual.fechaTela();
  };

  const handleConfirma = async () => {
    setBusy(true);

    const dados = {
      agendamentoId: id,
    };

    const resultado = await Cancelar(dados);

    // console.log("Bloco Resultado 1");
    // console.log(resultado);

    if (resultado.success) {
      // console.log("Bloco Resultado");
      // console.log(resultado);
      // console.log("Bloco Resultado MSG");
      // console.log(resultado.message);
      handleClose();
      contextoAtual.atualizarDados(true);
      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((p) => false);
  };

  return (
    <Modal show={modalOpen} onClose={handleClose}>
      <ModalHeader className="dark:text-white">
        Agendamento - Cancelamento
      </ModalHeader>
      <ModalBody className="dark:text-white">
        Confirma cancelamento de agendamento de {` "${nome}"`} registrado para
        {` "${dtAgend}"`}?
      </ModalBody>
      <ModalFooter className="justify-end">
        <Button
          className="w-40 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
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
            <HiBan className="mr-1 h-5 w-5" />
          )}
          Confirmar
        </Button>
        <Button
          className="w-30 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white"
          size="lg"
          color="red"
          onClick={handleClose}
          disabled={busy}
        >
          Desistir
        </Button>
      </ModalFooter>
    </Modal>
  );
}
