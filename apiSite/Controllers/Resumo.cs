using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

[Route("api/[controller]")]
[ApiController]

public class ResumoController : ControllerBase
{
    private readonly DataContext context;

     public ResumoController(DataContext _context)
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
            // List<Exame> resultado = await context.Exames.Where(a => a.Ativo == true).OrderBy(a => a.Nome).ToListAsync();
            List<Exame> resultado = await context.Exames.OrderBy(a => a.Nome).ToListAsync();
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Resumo - Select Exames / Erro ", errorMessage);
            return BadRequest("Resumo: erro ao listar Exames");
        }
    }     

    [HttpGet("selectPacientes")]
    public async Task<ActionResult<IEnumerable<Paciente>>> SelectPacientes()
    {
        // lista pacientes por ordem de nome para uso em Agendamento
        try
        {
            // somente os Exames que estão Ativos (Ativo = true (no BD é 1))
            List<Paciente> resultado = await context.Pacientes.OrderBy(a => a.Nome).ToListAsync();
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Resumo - Select Pacientes / Erro ", errorMessage);
            return BadRequest("Resumo: erro ao listar Pacientes");
        }
    }      

    [HttpPost("gridresumo")]
    public async Task<ActionResult<List<ResumoGrid>>> GeraGrid(
        [FromBody] ResumoBusca model)
    {
        // No Next o objeto Json deve ser algo como: 
        // body: JSON.stringify({
        //     datapainel: '2025-05-01', // data dos agendamentos
        //     codexames: [1, 2, 3],  // IDs dos exames para filtrar
        // }),
        try
        {
            if (model.ExameID < 0)
            {
                return BadRequest("Código do Exame inválido!");            
            }

            if (model.PacienteID < 0)
            {
                return BadRequest("Código do Paciente inválido!");            
            }      

            if (model.SitAgenda < 0)
            {
                return BadRequest("Situação do Agendamento inválida!");            
            }          
            
            //DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                

            // se parametro data for nulo retorna data atual do BD        
            // var dataHoje = model.DataPainel.Date ?? dtHoraAtual.Date;
            var dataHoje = model.DtAgenda.Date;
            // var dataHoje = Funcoes.ConverterParaHorarioLocal(model.DataPainel.Date);

            // obtem Agendamentos filtrando:
            // a) data de agendamento do exame
            // b) código do exame, codigo do paciente (Se for mencionado)
            var query = context.Agendamentos
            .Include(a => a.Exame)
            .Include(a => a.Paciente)
            .Where(a => a.HorIni.Value.Date == dataHoje)
            .AsQueryable(); // construi estrutura da consulta

            // filtra o exame caso exista
            if(model.ExameID > 0)
            {
                query = query.Where(a => a.ExameId == model.ExameID);
            }

            // filtra o paciente caso exista
            if(model.PacienteID > 0)
            {
                query = query.Where(a => a.PacienteId == model.PacienteID);
            }      

            // const dadosSituacao = [
            //     { id: 1, nome: "Presença NÃO Confirmada" },
            //     { id: 2, nome: "Presença Confirmada" },
            //     { id: 3, nome: "Paciente Ausente" },
            //     { id: 4, nome: "Paciente Desistiu" },
            //     { id: 5, nome: "Agendamento Finalizado" },
            // ];      
            // filtra Situação do Agendamento
            if(model.SitAgenda > 0)
            {
                switch (model.SitAgenda)
                {
                    case 1: // Presença NÃO Confirmada
                        query = query.Where(a => a.Status == 0); 
                        break;

                    case 2: // Presença Confirmada
                        query = query.Where(a => a.Status == 2);
                        break;

                    case 3: // Paciente Ausente
                        query = query.Where(a => a.Status == 3);
                        break;

                    case 4: // Paciente Desistiu
                        query = query.Where(a => a.Status == 4);
                        break;

                    case 5: // Agendamento Finalizado
                        query = query.Where(a => a.Status == 5); 
                        break;

                    case 6: // Agendamento Cancelado
                        query = query.Where(a => a.Status == 1); 
                        break;                        

                    default:
                        // Nenhum filtro de status 
                        break;
                }
            }     

            var agendamentos = await query
            .AsNoTracking()
            .OrderByDescending(a => a.Id) // <-- Aqui é onde a ordenação é aplicada
            .Select(a => new ResumoGrid
            {
                Id = a.Id,
                DtAgenda = a.HorIni,
                Status = a.Status,
                ExameId = a.ExameId,
                ExameNome = a.Exame.Nome,
                PacienteId = a.PacienteId,
                PacienteNome = a.Paciente.Nome,
                // a partir do Status do agendamento
                // defino o campo HorOperação através de expressão switch
                // HorOperacao = a.Status == 0 ? (DateTime?)null :
                HorOperacao = a.Status == 0 ? a.HorIni :
                            a.Status == 2 ? a.HorPresenca :
                            a.Status == 3 ? a.HorAusencia :
                            a.Status == 4 ? a.HorDes :
                            a.Status == 5 ? a.HorFim : null
            })
            .ToListAsync();


            return Ok(agendamentos);            
        }
        catch (Exception ex)
        {
           string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
           Logger.EscreveLog("Resumo Diário - Gera Grid / Erro ", errorMessage);
           return BadRequest("Resumo Diário: erro ao exibir dados");            
        }
        
    }      

    [HttpGet("{id}")]
    public async Task<ActionResult<ResumoDetalhe>> Get([FromRoute] int id)
    {
        try
        {
            if (await context.Agendamentos.AnyAsync(p => p.Id == id))
            {
                var resultado = await context.Agendamentos
                .Include(a => a.Exame)
                .Include(a => a.Paciente)
                .Where(a => a.Id == id)
                .AsNoTracking()
                .Select(a => new ResumoDetalhe
                {
                    Id = a.Id,
                    DtAgenda = a.HorIni,
                    Status = a.Status,
                    ExameId = a.ExameId,
                    ExameNome = a.Exame.Nome,
                    PacienteId = a.PacienteId,
                    PacienteNome = a.Paciente.Nome,
                    HorPresenca = a.HorPresenca,
                    HorFim = a.HorFim,
                    HorDes = a.HorDes,
                    MotDes = a.MotDes,
                    DadosOk = a.DadosOk,
                    HorDados = a.HorDados,
                    Convocacao = a.Convocacao,
                    HorConvocacao = a.HorConvocacao,
                    HorAusencia = a.HorAusencia,
                    HorCancela = a.HorCancela,
                    HorLancto = a.HorLancto,
                    Confirmacao = a.Confirmacao,
                    HorConfirmacao = a.HorConfirmacao,
                    NumFila = a.NumFila,
                    HorFila = a.HorFila,
                })
                .ToListAsync();
                return Ok(resultado);
            }

            else
                return NotFound("Agendamento informado não foi encontrado");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Resumo Diário - Get ID / Erro ", errorMessage);
            return BadRequest("Resumo Diário: Erro ao efetuar a busca de registro");
        }
    }    

       
}