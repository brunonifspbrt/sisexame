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
  Checkbox,
  FileInput,
} from "flowbite-react";
import { usuarioEditSchema } from "./schema";
import { UsuarioContext } from "./context";
import { toast } from "react-toastify";
import { Atualizar, BuscarFoto, BuscarRegistro } from "./api";
import { HiCheck, HiOutlineX, HiDocumentRemove } from "react-icons/hi";
import Image from "next/image"; // componente Image do Next.js

export default function Edicao({ id }) {
  const [modalAtivo, setModalAtivo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [buscaRegistro, setBuscaRegistro] = useState(null);
  const [fotoUsuario, setFotoUsuario] = useState(null); //salva url temporaria para exibição da foto

  const [registro, setRegistro] = useState({
    id: null,
    email: null,
    tipo: null,
  });

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
      dtnasc: new Date()
        .toLocaleDateString("pt-BR")
        .split("/")
        .reverse()
        .join("-"), // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
      foto: null,
      ativo: true, // Valor padrão para o checkbox
    },
    resolver: yupResolver(usuarioEditSchema),
  });

  const contextoAtual = useContext(UsuarioContext);

  const onSubmit = async (data) => {
    setBusy((busy) => true);

    // repassa id, e-mail e tipo para objeto JSON
    // data.id = registro.id;
    // data.email = registro.email;
    // data.tipo = registro.tipo;

    const dados = {
      id: registro.id,
      email: registro.email,
      tipo: registro.tipo,
      nome: data.nome,
      dtnasc: data.dtnasc, // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
      foto: data.foto,
      ativo: data.ativo, // Valor padrão para o checkbox
    };

    // console.log(dados);

    // aplico FormData pra enviar dados + imagem
    const formDados = new FormData();
    // formDados.append("id", data.id);
    // formDados.append("email", data.email);
    // formDados.append("tipo", data.tipo);
    // formDados.append("nome", data.nome);
    // formDados.append("ativo", data.ativo);
    // formDados.append("dtnasc", data.dtnasc.toISOString());
    formDados.append("id", dados.id);
    formDados.append("email", dados.email);
    formDados.append("tipo", dados.tipo);
    formDados.append("nome", dados.nome);
    formDados.append("ativo", dados.ativo);
    formDados.append("dtnasc", dados.dtnasc.toISOString());
    // console.log(data.dtnasc.toISOString());
    // if (data.foto) {
    //   formDados.append("foto", data.foto[0]);
    // if (dados.foto) {
    //   formDados.append("foto", dados.foto[0]);
    // }

    // Verifico se a foto foi alterada ou não
    const fotoArq = dados.foto;

    // Se a foto for um objeto File (ou Blob) : ela vem da API, então só adiciona no FormData
    // Se a foto for arquivo (selecionei arquivo pelo FileInput): adiciono o arquivo;
    if (fotoArq) {
      if (fotoArq instanceof Blob) {
        // Verifica se o tipo é Blob (ou File)
        formDados.append("foto", fotoArq);
      } else if (fotoArq[0] instanceof File) {
        // Se for um File (como no caso de um upload novo)
        formDados.append("foto", fotoArq[0]);
      }
    }

    //    console.log(data);
    //// const resultado = await Atualizar(data);
    //// const resultado = await Atualizar(formDados, data.id);

    const resultado = await Atualizar(formDados, registro.id);

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
      dtnasc: new Date()
        .toLocaleDateString("pt-BR")
        .split("/")
        .reverse()
        .join("-"), // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
      foto: null,
      ativo: true, // Valor padrão para o checkbox
    });
    setRegistro({ id: null, email: null, tipo: null });
    setFotoUsuario(null);
    setModalAtivo(false);
    contextoAtual.fechaTela();
  };

  const BuscarDados = async () => {
    setBusy(true);

    const resultado = await BuscarRegistro(id);
    const resultadoFoto = await BuscarFoto(id);
    // console.log(typeof resultadoFoto);
    // console.log("URL");
    // const fotoUrl = URL.createObjectURL(resultadoFoto.data); // Cria a URL do blob no lado do cliente
    // console.log(fotoUrl);
    let dtNasc = null;

    if (resultado.success) {
      if (resultado.message !== "") toast.success(resultado.message);

      // guarda valores do registro atual para uso futuro
      setRegistro({
        id: id,
        email: resultado.data.email,
        tipo: resultado.data.tipo,
      });

      // dataNascimento vem nesse formato: '1970-02-08T03:00:00' (JSON da api)
      // porém no reacthookforms o campo date exige:YYYY-MM-DD (formato iso)
      // o split T separa a data quando houver o texto YYYY-MM-DDTHH:mm:ss.sssZ,
      //o [0] pega a data no formato YYYY-MM-DD
      dtNasc = resultado.data.dtNasc.split("T")[0];

      // Agora, setamos a foto
      if (resultadoFoto.success) {
        // Caso chamada da api tenha dado certo
        // cria url temporária pra exibir foto com o conteúdo binário da foto blob
        setFotoUsuario(URL.createObjectURL(resultadoFoto.data)); // atualiza foto do usuário
        // console.log(URL.createObjectURL(resultadoFoto.data));
        //Atualiza valor do FileInput com a foto (blob)
        setValue("foto", resultadoFoto.data);
      } else {
        setValue("foto", null); // Se não encontrar foto, setamos como null
        setFotoUsuario(null);
      }

      reset({
        nome: resultado.data.nome,
        dtnasc: dtNasc, // Formato de data ajustado
        foto: resultadoFoto.data || null, // Foto
        ativo: resultado.data.ativo, // Valor padrão para o checkbox
      });

      // console.log(resultado.data);
      // console.log(dtNasc);
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

  // função do FileInput
  const onFileChange = (e) => {
    // console.log("Executou");
    const fArquivo = e.target.files[0]; // pega primeira posição do arquivo
    if (fArquivo) {
      // Verifica o tamanho do arquivo (em bytes)
      // 204800 = 200 kb ou 409.600 400kb
      if (fArquivo.size > 409600) {
        toast.error("A foto não pode ultrapassar o tamanho de 400KB.");
        setValue("foto", null); // atualiza, pelo React HookForm, só o campo onde está a foto
        setFotoUsuario(null); // limpra url da foto
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
    <Modal show={modalAtivo} onClose={closeModal}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Usuário - Altera Registro</ModalHeader>
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
            <p
              id="email"
              className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
            >
              {registro?.email}
            </p>
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
                    src={fotoUsuario} // URL temporária gerada para a imagem
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
  );
}
