"use client"; // Marca o arquivo para ser executado no lado do cliente
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { HiCheck, HiOutlineX, HiBackspace } from "react-icons/hi";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Card,
  Button,
  Spinner,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  TextInput,
} from "flowbite-react";
import { mailSchema } from "./schema";
import { BuscarUsuario, Atualizar } from "./api";
import { toast } from "react-toastify";

export default function Formulario({ UsuarioId }) {
  const [modalAtivo, setModalAtivo] = useState(false);
  const [exibicao, setExibicao] = useState(false);
  const [busy, setBusy] = useState(true);
  const [busyBt, setBusyBt] = useState(false);
  const [dados, setDados] = useState({
    nome: null,
    oldEmail: null,
    newEmail: null,
  });

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      codVer: "",
    },
    resolver: yupResolver(mailSchema),
  });

  const onSubmit = async (data) => {
    setBusyBt((busy) => true);

    // adiciona ID do Usuário
    // data.id = UsuarioId;
    // console.log(data);
    const dados = {
      id: UsuarioId,
      codVer: data.codVer,
    };
    // const resultado = await Atualizar(data);
    const resultado = await Atualizar(dados);

    if (resultado.success) {
      if (resultado.message !== "") toast.success(resultado.message);
      setTimeout(() => {
        closeModal();
        router.push("/"); // Navega para a página inicial
      }, 1500); // 1 segundo e meio
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
      setBusyBt((busy) => false);
    }
  };

  const handleClick = async () => {
    router.push("/"); // página inicial
  };

  const closeModal = () => {
    reset({
      codVer: "",
    });
    setDados({
      nome: null,
      oldEmail: null,
      newEmail: null,
    });
    // setBusyBt((p) => false);
    // setModalAtivo(false);
    // setExibicao((p) => false);
  };

  const buscarRegistro = async () => {
    setBusy((p) => true);
    setExibicao((p) => false);
    setDados({
      nome: null,
      oldEmail: null,
      newEmail: null,
    });
    let resultado = null;
    // console.log(UsuarioId);
    try {
      resultado = await BuscarUsuario(UsuarioId);
      // console.log(resultado.data);
      // define qual modal irá exibir
      if (resultado.success) {
        if (resultado.data.length !== 0) {
          // console.log("É Edição");
          reset({
            codVer: "",
          });
          setDados({
            nome: resultado.data[0].nome,
            oldEmail: resultado.data[0].email,
            newEmail: resultado.data[0].emailTemp,
          });
          setModalAtivo(true);
          setExibicao((p) => true);
          //      if (resultado.message !== "") toast.success(resultado.message);
        } else {
          setExibicao(false);
        }
      } else {
        if (resultado.message !== "")
          toast.error("Usuário: " + resultado.message);
        setExibicao(false);
      }
    } catch {
      toast.error("Usuário: não encontrado usuário! Solicite novo link");
    }
    setBusy((p) => false);
  };

  useEffect(() => {
    buscarRegistro();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-400 flex flex-col items-center justify-center p-4 overflow-auto">
      {busy ? (
        <Spinner size="xl" aria-label="Spinner Carregando" light />
      ) : (
        <>
          {!exibicao && (
            <div className="w-full h-screen flex items-center justify-center">
              <Card className="w-full max-w-4xl flex items-center justify-center text-center">
                <h2 className="mb-3 text-2xl font-semibold dark:text-white">
                  Usuário não identificado
                  <Button
                    className="w-full max-w-xs h-12 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white mt-4"
                    color="blue"
                    onClick={handleClick}
                  >
                    <HiBackspace className="mr-1 h-5 w-5" />
                    Voltar para Página inicial
                  </Button>
                </h2>
              </Card>
            </div>
          )}

          {exibicao && (
            <Modal
              show={modalAtivo}
              onClose={closeModal}
              className="dark:text-white"
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader className="dark:text-white">
                  Alteração de Senha
                </ModalHeader>
                <ModalBody className="overflow-auto max-h-[calc(100vh-260px)]">
                  {/* Nome do Usuário */}
                  <div className="mb-4">
                    <Label htmlFor="valUsuario" className="dark:text-white">
                      Usuário:
                    </Label>
                    <p
                      id="valUsuario"
                      className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
                    >
                      {dados.nome}
                    </p>
                  </div>

                  {/* Email Antigo */}
                  <div className="mb-4">
                    <Label htmlFor="valEmailOld" className="dark:text-white">
                      Email Atual:
                    </Label>
                    <p
                      id="valEmailOld"
                      className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
                    >
                      {dados.oldEmail}
                    </p>
                  </div>

                  {/* Email Novo */}
                  <div className="mb-4">
                    <Label htmlFor="valEmailNew" className="dark:text-white">
                      Email Novo:
                    </Label>
                    <p
                      id="valEmailNew"
                      className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
                    >
                      {dados.newEmail}
                    </p>
                  </div>

                  {/* Campo Código de Verificação */}
                  <div className="mb-4">
                    <Label htmlFor="verificacao" className="dark:text-white">
                      Código de Verificação:
                    </Label>
                    <TextInput
                      id="verificacao"
                      placeholder="Informe o código de verificação"
                      {...register("codVer")}
                      className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300 "
                    />
                    {errors.codVer && (
                      <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                        {errors.codVer.message}
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
                    disabled={busyBt}
                  >
                    {busyBt ? (
                      <Spinner
                        size="sm"
                        aria-label="Spinner Salvar"
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
                    onClick={closeModal}
                    disabled={busyBt}
                  >
                    <HiOutlineX className="mr-1 h-5 w-5" />
                    Cancelar
                  </Button>
                </ModalFooter>
              </form>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
