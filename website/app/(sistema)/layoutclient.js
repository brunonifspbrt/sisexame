"use client";
import {
  Avatar,
  Dropdown,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  Footer,
  FooterCopyright,
  FooterDivider,
} from "flowbite-react";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";
import BreadcrumbSite from "./breadcrumb";
import { useState, useEffect } from "react";
import UsuarioReqMail from "@/components/reqmail/page";
import UsuarioReqPwd from "@/components/reqpwd/page";
import { HiMail, HiOutlineKey, HiOutlinePencil } from "react-icons/hi";
import { logout } from "../login/actions";
import { LayoutContext } from "./context";
import UsuarioUpdPwd from "@/components/updpwd/page";

export default function LayoutClient({ children, usuario }) {
  // pega rota atual:
  const rotaAtual = usePathname();
  const [operacao, setOperacao] = useState({
    idUsuario: null,
    acao: null,
  });
  // Estado para armazenar a URL do Blob da foto
  const [fotoUrl, setFotoUrl] = useState(null);

  const limparOperacao = () => {
    setOperacao({ idUsuario: null, acao: null });
  };

  let modal = null; // controla se exibirá modal para edição ou exclusão

  if (operacao.acao === "email") {
    modal = (
      <UsuarioReqMail
        limpaTela={limparOperacao}
        usuarioID={operacao.idUsuario}
      />
    );
  } else if (operacao.acao === "senha") {
    modal = (
      <UsuarioReqPwd
        limpaTela={limparOperacao}
        usuarioID={operacao.idUsuario}
      />
    );
  } else if (operacao.acao === "senha2") {
    modal = (
      <UsuarioUpdPwd
        limpaTela={limparOperacao}
        usuarioID={operacao.idUsuario}
      />
    );
  }

  // define estilo dos links do NavBar ao inves de tag  active={rotaAtual === "/"}

  function dropdownEstilo(secao) {
    //console.log(rota);

    // itens na seção Cadastro
    const itensCad = ["/parametro", "/exame", "/paciente", "/usuario"];

    // itens na seção Agendamento
    const itensAgend = ["/agendamento"];

    // itens na seção Agendamento
    const itensAtend = ["/agendconf", "/atendimento", "/resumo"];

    let valor = "";
    let estilo = "";

    if (secao === "Cadastros") {
      // define estilo de seção
      estilo = itensCad.includes(rotaAtual)
        ? "text-amber-400 font-semibold"
        : "text-gray-300";
      // verifica se rota atual está em itens de cadastro para, com span, dar destaque do item da seção cujo item de menu foi selecionado
    }

    if (secao === "Agendamentos") {
      // define estilo de seção
      estilo = itensAgend.includes(rotaAtual)
        ? "text-amber-400 font-semibold"
        : "text-gray-300";
    }

    if (secao === "Atendimentos") {
      // define estilo de seção
      estilo = itensAtend.includes(rotaAtual)
        ? "text-amber-400 font-semibold"
        : "text-gray-300";
    }

    valor = <span className={estilo}>{secao}</span>;

    return valor;
  }

  function navlinkEstilo(rota) {
    // console.log(rota);
    // console.log(rotaAtual);

    const txtDark =
      "focus:bg-gray-0 hover:bg-gray-0 dark:focus:bg-gray-800  dark:hover:bg-gray-400 hover:text-primary-700 ";
    //<DropdownItem as={Link} href="/agendamento" className={`${navlinkEstilo("/agendamento")}  focus:bg-gray-0 hover:bg-gray-0 hover:text-primary-700`}></DropdownItem>

    let valor = `text-lg  ${
      rotaAtual === rota
        ? "text-amber-400 font-semibold dark:text-amber-400"
        : "text-gray-300 "
    }`;
    valor = `${valor} ${txtDark}`;
    return valor;
  }

  const handleSair = async () => {
    await logout();
  };

  useEffect(() => {
    // Verifico se usuario.foto não é nulo e é um Blob
    if (usuario.foto) {
      // console.log("tem foto");
      const url = URL.createObjectURL(usuario.foto);
      // console.log(url);
      setFotoUrl(url);

      // Limpo a URL quando o componente for desmontado ou a foto mudar
      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    }
  }, [usuario.foto]); // Atualizo sempre que usuario.foto muda

  return (
    <>
      <header>
        <Navbar fluid className="bg-gray-800 dark:bg-gray-900">
          <NavbarBrand as={Link} href="/">
            <span className="self-center whitespace-nowrap text-xl font-semibold text-amber-400">
              Sistema de Exames
            </span>
          </NavbarBrand>
          <div className="flex md:order-2">
            <Dropdown
              arrowIcon={false}
              inline
              label={<Avatar size="md" rounded img={fotoUrl} />}
            >
              <DropdownHeader>
                <span className="block text-base  text-gray-800 dark:text-gray-100">
                  {/* Usuário */}
                  {usuario.nome}
                </span>
                <span className="block truncate text-base font-medium text-gray-800 dark:text-gray-100">
                  {/* usuario@email.com */}
                  {usuario.email}
                </span>
              </DropdownHeader>
              <DropdownItem
                icon={HiMail}
                className="text-base text-gray-800 dark:text-gray-100"
                onClick={() => {
                  setOperacao({ idUsuario: usuario.id, acao: "email" });
                }}
              >
                Redefinir E-mail
              </DropdownItem>
              <DropdownItem
                icon={HiOutlineKey}
                className="text-base text-gray-800 dark:text-gray-100"
                onClick={() => {
                  setOperacao({ idUsuario: usuario.id, acao: "senha" });
                }}
              >
                Nova Senha
              </DropdownItem>
              <DropdownItem
                icon={HiOutlinePencil}
                className="text-base text-gray-800 dark:text-gray-100"
                onClick={() => {
                  setOperacao({ idUsuario: usuario.id, acao: "senha2" });
                }}
              >
                Alterar Senha
              </DropdownItem>
              <DropdownItem
                className="text-base text-gray-800 dark:text-gray-100"
                onClick={() => {
                  handleSair();
                }}
              >
                Sair do Sistema
              </DropdownItem>
            </Dropdown>
            <NavbarToggle />
          </div>
          <NavbarCollapse>
            <NavbarLink as={Link} href="/" className={navlinkEstilo("/")}>
              Página Inicial
            </NavbarLink>

            <div className="flex text-lg text-gray-300 dark:text-gray-400">
              <Dropdown
                label={dropdownEstilo("Cadastros")}
                inline
                className="bg-gray-800 dark:bg-gray-900"
              >
                {usuario.admin ? (
                  <DropdownItem
                    as={Link}
                    href="/parametro"
                    className={navlinkEstilo("/parametro")}
                  >
                    Parâmetros
                  </DropdownItem>
                ) : null}

                {/* <DropdownItem
                  as={Link}
                  href="/parametro"
                  className={navlinkEstilo("/parametro")}
                >
                  Parâmetros
                </DropdownItem> */}
                {usuario.admin ? (
                  <DropdownItem
                    as={Link}
                    href="/exame"
                    className={navlinkEstilo("/exame")}
                  >
                    Exames
                  </DropdownItem>
                ) : null}
                {/* <DropdownItem
                  as={Link}
                  href="/exame"
                  className={navlinkEstilo("/exame")}
                >
                  Exames
                </DropdownItem> */}
                <DropdownItem
                  as={Link}
                  href="/paciente"
                  className={navlinkEstilo("/paciente")}
                >
                  Pacientes
                </DropdownItem>
                {usuario.admin ? (
                  <DropdownItem
                    as={Link}
                    href="/usuario"
                    className={navlinkEstilo("/usuario")}
                  >
                    Usuários
                  </DropdownItem>
                ) : null}
                {/* <DropdownItem
                  as={Link}
                  href="/usuario"
                  className={navlinkEstilo("/usuario")}
                >
                  Usuários
                </DropdownItem> */}
              </Dropdown>
            </div>

            <div className="flex text-lg text-gray-300 dark:text-gray-400">
              <Dropdown
                label={dropdownEstilo("Agendamentos")}
                inline
                className="bg-gray-800 dark:bg-gray-900"
              >
                <DropdownItem
                  as={Link}
                  href="/agendamento"
                  className={navlinkEstilo("/agendamento")}
                >
                  Lançamentos
                </DropdownItem>
              </Dropdown>
            </div>
            <div className="flex text-lg text-gray-300 dark:text-gray-400">
              <Dropdown
                label={dropdownEstilo("Atendimentos")}
                inline
                className="bg-gray-800 dark:bg-gray-900"
              >
                <DropdownItem
                  as={Link}
                  href="/agendconf"
                  className={navlinkEstilo("/agendconf")}
                >
                  Confirmação de Dados
                </DropdownItem>

                <DropdownItem
                  as={Link}
                  href="/atendimento"
                  className={navlinkEstilo("/atendimento")}
                >
                  Chamada de Pacientes
                </DropdownItem>

                <DropdownItem
                  as={Link}
                  href="/resumo"
                  className={navlinkEstilo("/resumo")}
                >
                  Resumo de Atividades
                </DropdownItem>
              </Dropdown>
            </div>
          </NavbarCollapse>
        </Navbar>
      </header>
      <main className="flex flex-col min-h-screen">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          className="text-lg"
          theme="colored"
        />
        <div className="mx-4 my-2 flex-grow">
          <div className="my-5 flex-grow">
            <BreadcrumbSite />
          </div>

          <LayoutContext.Provider
            value={{
              usuarioID: usuario.id,
              usuarioNome: usuario.name,
              usuarioEmail: usuario.email,
              usuarioAdmin: usuario.admin,
              usuarioOperacao: usuario.operacao,
            }}
          >
            {modal}
            {children}
          </LayoutContext.Provider>
        </div>
        <Footer container className="mt-auto">
          <div className="w-full text-center">
            <FooterDivider />
            <FooterCopyright
              className="text-gray-800 dark:text-white"
              href="/"
              by=" - Desenvolvido por Bruno"
              year={2025}
            />
          </div>
        </Footer>
      </main>
    </>
  );
}
