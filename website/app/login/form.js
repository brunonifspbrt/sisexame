"use client"; // Marca o arquivo para ser executado no lado do cliente
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiCheck } from "react-icons/hi";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Spinner, Label, TextInput } from "flowbite-react";
import { loginSchema } from "./schema";
import { toast } from "react-toastify";
import { Autenticar } from "./api";
import { login } from "./actions";

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
  const [busy, setBusy] = useState(false);
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
      email: "",
      senha: "",
    },
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setBusyBt((busy) => true);

    // console.log(data);
    // cria senha com salt
    const senhaHash = createSHA256Hash(data.senha + senhaSalt);
    // console.log(senhaHash);
    // adiciona senha hasheada
    // data.senha = senhaHash;
    // console.log(data);
    // const resultado = await Autenticar(data);
    const dados = {
      email: data.email,
      senha: senhaHash,
    };
    // const resultado = await login(data);
    const resultado = await login(dados);

    // se há conteudo no resultado então é erro
    if (resultado && resultado !== "") {
      toast.error(resultado);
      setBusyBt((busy) => false);
    } else {
      toast.success("Conectado com sucesso");
      // Espera um pouco antes de redirecionar, para garantir que o toast seja exibido
      setTimeout(() => {
        router.push("/"); // Navega para a página inicial
      }, 700); // 0,7 segundos
    }

    // if (resultado && resultado !== "") {
    //// if (resultado.success) {
    // console.log(resultado.data);
    // if (resultado.message !== "") toast.success(resultado.message);
    //   if (resultado.message !== "") toast.success("Conectado com sucesso");
    //   // Espera um pouco antes de redirecionar, para garantir que o toast seja exibido
    //   setTimeout(() => {
    //     router.push("/"); // Navega para a página inicial
    //   }, 700); // 0,7 segundos
    // } else {
    //   if (resultado.message !== "") toast.error(resultado.message);
    // }

    // setBusyBt((busy) => false);
  };

  const handleClick = async () => {
    router.push("/"); // página inicial
  };

  return (
    <div className="min-h-screen bg-gray-400 flex items-center justify-center p-4">
      {busy ? (
        <Spinner size="xl" aria-label="Spinner Carregando" light />
      ) : (
        <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">
            Acesso ao Sistema
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                Entrar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
