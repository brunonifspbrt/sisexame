"use client";
import DashSecretaria from "./dashsec";
import DashAdmin from "./dashadmin";
import { LayoutContext } from "./context";
import { useContext } from "react";

export default function Home() {
  const contextoAtual = useContext(LayoutContext);

  let dashboard = null;
  // let tipoUsuario = false;
  // se for usuário admin mostra dashboard admin
  // caso contrário dashboard sec
  // console.log("Valor admin:" + contextoAtual?.usuarioAdmin);
  // tipoUsuario = contextoAtual?.usuarioAdmin;
  // tipoUsuario = false;
  // if (tipoUsuario) {
  if (contextoAtual?.usuarioAdmin) {
    dashboard = <DashAdmin />;
  } else {
    dashboard = <DashSecretaria />;
  }

  return (
    <>
      <p>Página Inicial</p>
      {dashboard}
    </>
  );
}
