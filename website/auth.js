import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { Autenticar } from "./app/login/api";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // console.log("Começou no Auth");
        // console.log(credentials);
        const resultado = await Autenticar(credentials);
        if (resultado.success) {
          // console.log("Retorno do Autenticar");
          // console.log(resultado.data);
          // return resultado.data;
          // retorna dados em conformidade ao objeto user que é gerado pelo
          // authorize e é utilizado pelo session
          var valUser = {
            id: resultado.data.usuarioID, // ID do usuário
            name: resultado.data.usuarioNome, // Nome do usuário
            email: resultado.data.usuarioEmail, // E-mail do usuário
          };
          // console.log("Objeto Usuário");
          // console.log(valUser);
          return valUser;
        } else {
          // console.log("Gerrou erro ao autenticar");
          return null;
        }
      },
    }),
  ],
});
