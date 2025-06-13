"use client";

import { ParametroContext } from "./context";
import NovoParametro from "./novo";
import { useEffect, useState } from "react";
import { Listar } from "./api";
import { Button, Spinner } from "flowbite-react";
import Edicao from "./edicao";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Home = () => {
  const [dados, setDados] = useState(null);
  const [busy, setBusy] = useState(false);
  const [operacao, setOperacao] = useState({
    id: null,
    acao: null,
  });

  const router = useRouter(); // useRouter funciona como link e permite informar a rota desejada

  let modal = null; // controla se exibirá modal para inserção ou edição

  const buscarRegistro = async () => {
    //console.log("Lista deve ser atualizada");
    setBusy((p) => true);

    let resultado = null;
    // const resultado = await Listar();
    try {
      resultado = await Listar();
      // console.log(resultado.data);
      // define qual modal irá exibir
      if (resultado.success) {
        if (resultado.data.length !== 0) {
          // console.log("É Edição");
          setOperacao({
            id: resultado.data[0].id,
            acao: "edicao",
          });

          //      if (resultado.message !== "") toast.success(resultado.message);
        } else {
          // console.log("É Inserção");
          setOperacao({
            id: null,
            acao: "insercao",
          });
        }
      } else {
        if (resultado.message !== "")
          toast.error("Parâmetro: " + resultado.message);
      }
    } catch {
      toast.error("Parâmetro: unknown error (1)");
    }

    // console.log(resultado.data);
    // console.log(resultado.data[0].id);
    // console.log("Modal Abaixo");
    setBusy((p) => false);
  };

  const fecharModal = () => {
    setOperacao({ id: null, acao: null });
    router.push("/"); // vai para página raiz do sistema
  };

  // useEffect(() => {
  //   if (operacao.action === "edicao") {
  //     modal = <Edicao id={operacao.id} />;
  //   } else if (operacao.action === "insercao") {
  //     modal = <NovoParametro />;
  //   }
  // }, [operacao]);

  useEffect(() => {
    buscarRegistro();
  }, []);

  return (
    <>
      <p className="text-2xl mb-3 text-gray-800 dark:text-white">
        Parâmetros do Sistema
      </p>
      {busy && (
        <div className="text-center">
          <Spinner color="info" className="mt-4 h-10 w-10" />
        </div>
      )}
      <ParametroContext.Provider value={{ fechaTela: fecharModal }}>
        {operacao.acao === "insercao" && <NovoParametro />}
        {operacao.acao === "edicao" && <Edicao id={operacao.id} />}
      </ParametroContext.Provider>
    </>
  );
};

export default Home;
