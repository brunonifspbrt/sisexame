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
  Textarea,
  Checkbox,
} from "flowbite-react";
import { exameSchema } from "./schema";
import { ExameContext } from "./context";
import { toast } from "react-toastify";
import { Atualizar, BuscarRegistro } from "./api";
import { HiCheck, HiOutlineX } from "react-icons/hi";

export default function Edicao({ id }) {
  const [modalAtivo, setModalAtivo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [buscaRegistro, setBuscaRegistro] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nome: "",
      descricao: "",
      duracao: 10,
      instrucoes: "",
      ativo: true, // Valor padrão para o checkbox
    },
    resolver: yupResolver(exameSchema),
  });

  const contextoAtual = useContext(ExameContext);

  const onSubmit = async (data) => {
    setBusy((busy) => true);

    // data.id = id;
    const dados = {
      id: id,
      nome: data.nome,
      descricao: data.descricao,
      duracao: data.duracao,
      instrucoes: data.instrucoes,
      ativo: data.ativo,
    };
    // const resultado = await Atualizar(data);
    const resultado = await Atualizar(dados);

    if (resultado.success) {
      closeModal();
      contextoAtual.atualizarDados(true);

      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((busy) => false);
  };

  const closeModal = () => {
    reset({
      nome: "",
      descricao: "",
      duracao: 10,
      instrucoes: "",
      ativo: true, // Valor padrão para o checkbox
    });
    setModalAtivo(false);
    contextoAtual.fechaTela();
  };

  const BuscarDados = async () => {
    setBusy(true);

    const resultado = await BuscarRegistro(id);

    if (resultado.success) {
      if (resultado.message !== "") toast.success(resultado.message);

      reset({
        nome: resultado.data.nome,
        descricao: resultado.data.descricao,
        duracao: resultado.data.duracao,
        instrucoes: resultado.data.instrucoes,
        ativo: resultado.data.ativo,
      });
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
      closeModal();
    }

    setBusy((p) => false);
  };

  useEffect(() => {
    if (buscaRegistro === null) setBuscaRegistro(true);

    if (buscaRegistro) {
      setBuscaRegistro(false);
      BuscarDados();
      // força timeout para mostrar a tela com todos os dados
      setTimeout(() => {
        setModalAtivo(true); // habilita após carregar os valores necessários
      }, 300);
    }
  }, [buscaRegistro]);

  return (
    <Modal show={modalAtivo} onClose={closeModal}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Exame - Altera Registro</ModalHeader>
        {/* permite que modal tenha barra de rolagem, se preciso; 
          max-h screen: altura máxima do modal na altura da tela (exceto header e footer do modal)
          260px: medida pra alinhar cabeçalho e rodapé do modal
          */}
        <ModalBody className="overflow-auto max-h-[calc(100vh-260px)]">
          {/* Campo Nome */}
          <div className="mb-4">
            <Label htmlFor="nome" className="dark:text-white">
              Nome
            </Label>
            <TextInput
              id="nome"
              placeholder="Informe o nome do exame"
              {...register("nome")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.nome && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.nome.message}
              </span>
            )}
          </div>

          {/* Campo Descrição */}
          <div className="mb-4">
            <Label htmlFor="descricao" className="dark:text-white">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              placeholder="Informe a descrição do exame"
              {...register("descricao")}
              rows={5}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.descricao && (
              <span className="text-sm font-semibold  text-red-500 dark:text-red-400">
                {errors.descricao.message}
              </span>
            )}
          </div>

          {/* Campo Duração */}
          <div className="mb-4">
            <Label htmlFor="duracao" className="dark:text-white">
              Duração (em minutos)
            </Label>
            <TextInput
              id="duracao"
              type="number"
              placeholder="Informe a duração do exame"
              {...register("duracao")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.duracao && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.duracao.message}
              </span>
            )}
          </div>

          {/* Campo Instrução */}
          <div className="mb-4">
            <Label htmlFor="instrucoes" className="dark:text-white">
              Instruções de Preparo
            </Label>
            <Textarea
              id="instrucoes"
              placeholder="Informe as instruções de preparo para o exame"
              {...register("instrucoes")}
              rows={5}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.instrucoes && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.instrucoes.message}
              </span>
            )}
          </div>

          {/* Campo Ativo (Checkbox) */}
          <div className="mb-4">
            <Label htmlFor="ativo" className="dark:text-white">
              Status do Exame
            </Label>
            <div className="flex items-center space-x-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300">
              <Checkbox id="ativo" {...register("ativo")} />
              <span className="font-semibold">Exame Ativo</span>
            </div>
            {errors.ativo && (
              <span className="text-sm text-red-500 dark:text-red-400">
                {errors.ativo.message}
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
