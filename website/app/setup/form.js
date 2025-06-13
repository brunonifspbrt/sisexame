"use client"; // Marca o arquivo para ser executado no lado do cliente
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { HiCheck, HiBackspace } from "react-icons/hi";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Spinner, Label, TextInput, Card } from "flowbite-react";
import { setupSchema } from "./schema";
import { toast } from "react-toastify";
import { VerificarStatus, Inserir } from "./api";

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

export default function Formulario() {
  const [busy, setBusy] = useState(true);
  const [exibicao, setExibicao] = useState(false);
  const [busyBt, setBusyBt] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      atraso: 10,
    },
    resolver: yupResolver(setupSchema),
  });

  const onSubmit = async (data) => {
    setBusyBt((busy) => true);

    // console.log(data);
    // cria senha com salt
    const senhaHash = createSHA256Hash(data.senha + senhaSalt);
    // console.log(senhaHash);
    // adiciona senha hasheada
    data.senha = senhaHash;
    const dados = {
      nome: data.nome,
      email: data.email,
      senha: senhaHash,
      atraso: data.atraso,
    };
    // console.log(data);
    // const resultado = await Inserir(data);
    const resultado = await Inserir(dados);

    if (resultado.success) {
      // console.log(resultado.message);
      if (resultado.message !== "") toast.success(resultado.message);
      // Espera um pouco antes de redirecionar, para garantir que o toast seja exibido
      setTimeout(() => {
        router.push("/"); // Navega para a página inicial
      }, 1500); // 1 segundo e meio
    } else {
      setBusyBt((busy) => false);
      if (resultado.message !== "") toast.error(resultado.message);
    }

    // setBusyBt((busy) => false);
  };

  const handleClick = async () => {
    router.push("/"); // página inicial
  };

  const buscarRegistro = async () => {
    setBusy((p) => true);
    setExibicao((p) => false);

    let resultado = null;
    try {
      resultado = await VerificarStatus();
      // console.log(resultado.data);
      // define qual modal irá exibir
      if (resultado.success) {
        // caso seja true o retorno então NÃO exibe formulário para cadastro
        if (resultado.data?.status) {
          setExibicao((p) => false);
        } else {
          // exibe tela de cadastro inicial caso status = false
          setExibicao((p) => true);
        }
      } else {
        if (resultado.message !== "")
          toast.error("Inicialização: " + resultado.message);
      }
    } catch {
      toast.error("Inicialização: não encontrado dados! Informe ao TI");
    }
    setBusy((p) => false);
  };

  useEffect(() => {
    // ao carregar tela verifica se é necessário configurar sistema com dados:
    // 1- usuário administrador
    // 2- tempo máximo de atraso para paciente comparecer ao exame
    buscarRegistro();
  }, []);

  return (
    <div className="min-h-screen bg-gray-400 flex items-center justify-center p-4">
      {busy ? (
        <Spinner size="xl" aria-label="Spinner Carregando" light />
      ) : (
        <>
          {!exibicao && (
            <div className="w-full h-screen flex items-center justify-center">
              <Card className="w-full max-w-4xl flex items-center justify-center text-center">
                <h2 className="mb-3 text-2xl font-semibold dark:text-white">
                  Acesso NÃO permitido
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
            <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md overflow-auto max-h-[calc(100vh-260px)]">
              <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">
                Cadastramento Inicial
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nome */}
                <div>
                  <Label
                    htmlFor="nome"
                    className="dark:text-white text-lg font-medium"
                  >
                    Nome
                  </Label>
                  <TextInput
                    id="nome"
                    type="nome"
                    placeholder="Digite seu nome"
                    {...register("nome")}
                    className="w-full py-3 text-lg dark:text-white dark:font-semibold"
                  />
                  {errors.nome && (
                    <p className="text-sm font-semibold text-red-500 dark:text-red-400">
                      {errors.nome.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className="dark:text-white text-lg font-medium"
                  >
                    Email
                  </Label>
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    {...register("email")}
                    className="w-full py-3 text-lg dark:text-white dark:font-semibold"
                  />
                  {errors.email && (
                    <p className="text-sm font-semibold text-red-500 dark:text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Senha */}
                <div>
                  <Label
                    htmlFor="senha"
                    className="dark:text-white text-lg font-medium"
                  >
                    Senha
                  </Label>
                  <TextInput
                    id="senha"
                    type="password"
                    placeholder="Digite sua senha"
                    {...register("senha")}
                    className="w-full py-3 text-lg dark:text-white dark:font-semibold"
                  />
                  {errors.senha && (
                    <p className="text-sm font-semibold text-red-500 dark:text-red-400">
                      {errors.senha.message}
                    </p>
                  )}
                </div>

                {/* Atraso Máximo */}
                <div>
                  <Label
                    htmlFor="atraso"
                    className="dark:text-white text-lg font-medium"
                  >
                    Atraso Máx. Paciente (minutos)
                  </Label>
                  <TextInput
                    id="atraso"
                    type="number"
                    placeholder="Informe atraso em minutos"
                    {...register("atraso")}
                    className="w-full py-3 text-lg dark:text-white dark:font-semibold"
                  />
                  {errors.atraso && (
                    <p className="text-sm font-semibold text-red-500 dark:text-red-400">
                      {errors.atraso.message}
                    </p>
                  )}
                </div>

                {/* Botões */}
                <div className="flex justify-between items-center">
                  <Button
                    type="submit"
                    className="w-full mt-6 py-3 text-xl dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
                    color="green"
                    disabled={busyBt}
                  >
                    {busyBt ? (
                      <Spinner
                        size="sm"
                        aria-label="Spinner Carregando"
                        className="mr-3"
                      />
                    ) : (
                      <HiCheck className="mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
