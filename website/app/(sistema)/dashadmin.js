"use client";
import { FaUsers, FaClipboardList, FaStethoscope } from "react-icons/fa";
import { Card, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ListaDadosAdmin } from "./api";

const DashAdmin = () => {
  const [buscaRegistro, setBuscaRegistro] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dados, setDados] = useState({
    usuarioAtivo: null,
    usuarioInativo: null,
    exameAtivo: null,
    exameInativo: null,
    paciente: null,
  });

  const BuscarDados = async () => {
    setBusy((busy) => true);

    const resultado = await ListaDadosAdmin();
    if (resultado.success) {
      // caso tenha sucesso ele atualiza os dados
      setDados({
        usuarioAtivo: resultado.data.usuarioAtivo,
        usuarioInativo: resultado.data.usuarioInativo,
        exameAtivo: resultado.data.exameAtivo,
        exameInativo: resultado.data.exameInativo,
        paciente: resultado.data.paciente,
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
          {/* Card - Usuários Ativos */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaUsers className="text-3xl text-blue-500 dark:text-blue-300" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Usuários Ativos
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados.usuarioAtivo}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Card - Usuários Inativos */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaUsers className="text-3xl text-gray-500 dark:text-gray-400" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Usuários Inativos
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados.usuarioInativo}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Card - Exames Ativos */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaClipboardList className="text-3xl text-green-500 dark:text-green-400" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Exames Ativos
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados.exameAtivo}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Card - Exames Inativos */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaClipboardList className="text-3xl text-red-500 dark:text-red-400" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Exames Inativos
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados.exameInativo}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Card - Pacientes Cadastrados */}
          <div className="col-span-1">
            <Card className="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <FaStethoscope className="text-3xl text-purple-500 dark:text-purple-400" />
                <div>
                  <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Pacientes Cadastrados
                  </h5>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {dados.paciente}
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

export default DashAdmin;
