using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

[Route("api/[controller]")]
[ApiController]

public class DashboardController : ControllerBase
{
    private readonly DataContext context;

     public DashboardController(DataContext _context)
    {
        // para cada context o nome da tabela será o nome da tabela NO BANCO DE DADOS
        // e NÃO no model.
        context = _context;
    }

    [HttpGet("dashadmin")]
    public async Task<ActionResult> GeraDashAdmin()
    {
        // obtem dados para informar em dashboard administrador
        try
        {
            // qtde usuários ativos
            var qtUsuarioAtivo = await context.Usuarios.Where(a => a.Ativo == true).CountAsync();
            // qtde usuários inativos
            var qtUsuarioInativo = await context.Usuarios.Where(a => a.Ativo == false).CountAsync();            
            // qtde exames ativos
            var qtExameAtivo = await context.Exames.Where(a => a.Ativo == true).CountAsync();            
            // qtde exames inativos
            var qtExameInativo = await context.Exames.Where(a => a.Ativo == false).CountAsync();                        
            // qtde pacientes cadastrados
            var qtPaciente = await context.Pacientes.CountAsync();

            // resultado enviado como resposta
            var resultado = new {
                UsuarioAtivo = qtUsuarioAtivo,
                UsuarioInativo = qtUsuarioInativo,
                ExameAtivo = qtExameAtivo,
                ExameInativo = qtExameInativo,   
                Paciente =   qtPaciente           
            };

            // retorna objeto 
            return Ok(resultado);                     
          
        }
        catch (Exception ex)
        {
           string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
           Logger.EscreveLog("Dashboard - Admin / Erro ", errorMessage);
           return BadRequest("Dashboard: erro ao exibir dash admin");            
        }
        
    }      


    [HttpGet("dashsec")]
    public async Task<ActionResult> GeraDashSec()
    {
        // obtem dados para informar em dashboard secretaria
        try
        {
            // retorna data atual, no caso somente data
            var dataBD = DateTime.Today;
            // Console.WriteLine(dataBD);

            // qtde de Agendamentos para o dia
            var qtdAgendamentos = await context.Agendamentos
                .Where(a => a.HorIni.Value.Date == dataBD.Date)  // Verifica se a data de início é a mesma do servidor
                .CountAsync();

            // Contar o número de agendamentos finalizados (status == 5)
            var qtdAgendamentosFin = await context.Agendamentos
                .Where(a => a.HorIni.Value.Date == dataBD.Date && a.Status == 5)
                .CountAsync();

            // calcula percentual de agendamento concluido
            double percAgendFinalizado = 0;

            // calcula percentual
            if(qtdAgendamentos > 0)
            {
                percAgendFinalizado = (double)qtdAgendamentosFin / qtdAgendamentos * 100;
            }

            // tempo de espera
          var tempoMedioEspera = await context.Agendamentos
            .Where(a => a.Status == 5 && a.HorIni.Value.Date == dataBD.Date) // Filtro agendamentos com HorIni igual à data do servidor
            .Select(a => new 
            {
                TempoEspera = EF.Functions.DateDiffMinute(a.HorConvocacao, a.HorIni) // Calculo a diferença em minutos entre HorConvocacao e HorIni
            })
            .AverageAsync(a => a.TempoEspera);  // Calcula a média dos tempos de espera

            if (tempoMedioEspera == null)
            {
                tempoMedioEspera = 0;
            }

            // qtde Exames no dia
            var qtdExames = await context.Agendamentos
                .Where(a => a.HorIni.Value.Date == dataBD)  // Verifica se a data de início é a mesma do servidor
                .Select(a => a.ExameId)  // Seleciona os ExameIds para então agrupar
                .GroupBy(exameId => exameId)  // Agrupa pelos ExameIds que mencionei no select
                .CountAsync();  // Conta o número de exames

            // qtde Pacientes no dia
            var qtdPacientes = await context.Agendamentos
                .Where(a => a.HorIni.Value.Date == dataBD)  // Verifica se a data de início é a mesma do servidor
                .Select(a => a.PacienteId)  // Seleciona os pacienteId para então agrupar
                .GroupBy(pacienteId => pacienteId)  // Agrupa pelos pacienteId que mencionei no select
                .CountAsync();  // Conta o número de pacientes


        
            // // resultado enviado como resposta
            var resultado = new {
                dataAtual = dataBD,
                qtdeAgendamento = qtdAgendamentos,
                percAgendFin = percAgendFinalizado,
                qtdeExame = qtdExames,
                qtdePaciente = qtdPacientes,
                tempoMedio = tempoMedioEspera     
            };

            // retorna objeto 
            return Ok(resultado);                     
          
        }
        catch (Exception ex)
        {
           string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
           Logger.EscreveLog("Dashboard - Sec / Erro ", errorMessage);
           return BadRequest("Dashboard: erro ao exibir dados sec");            
        }
        
    }    

   

       
}