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
import { useState } from "react";
import { HiCheck } from "react-icons/hi";
import { AtualizaSenha } from "./api";
import { toast } from "react-toastify";
// import { UsuarioContext } from "./context";
import { passwordSchema } from "./schema";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

// usa biblioteca básica de NextJS
const crypto = require("crypto");

//função para criar hash em sha256
function createSHA256Hash(valor) {
  const hash = crypto.createHash("sha256");
  hash.update(valor);
  return hash.digest("hex");
}

// salt deve ser o mesmo aqui e em telas de alteração de senha
const senhaSalt = "aq5y47kbn35";

export default function UsuarioUpdPwd({ limpaTela, usuarioID }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      senhaAntiga: "",
      senhaNova: "",
      senhaConfirma: "",
    },
    resolver: yupResolver(passwordSchema),
  });

  const handleClose = () => {
    reset({
      senhaAntiga: "",
      senhaNova: "",
      senhaConfirma: "",
    });
    setModalOpen(false);
    limpaTela();
  };

  const onSubmit = async (data) => {
    setBusy((p) => true);

    let codUsuario = usuarioID;
    // adiciona cod usuário
    // data.usuarioID = codUsuario;
    // antes de enviar a senha é feito hash

    // cria senha com salt
    const senhaOldHash = createSHA256Hash(data.senhaAntiga + senhaSalt);
    const senhaNewHash = createSHA256Hash(data.senhaNova + senhaSalt);
    // console.log(senhaHash);
    // informa senha com hash
    // data.senhaAntiga = senhaOldHash;
    // data.senhaNova = senhaNewHash;
    // data.senhaConfirma = senhaNewHash;

    const dados = {
      usuarioID: codUsuario,
      senhaAntiga: senhaOldHash,
      senhaNova: senhaNewHash,
      senhaConfirma: senhaNewHash,
    };
    // console.log(dados);

    const resultado = await AtualizaSenha(dados);

    if (resultado.success) {
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
          Alteração de senha
        </ModalHeader>
        <ModalBody className="overflow-auto max-h-[calc(100vh-260px)]">
          {/* Campo Senha Atual */}
          <div className="mb-4">
            <Label htmlFor="atual" className="dark:text-white">
              Senha atual:
            </Label>
            <TextInput
              id="atual"
              type="password"
              placeholder=""
              {...register("senhaAntiga")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300 "
            />
            {errors.senhaAntiga && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.senhaAntiga.message}
              </span>
            )}
          </div>

          {/* Campo Senha Nova */}
          <div className="mb-4">
            <Label htmlFor="nova" className="dark:text-white">
              Senha nova:
            </Label>
            <TextInput
              id="nova"
              type="password"
              placeholder=""
              {...register("senhaNova")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300 "
            />
            {errors.senhaNova && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.senhaNova.message}
              </span>
            )}
          </div>

          {/* Campo Senha Confirma */}
          <div className="mb-4">
            <Label htmlFor="confirma" className="dark:text-white">
              Confirma senha:
            </Label>
            <TextInput
              id="confirma"
              type="password"
              placeholder=""
              {...register("senhaConfirma")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300 "
            />
            {errors.senhaConfirma && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.senhaConfirma.message}
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
              <HiCheck className="mr-1 h-5 w-5" />
            )}
            Alterar
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
