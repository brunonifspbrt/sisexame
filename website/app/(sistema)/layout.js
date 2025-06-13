"use server";

import { dadosUsuario } from "../login/actions";
import { BuscarFoto } from "./api";
import LayoutClient from "./layoutclient";

export default async function Layout({ children }) {
  // console.log("Chamou a sessão");
  const usuario = await dadosUsuario();
  let usuarioFoto = null;
  let dadosFoto = null;
  if (usuario) {
    usuarioFoto = await BuscarFoto(usuario.user.id);
  }

  if (usuarioFoto.success) {
    dadosFoto = usuarioFoto.data;
    // console.log(dadosFoto);
  }

  return (
    <LayoutClient
      usuario={{
        id: usuario.user.id,
        nome: usuario.user.name,
        email: usuario.user.email,
        admin: usuario.user.tipo === 0,
        operacao: usuario.user.operacao,
        foto: dadosFoto,
      }}
    >
      {children}
    </LayoutClient>
  );
}
