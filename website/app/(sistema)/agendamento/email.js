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
import { HiMail } from "react-icons/hi";
import { ReenviarEmail } from "./api";
import { toast } from "react-toastify";

export default function ReenviaEmail({ id, nome, dtAgend }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  const contextoAtual = useContext(AgendamentoContext);

  const handleClose = () => {
    setModalOpen(false);
    contextoAtual.fechaTela();
  };

  const handleEmail = async () => {
    setBusy(true);

    const dados = {
      agendamentoId: id,
    };

    const resultado = await ReenviarEmail(dados);

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
        Agendamento - Reenvio de E-mail
      </ModalHeader>
      <ModalBody className="dark:text-white">
        Deseja realmente reenviar e-mail para {` "${nome}"`} com agendamento
        para {` "${dtAgend}"`}?
      </ModalBody>
      <ModalFooter className="justify-end">
        <Button
          className="w-40 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
          size="lg"
          type="button"
          color="green"
          disabled={busy}
          onClick={handleEmail}
        >
          {busy ? (
            <Spinner
              size="sm"
              aria-label="Spinner Salvar"
              className="me-3 h-5 w-5"
              light
            />
          ) : (
            <HiMail className="mr-1 h-5 w-5" />
          )}
          Reenviar
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
