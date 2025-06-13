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
  Textarea,
} from "flowbite-react";
import { desistenciaSchema } from "./schema";
import { AtendimentoContext } from "./context";
import { toast } from "react-toastify";
import { RegistrarDesistencia } from "./api";
import { HiOutlineXCircle, HiOutlineX } from "react-icons/hi";

export default function Desistencia({ AgendID }) {
  const [modalAtivo, setModalAtivo] = useState(true);
  const [busy, setBusy] = useState(false);

  const exibeDataAtual = () => {
    // obtem data
    const dataAtual = new Date();

    // constrói data para informar em TextInput no Flowbite React:
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const dia = String(dataAtual.getDate()).padStart(2, "0");
    const hora = String(dataAtual.getHours()).padStart(2, "0");
    const minuto = String(dataAtual.getMinutes()).padStart(2, "0");

    // Formato desejado para o input datetime-local do TextInput Flowbite Reat
    const formatoData = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    //console.log(formatoData);
    return formatoData;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      dtDes: exibeDataAtual(), // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-",
      motDes: "",
    },
    resolver: yupResolver(desistenciaSchema),
  });

  const contextoAtual = useContext(AtendimentoContext);

  const onSubmit = async (data) => {
    setBusy((busy) => true);

    // data.agendamentoId = AgendID;
    // console.log(data);
    const dados = {
      agendamentoId: AgendID,
      dtDes: data.dtDes, // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-",
      motDes: data.motDes,
    };
    // const resultado = await RegistrarDesistencia(data);
    const resultado = await RegistrarDesistencia(dados);

    if (resultado.success) {
      closeModal();
      contextoAtual.atualizarDados();

      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((busy) => false);
  };

  const closeModal = () => {
    reset({
      dtDes: exibeDataAtual(), // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-",
      motDes: "",
    });
    setModalAtivo(false);
    contextoAtual.fechaTela();
  };

  return (
    <Modal show={modalAtivo} onClose={closeModal}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Atendimento - Desistência de Paciente</ModalHeader>
        {/* permite que modal tenha barra de rolagem, se preciso; 
          max-h screen: altura máxima do modal na altura da tela (exceto header e footer do modal)
          260px: medida pra alinhar cabeçalho e rodapé do modal
          */}
        <ModalBody className="overflow-auto max-h-[calc(100vh-260px)]">
          {/* Campo Data e Hora */}
          <div className="mb-4">
            <Label htmlFor="data" className="dark:text-white">
              Data de Desistência
            </Label>
            <TextInput
              id="data"
              type="datetime-local"
              placeholder="Informe a data e hora da desistência"
              {...register("dtDes")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.dtDes && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.dtDes.message}
              </span>
            )}
          </div>

          {/* Campo Motivo */}
          <div className="mb-4">
            <Label htmlFor="motivo" className="dark:text-white">
              Motivo:
            </Label>
            <Textarea
              id="motivo"
              placeholder="Informe motivo da desistencia"
              {...register("motDes")}
              rows={3}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.motDes && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.motDes.message}
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
              <HiOutlineXCircle className="mr-1 h-5 w-5" />
            )}
            Confirmar
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
