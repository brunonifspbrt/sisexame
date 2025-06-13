"use client";
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaClipboardCheck,
  FaPercentage,
  FaClipboardList,
} from "react-icons/fa";
import { Card, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ListaDadosSec } from "./api";

const DashSecretaria = ({
  currentDate,
  totalAppointments,
  completedAppointments,
  avgWaitTime,
  totalPatients,
}) => {
  const [buscaRegistro, setBuscaRegistro] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dados, setDados] = useState({
    dataAtual: null,
    qtdeAgendamento: null,
    qtdeAgendFin: null,
    qtdeExame: null,
    qtdePaciente: null,
    tempoMedio: null,
  });

  // Calculando a porcentagem de agendamentos realizados
  const percentageCompleted = (
    (completedAppointments / totalAppointments) *
    100
  ).toFixed(2);

  const formataDataBD = (valorData) => {
    const novaData = new Date(valorData);

    // Formata a data para o formato local (pt-BR) com hora e minuto
    const formatoLocal = novaData.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Substitui a vírgula por um espaço
    return formatoLocal.replace(",", "");
  };

  const formataNumero = (valNum, numCasa) => {
    const novoValor = valNum.toFixed(numCasa);

    return novoValor;
  };

  const BuscarDados = async () => {
    setBusy((busy) => true);

    const resultado = await ListaDadosSec();
    // console.log(resultado);
    if (resultado.success) {
      // console.log(resultado.data);
      //console.log(typeof resultado.data.percAgendFin);
      // caso tenha sucesso ele atualiza os dados
      setDados({
        dataAtual: formataDataBD(resultado.data.dataAtual),
        qtdeAgendamento: resultado.data.qtdeAgendamento,
        qtdeAgendFin: formataNumero(resultado.data.percAgendFin, 2),
        qtdeExame: resultado.data.qtdeExame,
        qtdePaciente: resultado.data.qtdePaciente,
        tempoMedio: resultado.data.tempoMedio,
      });
    } else {
      if (resultado.message !== "") toast.error(resultado.message);
    }

    setBusy((busy) => false);
  };

  useEffect(() => {
    if (buscaRegistro === null) setBuscaRegistro(true);

    if (buscaRegistro) {
      setBuscaRegistro(false);
      BuscarDados();
    }
  }, [buscaRegistro]);

  return (
    <div className="p-6 space-y-6">
      {busy ? (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" aria-label="Spinner Carregando" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card - Data Atual */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaCalendarAlt className="text-3xl text-blue-500 dark:text-blue-300" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Data Atual
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados.dataAtual}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Card - Total Agendamentos para o Dia */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaClipboardCheck className="text-3xl text-green-500 dark:text-green-400" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Total Agendamentos
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados.qtdeAgendamento}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Card - Porcentagem de Agendamentos Realizados */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaPercentage className="text-3xl text-orange-500 dark:text-orange-400" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Agendamentos Realizados (%)
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados.qtdeAgendFin}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Card - Tempo Médio de Espera */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaClock className="text-3xl text-purple-500 dark:text-purple-400" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Tempo Médio de Espera (minutos)
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados?.tempoMedio < 1 ? "< 1 " : `${dados?.tempoMedio}`}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Card - Total de Pacientes */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaUsers className="text-3xl text-teal-500 dark:text-teal-400" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Total de Pacientes
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados.qtdePaciente}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Card - Exames */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaClipboardList className="text-3xl text-green-500 dark:text-green-400" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Total de Exames
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados.qtdeExame}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashSecretaria;
