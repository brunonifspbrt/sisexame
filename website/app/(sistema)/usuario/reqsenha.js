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
import { HiOutlineKey } from "react-icons/hi";
import { SolicitaAltSenha } from "./api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { UsuarioContext } from "./context";

export default function ReqSenha({ id, nome }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  const contextoAtual = useContext(UsuarioContext);

  const router = useRouter(); // useRouter funciona como link e permite informar a rota desejada

  const handleClose = () => {
    setModalOpen(false);
    contextoAtual.fechaTela();
  };

  const handleEmail = async (codUsuario) => {
    setBusy(true);

    const dados = {
      usuarioId: codUsuario,
      // urlSite: `${window.location.origin}/resetpwd/${codUsuario}`, // adiciona o caminho do site para resetar senha
    };
    // console.log(dados);

    const resultado = await SolicitaAltSenha(dados);

    // console.log("Bloco Resultado 1");
    // console.log(resultado);

    if (resultado.success) {
      // console.log("Bloco Resultado");
      // console.log(resultado);
      // console.log("Bloco Resultado MSG");
      // console.log(resultado.message);
      // contextoAtual.atualizarDados(true);
      handleClose();
      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((p) => false);
  };

  return (
    <Modal show={modalOpen} onClose={handleClose}>
      <ModalHeader className="dark:text-white">
        Redefinição de Senha
      </ModalHeader>
      <ModalBody className="dark:text-white">
        Deseja realmente solicitar a redefinição de sua senha para {nome}?
      </ModalBody>
      <ModalFooter className="justify-end">
        <Button
          className="w-40 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
          size="lg"
          type="button"
          color="green"
          disabled={busy}
          onClick={() => {
            handleEmail(id);
          }}
        >
          {busy ? (
            <Spinner
              size="sm"
              aria-label="Spinner Salvar"
              className="me-3 h-5 w-5"
              light
            />
          ) : (
            <HiOutlineKey className="mr-1 h-5 w-5" />
          )}
          Redefinir
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
