# 📋 Sistema de Exames

Projeto desenvolvido para a disciplina de Pós-Graduação em Desenvolvimento para Internet e Dispositivos Móveis do IFSP Barretos.

## 👨‍💻 Aluno

**Bruno Belini Neto**

## 👨‍🏫 Professor

**Tiago Docusse**

## 🏫 Curso

Pós-Graduação em Desenvolvimento para Internet e Dispositivos Móveis  
**Instituto Federal de São Paulo – Câmpus Barretos**

---

## 📌 Descrição

O **Sistema de Exames** é uma aplicação web desenvolvida para facilitar o agendamento de exames de pacientes. O sistema é composto por um front-end em **Next.js** e uma **Web API** em **.NET 8**, com persistência de dados utilizando **SQL Server 2022 Express**.

---

## 🛠️ Tecnologias Utilizadas

- [Next.js 15](https://nextjs.org/)
- [Web API com .NET 8](https://learn.microsoft.com/aspnet/core/web-api)
- [SQL Server 2022 Express](https://www.microsoft.com/pt-br/sql-server/sql-server-downloads)
- Entity Framework Core

---

## 🚀 Como Executar o Projeto

### a) API (.NET)

1. Instale os pacotes necessários:

   ```bash
   dotnet add package Microsoft.EntityFrameworkCore
   dotnet add package Microsoft.EntityFrameworkCore.Design
   dotnet add package Microsoft.EntityFrameworkCore.Tools
   dotnet add package Microsoft.EntityFrameworkCore.SqlServer
   dotnet tool install dotnet-ef --global
   ```

2. Configure o arquivo `appsettings.json` com a string de conexão:

```json
{
  "ConnectionStrings": {
    "Development": "sua-connection-string-aqui"
  }
}
```

### b) Frontend (Next.js)

Acesse a pasta do projeto Next.js e execute:

```bash
npm install
```

### c) Banco de Dados (SQL Server)

Certifique-se de que o SQL Server está instalado.

Aplique a migração no projeto da API:

```bash
dotnet ef migrations add NomeMigracao
dotnet ef database update

```

> ⚠️ Atenção: Para isso funcionar, a ConnectionStrings/Development precisa estar corretamente configurada no appsettings.json.

### d) Envio de E-mail

Configure a seção `EmailSettings` no `appsettings.json` da API.

É recomendável criar uma conta no Gmail e gerar uma **senha de app** para uso seguro.

Um e-mail já funcional está incluso, mas o Google pode solicitar confirmação de acesso autorizado em alguns casos.

## 🚗 Funcionamento do projeto

1. **Primeira execução**  
   Na primeira vez que o sistema for iniciado, você deverá informar:

   - Seu nome, e-mail e senha do usuário administrador
   - O tempo máximo (em minutos) de atraso permitido para o comparecimento do paciente ao exame

2. **Página Inicial do Administrador**  
   Ao acessar, o administrador terá as seguintes opções de menu:

   a) **Cadastros**

   - **Parâmetros:** Atualiza o tempo máximo (em minutos) de atraso para comparecimento no exame
   - **Exames:** Registro dos exames usados no sistema
   - **Pacientes:** Registro dos pacientes para agendamento
   - **Usuários:** Cadastro de usuários com acesso ao sistema (nível Secretaria)

   b) **Agendamentos - Lançamentos**

   - Registro dos agendamentos de exame para os pacientes

   c) **Atendimentos**

   - **Confirmação de Dados:** Convocação de pacientes para confirmar dados e prosseguir com o exame
   - **Chamada de Pacientes:** Convocação para realização do exame
   - **Resumo de Atividades:** Resumo das operações realizadas para os agendamentos

3. **Telas que NÃO exigem autenticação (uso facilitado para pacientes e clínica)**

   a) **Terminal** (`caminhodosite/terminal`)

   - Pacientes informam seu CPF cadastrado para confirmar exames agendados para o dia
   - Ideal para ser exibido em totens digitais ou televisores com teclado e mouse para interação

   b) **PainelDia** (`caminhodosite/paineldia`)

   - Tela usada em televisão para que os pacientes visualizem quando serão chamados para confirmação e realização dos exames
