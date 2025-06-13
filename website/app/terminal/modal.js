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
import { TerminalContext } from "./context";
import { toast } from "react-toastify";

export default function ModalConfirmacao() {
  const [modalOpen, setModalOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  const contextoAtual = useContext(TerminalContext);

  const handleClose = () => {
    setModalOpen(false);
    contextoAtual.fechaTela();
  };

  const handleSim = async () => {
    setBusy(true);

    setModalOpen(false);
    // contextoAtual.atualizarDados(true);
    contextoAtual.atualizarDados();
    setBusy((p) => false);
  };

  return (
    <Modal show={modalOpen} onClose={handleClose} popup>
      <ModalHeader className="dark:text-white">
        Confirmação de Presença
      </ModalHeader>
      <ModalBody className="dark:text-white">
        Deseja confirmar sua hoje sua presença para os exames do dia listados?
      </ModalBody>
      <ModalFooter className="justify-end">
        <Button
          className="w-40 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
          size="lg"
          type="button"
          color="green"
          disabled={busy}
          onClick={handleSim}
        >
          {busy ? (
            <Spinner
              size="sm"
              aria-label="Spinner Salvar"
              className="me-3 h-5 w-5"
              light
            />
          ) : null}
          Sim
        </Button>
        <Button
          className="w-30 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white"
          size="lg"
          color="red"
          onClick={handleClose}
        >
          Não
        </Button>
      </ModalFooter>
    </Modal>
  );
}
