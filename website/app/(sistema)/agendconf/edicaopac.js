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
} from "flowbite-react";
import { pacienteSchema } from "./schema";
import { AgendConfContext } from "./context";
import { toast } from "react-toastify";
import { AtualizarPaciente, BuscarPaciente } from "./api";
import { HiCheck, HiOutlineX } from "react-icons/hi";

export default function PacienteEdicao({ PacienteID }) {
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
      cpf: "",
      nome: "",
      email: "",
      datanascimento: "",
      obs: "",
    },
    resolver: yupResolver(pacienteSchema),
  });

  const contextoAtual = useContext(AgendConfContext);

  function cpfValido(valCPF) {
    // Remove caracteres não numéricos
    const cpf = valCPF.replace(/\D/g, "");

    // Verifica se o CPF tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Elimina CPFs conhecidos inválidos
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Calcula o primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;

    // Calcula o segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;

    // Verifica se os dígitos verificadores estão corretos
    return (
      digito1 === parseInt(cpf.charAt(9)) &&
      digito2 === parseInt(cpf.charAt(10))
    );
  }

  const onSubmit = async (data) => {
    setBusy((busy) => true);

    // data.id = PacienteID;

    const dados = {
      id: PacienteID,
      cpf: data.cpf,
      nome: data.nome,
      email: data.email,
      datanascimento: data.datanascimento,
      obs: data.obs,
      ativo: true,
    };

    // verifica se CPF é válido
    if (!cpfValido(dados.cpf)) {
      toast.error("CPF informado é inválido!");
      setBusy((p) => false);
      return;
    }

    // const resultado = await AtualizarPaciente(data);
    const resultado = await AtualizarPaciente(dados);

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
      cpf: "",
      nome: "",
      email: "",
      datanascimento: "",
      obs: "",
    });
    setModalAtivo(false);
    contextoAtual.fechaTela();
  };

  const BuscarDados = async () => {
    setBusy(true);

    const resultado = await BuscarPaciente(PacienteID);
    let dtNasc = null;

    if (resultado.success) {
      if (resultado.message !== "") toast.success(resultado.message);

      // dataNascimento vem nesse formato: '1970-02-08T03:00:00' (JSON da api)
      // porém no reacthookforms o campo date exige:YYYY-MM-DD (formato iso)
      // o split T separa a data quando houver o texto YYYY-MM-DDTHH:mm:ss.sssZ,
      //o [0] pega a data no formato YYYY-MM-DD
      dtNasc = resultado.data.dataNascimento.split("T")[0];
      // console.log(resultado.data);
      // console.log(dtNasc);
      reset({
        cpf: resultado.data.cpf,
        nome: resultado.data.nome,
        email: resultado.data.email,
        datanascimento: dtNasc,
        obs: resultado.data.obs,
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
        <ModalHeader>Paciente - Altera Registro</ModalHeader>
        {/* permite que modal tenha barra de rolagem, se preciso; 
          max-h screen: altura máxima do modal na altura da tela (exceto header e footer do modal)
          260px: medida pra alinhar cabeçalho e rodapé do modal
          */}
        <ModalBody className="overflow-auto max-h-[calc(100vh-260px)]">
          {/* Campo CPF */}
          <div className="mb-4">
            <Label htmlFor="cpf" className="dark:text-white">
              CPF
            </Label>
            <TextInput
              id="cpf"
              placeholder="Informe o cpf do paciente"
              {...register("cpf")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.cpf && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.cpf.message}
              </span>
            )}
          </div>

          {/* Campo Nome */}
          <div className="mb-4">
            <Label htmlFor="nome" className="dark:text-white">
              Nome
            </Label>
            <TextInput
              id="nome"
              placeholder="Informe o nome do paciente"
              {...register("nome")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.nome && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.nome.message}
              </span>
            )}
          </div>

          {/* Campo Email */}
          <div className="mb-4">
            <Label htmlFor="email" className="dark:text-white">
              E-mail
            </Label>
            <TextInput
              id="email"
              type="email"
              placeholder="Informe o email do paciente"
              {...register("email")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.email && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Campo Data Nascimento */}
          <div className="mb-4">
            <Label htmlFor="dtnasc" className="dark:text-white">
              Data de Nascimento
            </Label>
            <TextInput
              id="dtnasc"
              type="date"
              placeholder="Informe a data de nascimento do paciente"
              {...register("datanascimento")}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.datanascimento && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.datanascimento.message}
              </span>
            )}
          </div>

          {/* Campo OBS */}
          <div className="mb-4">
            <Label htmlFor="obs" className="dark:text-white">
              Observação
            </Label>
            <Textarea
              id="obs"
              placeholder="Informe as observações do paciente"
              {...register("obs")}
              rows={6}
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            />
            {errors.obs && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {errors.obs.message}
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
