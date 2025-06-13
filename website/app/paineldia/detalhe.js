"use client";
import {
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineInformationCircle,
  HiOutlineDocumentReport,
  HiBadgeCheck,
} from "react-icons/hi";
import {
  Card,
  Table,
  TableHead,
  TableHeadCell,
  TableRow,
  TableCell,
  TableBody,
} from "flowbite-react";

const PainelDetalhe = ({ exame }) => {
  const formataDataBD = (valorData) => {
    const novaData = new Date(valorData);

    // Formata a data para o formato local (pt-BR) com hora e minuto
    const formatoLocal = novaData.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Para hora em formato 24h
    });

    // Substitui a vírgula por um espaço
    return formatoLocal.replace(",", "");
  };

  const formataTempoMedio = (valTempo) => {
    // if (valTempo > 1) {
    //   return valTempo.toFixed(2); // Formata com 2 casas decimais
    // }
    return valTempo; // Retorna o valor original se for <= 1
  };

  return (
    <>
      {/* Header com informações fora do card */}
      <div className="mt-6 header-container mb-12">
        <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white flex items-center justify-center gap-2">
          <HiOutlineDocumentReport className="text-xl" />
          {exame.exameNome}
        </h2>
        <div className="mt-4 flex justify-center space-x-16">
          <div className="text-center">
            <div className="text-2xl text-gray-800 dark:text-gray-300 flex items-center justify-center gap-2">
              <HiOutlineClock className="text-lg" />
              Tempo Padrão Atendimento:
            </div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {exame.exameTempoPadrao} minutos
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-gray-800 dark:text-gray-300 flex items-center justify-center gap-2">
              <HiOutlineClock className="text-lg" />
              Tempo Médio Atend. (Aprox):
            </div>
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              {exame?.exameTempoMedio < 1
                ? "< 1 minuto"
                : `${formataTempoMedio(exame?.exameTempoMedio)} minutos`}
            </div>
          </div>
        </div>
      </div>

      {!exame?.pacientesChamDados?.length > 0 ? null : (
        <div className="mt-4 bg-teal-600 text-white p-4 rounded-lg text-3xl font-bold text-center">
          {exame.pacientesChamDados.map((paciente, index) => (
            <span key={index}>
              {paciente.pfNome.slice(0, 30)}
              <span> (Confirmar Dados) </span>
            </span>
          ))}
        </div>
      )}

      {!exame?.pacientesChamados?.length > 0 ? null : (
        <div className="mt-4 bg-yellow-600 text-white p-4 rounded-lg text-4xl font-bold text-center">
          {exame.pacientesChamados.map((paciente, index) => (
            <span key={index}>{paciente.pfNome.slice(0, 30)}</span>
          ))}
        </div>
      )}

      {/* Card com tabelas dos pacientes */}
      <Card className="dark:bg-gray-800 dark:text-white mb-8">
        {/* Pacientes na Fila */}
        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-gray-200 flex items-center justify-center gap-2">
            <HiOutlineUser className="text-xl" />
            Pacientes na Fila
          </h3>
          <Table className="dark:bg-gray-800 dark:text-white">
            <TableHead>
              <TableRow>
                <TableHeadCell className="text-center text-xl text-blue-600 dark:text-blue-400">
                  Nome
                </TableHeadCell>
                <TableHeadCell className="text-center text-xl text-blue-600 dark:text-blue-400">
                  Hora de Agendamento
                </TableHeadCell>
                <TableHeadCell className="text-center text-xl text-blue-600 dark:text-blue-400">
                  Estimado
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exame.pacientesNaFila.map((paciente, index) => {
                const dtFila = formataDataBD(paciente?.pfHoraAgenda);

                return (
                  <TableRow
                    key={index}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <TableCell className="text-center text-2xl text-gray-800 dark:text-gray-200">
                      {paciente.pfNome.slice(0, 30)}
                    </TableCell>
                    <TableCell className="text-center text-2xl text-gray-800 dark:text-gray-200">
                      {dtFila}
                    </TableCell>
                    <TableCell className="text-center font-bold text-2xl text-yellow-800 dark:text-yellow-400">
                      <HiOutlineInformationCircle className="inline-block mr-2 text-yellow-500" />
                      {paciente.pfTempoEst}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>

        {/* Pacientes Atendidos */}
        <section>
          <h3 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-gray-200 flex items-center justify-center gap-2">
            <HiBadgeCheck className="text-xl" />
            Pacientes Atendidos
          </h3>
          <Table className="dark:bg-gray-800 dark:text-white">
            <TableHead>
              <TableRow>
                <TableHeadCell className="text-center text-xl text-blue-600 dark:text-blue-400">
                  Nome
                </TableHeadCell>
                <TableHeadCell className="text-center text-xl text-blue-600 dark:text-blue-400">
                  Hora de Agendamento
                </TableHeadCell>
                <TableHeadCell className="text-center text-xl text-blue-600 dark:text-blue-400">
                  Horário Inicial
                </TableHeadCell>
                <TableHeadCell className="text-center text-xl text-blue-600 dark:text-blue-400">
                  Horário Final
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exame.pacientesAtendidos.map((paciente, index) => {
                const dtAtend = formataDataBD(paciente?.paHoraAgenda);
                const dtIni = formataDataBD(paciente?.paHoraIni);
                const dtFim = formataDataBD(paciente?.paHoraFim);
                return (
                  <TableRow
                    key={index}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <TableCell className="text-center text-2xl text-gray-800 dark:text-gray-200">
                      {paciente.paNome.slice(0, 30)}
                    </TableCell>
                    <TableCell className="text-center text-2xl text-gray-800 dark:text-gray-200">
                      {dtAtend}
                    </TableCell>
                    <TableCell className="text-center text-2xl text-gray-800 dark:text-gray-200">
                      {dtIni}
                    </TableCell>
                    <TableCell className="text-center text-2xl text-gray-800 dark:text-gray-200">
                      {dtFim}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      </Card>
    </>
  );
};

export default PainelDetalhe;
