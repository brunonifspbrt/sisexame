"use client";

import { useContext, useState } from "react";
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

import { HiPlusCircle, HiCheck, HiOutlineX } from "react-icons/hi";
import { parametroSchema } from "./schema";
import { ParametroContext } from "./context";
import { Inserir } from "./api";
import { toast } from "react-toastify";

export default function NovoParametro() {
  const [modalAtivo, setModalAtivo] = useState(true); // por padrão tela já exibirá ao chamar o componente
  const [busy, setBusy] = useState(false);

  const contextoAtual = useContext(ParametroContext);

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

  const onSubmit = async (data) => {
    setBusy((p) => true);
    // Exibe os dados do formulário
    // console.log(data);
    const dados = {
      atrasoMaximo: data.atrasoMaximo,
    };
    // const resultado = await Inserir(data);
    const resultado = await Inserir(dados);
    // console.log(resultado);
    if (resultado.success) {
      closeModal();
      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((p) => false);
  };

  const closeModal = () => {
    reset({
      atrasoMaximo: 10, // valor padrão
    });
    setModalAtivo(false);
    contextoAtual.fechaTela();
  };

  return (
    <>
      <Modal show={modalAtivo} onClose={closeModal} className="dark:text-white">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="dark:text-white">
            Parâmetros - Configuração Inicial
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
    </>
  );
}
