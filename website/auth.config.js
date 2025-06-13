import { GeraInfoUsuario } from "./app/login/api";
import { VerificarStatus } from "./app/setup/api";
// import { NextResponse } from "next/server";

async function VerificaSistema() {
  let resultado = false;
  let valResultado = null;
  try {
    valResultado = await VerificarStatus();
    // console.log(valResultado.data);
    if (valResultado.success) {
      if (valResultado.data?.status) {
        resultado = true;
      } else {
        resultado = false;
      }
    } else {
      resultado = false;
    }
  } catch {
    resultado = false;
    console.log("Auth Config - Erro no login:" + valResultado.message);
  }
  return resultado;
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // authorized({ auth, request: { nextUrl } }) {
    async authorized({ auth, request: { nextUrl } }) {
      // console.log("Começou no Auth Config");
      const isLoggedIn = !!auth?.user;

      // verifica se o sistema está configurado
      const status = await VerificaSistema();
      // console.log(status);
      // console.log("Logado:");
      // console.log(isLoggedIn);

      // rotas que não exigem login: libero acesso
      // paineldia, resetmail, resetpwd, setup,terminal : NÃO exigem autenticação
      if (
        nextUrl.pathname.startsWith("/paineldia") ||
        nextUrl.pathname.startsWith("/resetmail") ||
        nextUrl.pathname.startsWith("/resetpwd") ||
        nextUrl.pathname.startsWith("/setup") ||
        nextUrl.pathname.startsWith("/alterasenha") ||
        nextUrl.pathname.startsWith("/terminal")
      ) {
        return true; // libera acesso sem login
      }

      // verifica se o sistema está configurado
      // se não estiver manda no setup
      // const status = await VerificaSistema();
      if (!status) {
        return Response.redirect(new URL("/setup", nextUrl));
      }

      //não está logado, força login
      if (!isLoggedIn) return false;

      // console.log("Abaixo Cod Operação do usuário:");
      // console.log(auth?.user?.operacao);

      // caso o usuário esteja fazendo o primeiro acesso então eu forço
      // alterar a senha
      if (auth.user.operacao === 3) {
        // console.log("Alterando senha");
        const codUsuario = auth.user.id;
        // se é primeiro acesso (operacao = 3)
        // e a rota NÃO é pra alterar senha: força alterar senha
        // caso a rota já seja de alterar senha ele não faz nada
        if (!nextUrl.pathname.startsWith(`/alterasenha/${codUsuario}`)) {
          return Response.redirect(
            new URL(`/alterasenha/${codUsuario}`, nextUrl)
          );
        } else {
          return true; // já está na rota correta, deixa continuar
        }
      }
      // console.log("Não altera senha");

      //se já fez login vai para página principal do projeto
      if (nextUrl.pathname.startsWith("/login"))
        return Response.redirect(new URL("/", nextUrl));
      // return NextResponse.redirect(new URL("/", nextUrl)); // Usando NextResponse para redirecionamento

      // rotas abaixo somente para usuário administrador
      if (nextUrl.pathname.startsWith("/parametro")) {
        if (auth.user.tipo == 0) return true;
        else return Response.redirect(new URL("/notfound", nextUrl));
      }

      // rotas abaixo somente para usuário administrador
      if (nextUrl.pathname.startsWith("/exame")) {
        if (auth.user.tipo == 0) return true;
        else return Response.redirect(new URL("/notfound", nextUrl));
      }

      // rotas abaixo somente para usuário administrador
      if (nextUrl.pathname.startsWith("/usuario")) {
        if (auth.user.tipo == 0) return true;
        else return Response.redirect(new URL("/notfound", nextUrl));
      }

      //Retorna verdadeiro para todos os outros casos
      return true;
    },

    async session({ session }) {
      // console.log("Chamou callback da sessão");
      // console.log(session);
      const user = await GeraInfoUsuario(session.user);
      // adicionando ID e tipo de usuário 0 ou 1 (Admin, Sec)
      session.user.id = user.data.usuarioID;
      session.user.tipo = user.data.usuarioTipo;
      session.user.operacao = user.data.usuarioOperacao;
      // console.log("Sessão do Usuário");
      // console.log(session.user);
      return session;
    },
  },
  providers: [],
};
