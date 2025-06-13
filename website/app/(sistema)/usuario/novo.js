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
  Checkbox,
  FileInput,
} from "flowbite-react";

import {
  HiPlusCircle,
  HiCheck,
  HiOutlineX,
  HiDocumentRemove,
} from "react-icons/hi";
import { usuarioSchema } from "./schema";
import { UsuarioContext } from "./context";
import { Inserir } from "./api";
import { toast } from "react-toastify";
import Image from "next/image"; // componente Image do Next.js

export default function NovoUsuario() {
  const [modalAtivo, setModalAtivo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fotoUsuario, setFotoUsuario] = useState(null);

  const contextoAtual = useContext(UsuarioContext);

  const {
    register,
    handleSubmit,
    reset,
    setValue, // Pegando a função setValue para atualizar os campos do formulário em separado
    getValues, // pega todos os valores do formulário
    formState: { errors },
  } = useForm({
    defaultValues: {
      nome: "",
      email: "",
      dtnasc: new Date()
        .toLocaleDateString("pt-BR")
        .split("/")
        .reverse()
        .join("-"), // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
      foto: null,
      ativo: true, // Valor padrão para o checkbox
    },
    resolver: yupResolver(usuarioSchema),
  });

  const onSubmit = async (data) => {
    setBusy((p) => true);
    // usuário sempre será do tipo Secretaria (só há 1 administrador)
    // data.tipo = 1;
    const dados = {
      tipo: 1, // 1 secretaria
      nome: data.nome,
      email: data.email,
      dtnasc: data.dtnasc, // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
      foto: data.foto,
      ativo: data.ativo, // Valor padrão para o checkbox
    };
    // adiciona o caminho do site
    // data.urlsite = window.location.origin;
    // pego url atual
    // console.log("URL");
    // console.log(window.location.origin);
    // console.log(data);

    // aplico FormData pra enviar dados + imagem
    const formDados = new FormData();

    // for (const [key, value] of Object.entries(data)) {
    for (const [key, value] of Object.entries(dados)) {
      // FileInput é array
      // if (Array.isArray(value)) {
      //   // Se for um campo de arquivo (ex: FileInput), adiciona o primeiro arquivo
      //   formDados.append(key, value[0]);
      if (key === "foto" && value) {
        // Verifique se a foto está presente e se é um arquivo
        if (value[0]) {
          formDados.append("foto", value[0]); // Anexa o arquivo
        }
      } else {
        // se for campo data "força data de maneira legível"
        if (key === "dtnasc") {
          // Converte a data para o formato ISO 8601
          formDados.append(key, value.toISOString());
        } else {
          // Se não for arquivo, apenas adicione o valor
          formDados.append(key, value);
        }
      }
    }

    // Iterando sobre os campos e exibindo no console
    // for (let [key, value] of formDados.entries()) {
    //   console.log(`${key}:`, value);
    // }

    // const resultado = await Inserir(data);
    const resultado = await Inserir(formDados);
    // // console.log(resultado);
    if (resultado.success) {
      closeModal();
      contextoAtual.atualizarDados(true);

      if (resultado.message !== "") toast.success(resultado.message);
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((p) => false);
  };

  const closeModal = () => {
    reset({
      nome: "",
      email: "",
      dtnasc: new Date()
        .toLocaleDateString("pt-BR")
        .split("/")
        .reverse()
        .join("-"), // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
      foto: null,
      ativo: true, // Valor padrão para o checkbox
    });
    setFotoUsuario(null);
    setModalAtivo(false);
  };

  // função do FileInput
  const onFileChange = (e) => {
    const fArquivo = e.target.files[0]; // pega primeira posição do arquivo
    if (fArquivo) {
      // Verifica o tamanho do arquivo (em bytes)
      // 204800 = 200 kb ou 409.600 400kb
      if (fArquivo.size > 409600) {
        toast.error("A foto não pode ultrapassar o tamanho de 400KB.");
        setValue("foto", null); // atualiza, pelo React HookForm, só o campo onde está a foto
        return;
      }

      // Gera URL temporária para exibição da imagem
      const urlFoto = URL.createObjectURL(fArquivo);
      setFotoUsuario(urlFoto); // Atualiza o estado com a URL da imagem
      // console.log(fArquivo);
    }
  };

  const onRemoveFoto = () => {
    setValue("foto", null); // atualiza, pelo React HookForm, só o campo onde está a foto
    setFotoUsuario(null);
  };

  return (
    <>
      <Button
        className="mt-3"
        size="lg"
        onClick={() => {
          setModalAtivo(true);
        }}
      >
        {/* className = h-5 w-5 or size={10} */}
        <HiPlusCircle className="mr-1 h-7 w-7" />
        <span>Novo Usuário</span>
      </Button>

      <Modal show={modalAtivo} onClose={closeModal}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Usuário - Novo Registro</ModalHeader>
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
                placeholder="Informe o nome do usuário"
                {...register("nome")}
                className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
              />
              {errors.nome && (
                <span className="text-sm font-semibold  text-red-500 dark:text-red-400">
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
                placeholder="Informe o email do usuário"
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
                placeholder="Informe a data de nascimento do usuário"
                {...register("dtnasc")}
                className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
              />
              {errors.dtnasc && (
                <span className="text-sm font-semibold  text-red-500 dark:text-red-400">
                  {errors.dtnasc.message}
                </span>
              )}
            </div>

            {/* Campo Ativo (Checkbox) */}
            <div className="mb-4">
              <Label htmlFor="ativo" className="dark:text-white">
                Status do Usuário
              </Label>
              <div className="flex items-center space-x-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300">
                <Checkbox id="ativo" {...register("ativo")} />
                <span className="font-semibold">Usuário Ativo</span>
              </div>
              {errors.ativo && (
                <span className="text-sm text-red-500 dark:text-red-400">
                  {errors.ativo.message}
                </span>
              )}
            </div>

            {/* Campo Foto */}
            <div className="mb-4">
              <Label className="dark:text-white" htmlFor="foto">
                Foto:
              </Label>
              {/* Adicionando a função para ao mudar input da foto */}
              {busy ? null : (
                <FileInput
                  id="foto"
                  {...register("foto")}
                  onChange={onFileChange}
                />
              )}

              {errors.foto && (
                <span className="text-sm font-semibold  text-red-500 dark:text-red-400">
                  {errors.foto.message}
                </span>
              )}

              {/* Exibindo a imagem selecionada (se existir) */}
              {fotoUsuario && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium  dark:text-white">
                    Pré-visualização:
                  </h3>

                  <div className="flex items-center justify-start">
                    <Image
                      src={fotoUsuario}
                      alt="Foto selecionada para o usuário"
                      width={100}
                      height={100}
                      className="mt-2 object-cover"
                    />

                    <Button
                      className="w-40 ml-5 dark:bg-purple-700 dark:hover:bg-purple-800 dark:text-white"
                      size="sm"
                      color="purple"
                      onClick={onRemoveFoto}
                    >
                      <HiDocumentRemove className="mr-1 h-5 w-5" />
                      Limpar foto
                    </Button>
                  </div>

                  {/* <div className="relative max-w-[150px] max-h-[150px] w-full h-auto mx-auto"></div> */}
                </div>
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
