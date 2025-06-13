"use client";

import {
  Label,
  TextInput,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Spinner,
} from "flowbite-react";
import { useContext, useState } from "react";
import { HiMail } from "react-icons/hi";
import { SolicitaAltEmail } from "./api";
import { toast } from "react-toastify";
// import { UsuarioContext } from "./context";
import { usuariomailSchema } from "./schema";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

export default function UsuarioReqMail({ limpaTela, usuarioID }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  // const contextoAtual = useContext(UsuarioContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailNovo: "", // valor padrão
    },
    resolver: yupResolver(usuariomailSchema),
  });

  const handleClose = () => {
    reset({
      emailNovo: "", // valor padrão
    });
    setModalOpen(false);
    limpaTela();
    // contextoAtual.fechaTela();
  };

  const onSubmit = async (data) => {
    setBusy((p) => true);

    let codUsuario = usuarioID;
    // adiciona cod usuário
    // data.usuarioID = codUsuario;
    // data.urlSite = `${window.location.origin}/resetmail/${codUsuario}`; // adiciona o caminho do site para resetar senha

    // console.log(dados);
    const dados = {
      usuarioID: codUsuario,
      emailNovo: data.emailNovo,
    };

    // const resultado = await SolicitaAltEmail(data);
    const resultado = await SolicitaAltEmail(dados);

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
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader className="dark:text-white">
          Alteração de e-mail
        </ModalHeader>
        <ModalBody className="overflow-auto max-h-[calc(100vh-260px)]">
          {/* Campo Email */}
          <div className="mb-4">
            <Label htmlFor="email" className="dark:text-white">
              Novo E-mail
            </Label>
            <TextInput
              id="email"
              type="email"
              placeholder="Informe o novo email"
              {...register("emailNovo")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.emailNovo && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.emailNovo.message}
              </span>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="justify-end">
          <Button
            className="w-40 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
            size="lg"
            color="green"
            disabled={busy}
            type="submit"
          >
            {busy ? (
              <Spinner
                size="sm"
                aria-label="Spinner Redefinir"
                className="me-3 h-5 w-5"
                light
              />
            ) : (
              <HiMail className="mr-1 h-5 w-5" />
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
      </form>
    </Modal>
  );
}
