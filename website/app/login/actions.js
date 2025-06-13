"use server";

import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect";

export async function login(data) {
  try {
    // await signIn("credentials", data);
    // informando que não é pra redirecionar (Redirect) no signin faz dar certo
    // sem gerar o catch
    await signIn("credentials", { ...data, redirect: false });
    // console.log("Login deu certo");
  } catch (error) {
    // console.log("Gerou erro: " + error);

    // if (isRedirectError(error)) {
    //   console.log("É erro de redirecionamento");
    //   throw error;
    // }

    return "Email e/ou senha inválidos! Tente novamente!";
  }
}

export async function logout() {
  await signOut();
}

export async function dadosUsuario() {
  // console.log("Retorno da Sessão");
  const session = await auth();
  // console.log(session);
  return session;
}
