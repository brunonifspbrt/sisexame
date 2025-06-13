using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace apiSite.Migrations
{
    /// <inheritdoc />
    public partial class Inicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Exames",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Duracao = table.Column<int>(type: "int", nullable: false),
                    Instrucoes = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exames", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pacientes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CPF = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DataNascimento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    Obs = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pacientes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Parametros",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AtrasoMaximo = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parametros", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sistemas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DataInicializacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Inicializado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sistemas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Foto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DtNasc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Senha = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SenhaTemp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tipo = table.Column<byte>(type: "tinyint", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DtUltAcesso = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailTemp = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CodigoVerEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DtUltTrocaEmail = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CodigoVerSenha = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DtUltTrocaSenha = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Operacao = table.Column<byte>(type: "tinyint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Agendamentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExameId = table.Column<int>(type: "int", nullable: false),
                    PacienteId = table.Column<int>(type: "int", nullable: false),
                    HorIni = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    HorPresenca = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HorFim = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HorDes = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MotDes = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DadosOk = table.Column<bool>(type: "bit", nullable: false),
                    HorDados = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Convocacao = table.Column<bool>(type: "bit", nullable: false),
                    HorConvocacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HorAusencia = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HorCancela = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HorLancto = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Confirmacao = table.Column<bool>(type: "bit", nullable: false),
                    HorConfirmacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NumFila = table.Column<int>(type: "int", nullable: false),
                    HorFila = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agendamentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Agendamentos_Exames_ExameId",
                        column: x => x.ExameId,
                        principalTable: "Exames",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Agendamentos_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_ExameId",
                table: "Agendamentos",
                column: "ExameId");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_PacienteId",
                table: "Agendamentos",
                column: "PacienteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Agendamentos");

            migrationBuilder.DropTable(
                name: "Parametros");

            migrationBuilder.DropTable(
                name: "Sistemas");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Exames");

            migrationBuilder.DropTable(
                name: "Pacientes");
        }
    }
}
