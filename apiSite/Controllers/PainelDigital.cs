using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

[Route("api/[controller]")]
[ApiController]

public class PainelDigitalController : ControllerBase
{
    private readonly DataContext context;

     public PainelDigitalController(DataContext _context)
    {
        // para cada context o nome da tabela será o nome da tabela NO BANCO DE DADOS
        // e NÃO no model.
        context = _context;
    }

    [HttpGet("selectExames")]
    public async Task<ActionResult<IEnumerable<Exame>>> SelectExames()
    {
        // lista pacientes por ordem de nome para uso em Agendamento
        try
        {
            // somente os Exames que estão Ativos (Ativo = true (no BD é 1))
            List<Exame> resultado = await context.Exames.Where(a => a.Ativo == true).OrderBy(a => a.Nome).ToListAsync();
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Painel Digital - Select Exames / Erro ", errorMessage);
            return BadRequest("Painel Digital: erro ao listar Exames");
        }
    }     

    [HttpPost("getpainel")]
    public async Task<ActionResult<List<PainelExame>>> GeraPainel(
        [FromBody] PainelObjeto model)
    {
        // No Next o objeto Json deve ser algo como: 
        // body: JSON.stringify({
        //     datapainel: '2025-05-01', // data dos agendamentos
        //     codexames: [1, 2, 3],  // IDs dos exames para filtrar
        // }),
        try
        {
            //DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                

            // se parametro data for nulo retorna data atual do BD        
            // var dataHoje = model.DataPainel.Date ?? dtHoraAtual.Date;
            var dataHoje = model.DataPainel.Date;
            // var dataHoje = Funcoes.ConverterParaHorarioLocal(model.DataPainel.Date);

            // obtem Agendamentos filtrando:
            // a) data de agendamento do exame
            // b) código do exame (Se for mencionado)
            var agendamentos = await context.Agendamentos
                .Include(a => a.Exame)
                .Include(a => a.Paciente)
                .Where(a => a.HorIni.Value.Date == dataHoje)
                .Where(a => model.CodExame == null || a.ExameId == model.CodExame )
                .AsNoTracking() // informo que só vou ler a tabela
                .ToListAsync();

            // aqui faço o agrupamento de agendamentos por tipo de exame e faço cálculo
            var resultado = agendamentos
                .GroupBy(a => a.ExameId)
                .Select(g =>
                {
                    // pego exame e dados fixos
                    var primeiroAgendamento = g.First();
                    var valExame = primeiroAgendamento.Exame!;

                    // g.Key é a tabela do agrupamento, no caso Exame

                    // pega tempo de duração Padrão do exame
                    // var tempoPadrao = g.Key.Duracao;
                    var tempoPadrao = valExame.Duracao;

                    // Pego agendamentos, por tipo de exame,
                    // que foram finalizados (status = 5)
                    var atendidos = g
                        // .Where(a => a.Status == 5 && a.HorPresenca != null && a.HorFim != null)
                        .Where(a => a.Status == 5 && a.HorFim != null)
                        .ToList(); // como já está na memória faço tolist

                    // Pego agendamentos acima (por tipo de exame e finalizados)
                    // e obtenho o tempo médio de atendimento (horário final - horário da presença)
                    // perceba que é HorPresença pois pelo horin NÃO representa a hora que o paciente realmente chegou
                    double tempoMedio = atendidos.Any()
                        // ? atendidos.Average(a => (a.HorFim.Value - a.HorPresenca.Value).TotalMinutes)
                        ? atendidos.Average(a => (a.HorFim.Value - a.HorConvocacao.Value).TotalMinutes)
                        : tempoPadrao;

                    // construo relação de pacientes na fila
                    // informando o tempo médio daquele tipo de exame
                    // var pacientesFila = g
                    //     .Where(a => a.Status == 2 && a.HorFim == null && a.Convocacao == false)
                    //     .OrderBy(a => a.HorIni)
                    //     .Select(a => new PacienteFila
                    //     {
                    //         PFNome = a.Paciente!.Nome,
                    //         PFHoraAgenda = a.HorIni.Value,
                    //         PFTempoEst = TimeSpan.FromMinutes(tempoMedio)
                    //     }).ToList();

                    // Primeiro grupo: pacientes na fila normal (ordem de agendamento)
                    var pacientesOrdemNatural = g
                        .Where(a => a.Status == 2 && a.HorFim == null && a.Convocacao == false && a.NumFila == 0)
                        .OrderBy(a => a.HorIni)
                        .Select(a => new PacienteFila
                        {
                            PFNome = a.Paciente!.Nome,
                            PFHoraAgenda = a.HorIni.Value,
                            PFTempoEst = TimeSpan.FromMinutes(tempoMedio)
                        }).ToList();   


                    // Segundo grupo: pacientes que perderam a posição (ordem por NumFila)
                    var pacientesReordenados = g
                        .Where(a => a.Status == 2 && a.HorFim == null && a.Convocacao == false && a.NumFila > 0)
                        .OrderBy(a => a.NumFila)
                        .Select(a => new PacienteFila
                        {
                            PFNome = a.Paciente!.Nome,
                            PFHoraAgenda = a.HorIni.Value,
                            PFTempoEst = TimeSpan.FromMinutes(tempoMedio)
                        }).ToList();       

                    // Junto os dois grupos na ordem correta
                    var pacientesFila = pacientesOrdemNatural
                        .Concat(pacientesReordenados)
                        .ToList();                                                       

                    // construo relação de pacientes já atendidos
                    // informando o tempo de início e fim dos atendimentos para aquele tipo de exame
                    var pacientesAtendidos = atendidos
                        .OrderBy(a => a.HorIni)
                        .Select(a => new PacienteAtendido
                        {
                            PANome = a.Paciente!.Nome,
                            PAHoraAgenda = a.HorIni.Value,
                            // PAHoraIni = a.HorPresenca!.Value,
                            PAHoraIni = a.HorConvocacao!.Value,
                            PAHoraFim = a.HorFim!.Value
                        }).ToList();

                    // construo relação de pacientes que foram chamados pra fazer exame
                    var pacientesConvocados = g
                        .Where(a => a.Status == 2 && a.Convocacao == true)
                        .OrderBy(a => a.HorConvocacao)
                        .Select(a => new PacienteChamada
                        {
                            PFNome = a.Paciente!.Nome,
                            PFHoraAgenda = a.HorIni.Value,
                        }).ToList();

                     // construo relação de pacientes que foram chamados pra CONFIRMAR DADOS
                    var pacientesConfDados = g
                        .Where(a => a.Status == 2 && a.Convocacao == false && a.Confirmacao == true && a.DadosOk == false)
                        .OrderBy(a => a.HorConfirmacao)
                        .Select(a => new PacienteChamDado
                        {
                            PFNome = a.Paciente!.Nome,
                            PFHoraAgenda = a.HorIni.Value,
                        }).ToList();    
                    return new PainelExame
                    {
                        // ExameCod = g.Key.Id,
                        // ExameNome = g.Key.Nome,
                        ExameCod = valExame.Id,
                        ExameNome = valExame.Nome,
                        ExameTempoPadrao = tempoPadrao,
                        ExameTempoMedio = tempoMedio,
                        PacientesNaFila = pacientesFila,
                        PacientesAtendidos = pacientesAtendidos,
                        PacientesChamados = pacientesConvocados,
                        PacientesChamDados = pacientesConfDados,
                    };
                }).OrderBy(pe => pe.ExameNome)  // Ordena pelo nome do exame a partir do DTO que criei
                .ToList();

            return Ok(resultado);            
        }
        catch (Exception ex)
        {
           string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
           Logger.EscreveLog("Painel Digital - Gera Painel / Erro ", errorMessage);
           return BadRequest("Painel Digital: erro ao exibir dados");            
        }
        
    }      

    // [HttpPost("getpainel")]
    // public async Task<ActionResult<List<PainelExame>>> GeraPainel(
    //     [FromBody] PainelObjeto model)
    // {
    //     // No Next o objeto Json deve ser algo como: 
    //     // body: JSON.stringify({
    //     //     datapainel: '2025-05-01', // data dos agendamentos
    //     //     codexames: [1, 2, 3],  // IDs dos exames para filtrar
    //     // }),
    //     try
    //     {
    //         //DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                

    //         // se parametro data for nulo retorna data atual do BD        
    //         // var dataHoje = model.DataPainel.Date ?? dtHoraAtual.Date;
    //         var dataHoje = model.DataPainel.Date;

    //         // obtem Agendamentos filtrando:
    //         // a) data de agendamento do exame
    //         // b) código do exame (Se for mencionado)
    //         var agendamentos = await context.Agendamentos
    //             .Include(a => a.Exame)
    //             .Include(a => a.Paciente)
    //             .Where(a => a.HorIni.Value.Date == dataHoje)
    //             .Where(a => model.CodExames == null || model.CodExames.Contains(a.ExameId))
    //             .AsNoTracking() // informo que só vou ler a tabela
    //             .ToListAsync();

    //         // aqui faço o agrupamento de agendamentos por tipo de exame e faço cálculo
    //         var resultado = agendamentos
    //             .GroupBy(a => a.Exame)
    //             .Select(g =>
    //             {
    //                 // g.Key é a tabela do agrupamento, no caso Exame

    //                 // pega tempo de duração Padrão do exame
    //                 var tempoPadrao = g.Key.Duracao;

    //                 // Pego agendamentos, por tipo de exame,
    //                 // que foram finalizados (status = 5)
    //                 var atendidos = g
    //                     .Where(a => a.Status == 5 && a.HorPresenca != null && a.HorFim != null)
    //                     .ToList(); // como já está na memória faço tolist

    //                 // Pego agendamentos acima (por tipo de exame e finalizados)
    //                 // e obtenho o tempo médio de atendimento (horário final - horário da presença)
    //                 // perceba que é HorPresença pois pelo horin NÃO representa a hora que o paciente realmente chegou
    //                 double tempoMedio = atendidos.Any()
    //                     ? atendidos.Average(a => (a.HorFim.Value - a.HorPresenca.Value).TotalMinutes)
    //                     : tempoPadrao;

    //                 // construo relação de pacientes na fila
    //                 // informando o tempo médio daquele tipo de exame
    //                 var pacientesFila = g
    //                     .Where(a => a.Status == 2 && a.HorFim == null)
    //                     .OrderBy(a => a.HorIni)
    //                     .Select(a => new PacienteFila
    //                     {
    //                         PFNome = a.Paciente!.Nome,
    //                         PFHoraAgenda = a.HorIni.Value,
    //                         PFTempoEst = TimeSpan.FromMinutes(tempoMedio)
    //                     }).ToList();

    //                 // construo relação de pacientes já atendidos
    //                 // informando o tempo de início e fim dos atendimentos para aquele tipo de exame
    //                 var pacientesAtendidos = atendidos
    //                     .OrderBy(a => a.HorIni)
    //                     .Select(a => new PacienteAtendido
    //                     {
    //                         PANome = a.Paciente!.Nome,
    //                         PAHoraAgenda = a.HorIni.Value,
    //                         PAHoraIni = a.HorPresenca!.Value,
    //                         PAHoraFim = a.HorFim!.Value
    //                     }).ToList();

    //                 return new PainelExame
    //                 {
    //                     ExameCod = g.Key.Id,
    //                     ExameNome = g.Key.Nome,
    //                     ExameTempoPadrao = tempoPadrao,
    //                     ExameTempoMedio = tempoMedio,
    //                     PacientesNaFila = pacientesFila,
    //                     PacientesAtendidos = pacientesAtendidos
    //                 };
    //             }).ToList();

    //         return Ok(resultado);            
    //     }
    //     catch (Exception ex)
    //     {
    //         //string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
    //         //Console.WriteLine(errorMessage);

    //        return BadRequest("Painel Digital: erro ao exibir dados");            
    //     }
        
    // }    
}