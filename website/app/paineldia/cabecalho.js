import { Navbar, NavbarBrand } from "flowbite-react";
import { HiOutlineCalendar } from "react-icons/hi"; // Ícone para a data

const PainelCabecalho = ({ dtAgendamento }) => {
  // Função para formatar a data
  const formatarData = (data) => {
    if (!data) return "";

    // console.log(typeof data);

    try {
      const d = new Date(data);
      if (isNaN(d.getTime())) return "";

      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    } catch {
      return "";
    }
  };

  return (
    <Navbar className="bg-gray-800 dark:bg-gray-800 text-white h-[80px]">
      <NavbarBrand className="w-full flex justify-center">
        <h1 className="text-3xl font-bold text-center flex items-center gap-1">
          <HiOutlineCalendar className="text-2xl" />
          {/* Agendamentos - {formatarData(dtAgendamento)} */}
          Agendamentos - {formatarData(dtAgendamento)}
        </h1>
      </NavbarBrand>

      {/* Exibe a data se não for nula */}
      {/* {dtAgendamento && (
        <div className="w-full text-lg mt-2 text-center text-indigo-300">
          <HiOutlineCalendar className="inline-block mr-2 text-indigo-400" />
          {formatarData(dtAgendamento)}
        </div>
      )} */}
    </Navbar>
  );
};

export default PainelCabecalho;
