import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Select, Button, Label, TextInput } from "flowbite-react";
import { filtroSchema } from "./schema";
import { HiSearch, HiX } from "react-icons/hi";

const PainelFiltro = ({ dadosExames, atualizaExame, atualizaDtAgenda }) => {
  const [busy, setBusy] = useState(true); // ocupado ou não
  const [options, setOptions] = useState([]); // Armazena as opções do select

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      dtAgenda: new Date()
        .toLocaleDateString("pt-BR")
        .split("/")
        .reverse()
        .join("-"), // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
      exameId: "",
    },
    resolver: yupResolver(filtroSchema),
  });

  // console.log(dadosExames);

  // Função para enviar o formulário
  const submitForm = (data) => {
    // console.log(data.dtAgenda);
    atualizaDtAgenda(data.dtAgenda);
    atualizaExame(data.exameId);
    // onSubmit(data); // Passa o ID do exame selecionado para o componente pai
  };

  const onLimpaFiltro = () => {
    // limpo campo
    reset({
      dtAgenda: new Date()
        .toLocaleDateString("pt-BR")
        .split("/")
        .reverse()
        .join("-"), // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
      exameId: "",
    });
    atualizaExame(0);
  };

  // Função para preencher as opções do Select
  const PreencheItens = (dados) => {
    setBusy(true); // Inicia o carregamento
    let resultado = null;

    if (!dados) {
      setOptions(
        <option
          key={0}
          value=""
          disabled
          className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        >
          Carregando exames...
        </option>
      );
    }

    // cria opções do select
    resultado = [
      <option
        key={0}
        value=""
        className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
      >
        Selecione...
      </option>,
      ...dados.map((exame) => (
        <option
          key={exame.id}
          value={exame.id}
          className="dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
        >
          {exame.nome}
        </option>
      )),
    ];
    setBusy(false);
    setOptions(resultado);
    // limpo campo
    reset({
      dtAgenda: new Date()
        .toLocaleDateString("pt-BR")
        .split("/")
        .reverse()
        .join("-"), // pega data considerando região no brasil / divide a partir da "/", coloca no formato YYYY/MM/DD e troca "/" por "-"
      exameId: "",
    });
  };

  useEffect(() => {
    // if (dadosExames && dadosExames.length > 0) {
    PreencheItens(dadosExames); // Preenche os itens quando os dados estiverem disponíveis
  }, [dadosExames]); // Sempre que os dados na props mudarem, chamo a função PreencheItens

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <div className="mb-2 flex items-center space-x-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="filtroData" className="text-white  dark:text-white">
            Data:
          </Label>
          <TextInput
            id="filtroData"
            type="date"
            placeholder="Informe a data de agendamento"
            {...register("dtAgenda")}
            className="py-2 dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="exameId" className="text-white dark:text-white">
            Selecione um Exame:
          </Label>
          <Select
            id="exameId"
            {...register("exameId")}
            className="py-2 flex-grow dark:text-white dark:font-semibold dark:border-gray-600 border-gray-300"
          >
            {options}
          </Select>
        </div>
      </div>
      <div className="flex flex-col">
        {errors.dtAgenda && (
          <span className="text-sm font-semibold  text-red-500 dark:text-red-400">
            {errors.dtAgenda.message}
          </span>
        )}
        {errors.exameId && (
          <span className="text-sm font-semibold text-red-500 dark:text-red-400">
            {errors.exameId.message}
          </span>
        )}
      </div>

      <div className="flex justify-center space-x-6">
        <Button
          type="submit"
          size="lg"
          color="green"
          className="w-40 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white"
        >
          <HiSearch className="mr-1 h-5 w-5" />
          Filtrar Exame
        </Button>

        <Button
          size="lg"
          color="red"
          className="w-40 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white"
          onClick={onLimpaFiltro}
        >
          <HiX className="mr-1 h-5 w-5" />
          Limpar Filtro
        </Button>
      </div>
    </form>
  );
};

export default PainelFiltro;
