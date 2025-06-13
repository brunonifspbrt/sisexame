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
} from "flowbite-react";
import { parametroSchema } from "./schema";
import { ParametroContext } from "./context";
import { toast } from "react-toastify";
import { Atualizar, BuscarRegistro } from "./api";
import { HiCheck, HiOutlineX } from "react-icons/hi";

export default function Edicao({ id }) {
  const [modalAtivo, setModalAtivo] = useState(true);
  const [busy, setBusy] = useState(false);
  const [buscaRegistro, setBuscaRegistro] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      atrasoMaximo: 10, // valor padrão
    },
    resolver: yupResolver(parametroSchema),
  });

  const contextoAtual = useContext(ParametroContext);

  const onSubmit = async (data) => {
    setBusy((busy) => true);

    // data.id = id;
    const dados = {
      id: id,
      atrasoMaximo: data.atrasoMaximo,
    };
    // const resultado = await Atualizar(data);
    const resultado = await Atualizar(dados);

    if (resultado.success) {
      closeModal();

      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((busy) => false);
  };

  const closeModal = () => {
    reset({
      atrasoMaximo: 10, // valor padrão
    });
    setModalAtivo(false);
    contextoAtual.fechaTela();
  };

  const BuscarDados = async () => {
    setBusy(true);

    const resultado = await BuscarRegistro(id);

    if (resultado.success) {
      reset({
        atrasoMaximo: resultado.data.atrasoMaximo,
      });
      // console.log(resultado.data);
      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
      closeModal();
    }

    setBusy((p) => false);
  };

  useEffect(() => {
    // console.log("Entrou no effect");
    if (buscaRegistro === null) setBuscaRegistro(true);

    if (buscaRegistro) {
      setBuscaRegistro(false);
      BuscarDados();
    }
  }, [buscaRegistro]);

  // useEffect(() => {
  //   console.log("Componente Edicao montado com ID:", id);
  // }, []);

  return (
    <Modal show={modalAtivo} onClose={closeModal} className="dark:text-white">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader className="dark:text-white">
          Parâmetros - Configuração
        </ModalHeader>
        <ModalBody className="overflow-auto max-h-[calc(100vh-260px)]">
          {/* Campo Atraso Máximo */}
          <div className="mb-4">
            <Label htmlFor="atrasomaximo" className="dark:text-white">
              Atraso Máximo do Paciente (em minutos):
            </Label>
            <TextInput
              id="atrasomaximo"
              type="number"
              placeholder="Informe o atraso máximo do paciente"
              {...register("atrasoMaximo")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300 "
            />
            {errors.atrasoMaximo && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.atrasoMaximo.message}
              </span>
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
