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
import { passwordSchema } from "./schema";
import { BuscarUsuario, Atualizar } from "./api";
import { toast } from "react-toastify";

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

export default function Formulario({ UsuarioId }) {
  const [modalAtivo, setModalAtivo] = useState(false);
  const [exibicao, setExibicao] = useState(false);
  const [busy, setBusy] = useState(true);
  const [busyBt, setBusyBt] = useState(false);
  const [nome, setNome] = useState("");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      codVer: "",
      senhaNova: "",
      senhaConfirma: "",
    },
    resolver: yupResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    setBusyBt((busy) => true);

    // adiciona ID do Usuário
    // data.id = UsuarioId;
    // console.log(data);

    // antes de enviar a senha é feito hash
    // cria senha com salt
    const senhaHash = createSHA256Hash(data.senhaNova + senhaSalt);
    // console.log(senhaHash);

    // informa senha com hash
    // data.senhaNova = senhaHash;
    // data.senhaConfirma = senhaHash;
    // console.log(data);

    const dados = {
      id: UsuarioId,
      codVer: data.codVer,
      senhaNova: senhaHash,
      senhaConfirma: senhaHash,
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
      senhaNova: "",
      senhaConfirma: "",
    });
    setNome("");
    // setBusyBt((p) => false);
    // router.push("/"); // página inicial
    // setModalAtivo(false);
    // setExibicao((p) => false);
  };

  const buscarRegistro = async () => {
    setBusy((p) => true);
    setExibicao((p) => false);
    setNome("");
    let resultado = null;
    try {
      resultado = await BuscarUsuario(UsuarioId);
      // console.log(resultado.data);
      // define qual modal irá exibir
      if (resultado.success) {
        if (resultado.data.length !== 0) {
          // console.log("É Edição");
          reset({
            codVer: "",
            senhaNova: "",
            senhaConfirma: "",
          });
          setNome(resultado.data[0].nome);
          setModalAtivo(true);
          setExibicao((p) => true);
          //      if (resultado.message !== "") toast.success(resultado.message);
        } else {
          setNome("");
          setExibicao(false);
        }
      } else {
        if (resultado.message !== "")
          toast.error("Usuário: " + resultado.message);
        setNome("");
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
                      {nome}
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

                  {/* Campo Senha Nova */}
                  <div className="mb-4">
                    <Label htmlFor="Nova" className="dark:text-white">
                      Senha Nova:
                    </Label>
                    <TextInput
                      id="Nova"
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
                      Confirma Senha:
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
