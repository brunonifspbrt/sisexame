using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;



[Route("api/[controller]")]
[ApiController]
public class AgendamentoController : ControllerBase
{
    private readonly DataContext context;
    private readonly EmailService emailService;

    public AgendamentoController(DataContext _context, EmailService _emailService)
    {
        // para cada context o nome da tabela será o nome da tabela NO BANCO DE DADOS
        // e NÃO no model.
        context = _context;
        // inclui serviço de e-mail
        emailService = _emailService;          
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<Agendamento>>> Get()
    {
          try
            {
              return Ok(await context.Agendamentos.ToListAsync());
            }
            catch (Exception ex)
            {
                string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                Logger.EscreveLog("Agendamento - Get / Erro ", errorMessage);
                return BadRequest("Agendamento: Erro ao listar Agendamentos");
            }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Agendamento>> Get([FromRoute] int id)
    {
        try
        {
            if (await context.Agendamentos.AnyAsync(p => p.Id == id))
                return Ok(await context.Agendamentos.FindAsync(id));
            else
                return NotFound("Agendamento informado não foi encontrado");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Agendamento - Get ID / Erro ", errorMessage);
            return BadRequest("Agendamento: Erro ao efetuar a busca de Agendamento");
        }
    }

    // Método público, mas NÃO deve ser exposto como ação HTTP
    [NonAction]
    private async Task<bool> VerificarPacienteExistente(int codPaciente)
    {
        return await context.Pacientes.AnyAsync(a => a.Id == codPaciente);
    }

    // Método público, mas NÃO deve ser exposto como ação HTTP
    [NonAction]
    private async Task<bool> VerificarExameExistente(int codExame)
    {
        return await context.Exames.AnyAsync(a => a.Id == codExame);
    }    

    // Método público, mas NÃO deve ser exposto como ação HTTP
    [NonAction]
    private async Task<bool> VerificarCPFExistente(string valCPF)
    {
        return await context.Pacientes.AnyAsync( a => a.CPF == valCPF);
    }


    // Método público, mas NÃO deve ser exposto como ação HTTP
    [NonAction]
    private async Task<(string nome, string email)> BuscaDadosPacienteID(int codPaciente)
    {
        // Procura o paciente pelo Id e retorna o nome ou uma string vazia se não encontrado
        var paciente = await context.Pacientes
                                    .Where(a => a.Id == codPaciente)
                                    // .Select(a => a.Nome)
                                    .Select(a => new { a.Nome, a.Email })
                                    .FirstOrDefaultAsync();

        if (paciente != null)
        {
            return (paciente.Nome, paciente.Email); // Retorna objeto/tupla com nome e id
        }
        else
        {
            return (null, null); // Retorna null se o paciente não for encontrado
        }
    }

   // Método público, mas NÃO deve ser exposto como ação HTTP
    [NonAction]
    private async Task<(string nome, string email)> BuscaDadosExameID(int codExame)
    {
        // Procura o paciente pelo Id e retorna o nome ou uma string vazia se não encontrado
        var exame = await context.Exames
                                    .Where(a => a.Id == codExame)
                                    // .Select(a => a.Nome)
                                    .Select(a => new { a.Nome, a.Instrucoes })
                                    .FirstOrDefaultAsync();

        if (exame != null)
        {
            return (exame.Nome, exame.Instrucoes); // Retorna objeto/tupla com nome e id
        }
        else
        {
            return (null, null); // Retorna null se o paciente não for encontrado
        }
        
    }    

    [HttpPost]
    public async Task<ActionResult> Post([FromBody]Agendamento item)
    {
        // Exemplo de body Json:
        // {
        //    "exameId": 1,
        //    "pacienteId": 2,
        //    "horIni": "2025-04-20T10:33:02.876Z",
        //    "status": 1,
        //    "usuarioId": 1
        //  }

        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo

        //Verificar em post e put se ID do Paciente existem no banco, se não tiver, não salva
        // bool existePacienteBD = await context.Pacientes.AnyAsync(a => a.Id == item.PacienteId);

        // if(!existePacienteBD)
        // {
        //     // não salva, é necessário ID existente em tabela Pacientes
        //     return BadRequest("Paciente não identificado em base de dados! Tente novamente!");
        // }
        if (!await VerificarPacienteExistente(item.PacienteId))       
        {
            // não salva, é necessário ID existente em tabela Pacientes
            return BadRequest("Paciente não identificado! Tente novamente!");
        }         


        //Verificar em post e put se ID do Exame existem no banco, se não tiver, não salva
        // bool existeExameBD = await context.Exames.AnyAsync(a => a.Id == item.ExameId);        

        // if(!existeExameBD)
        // {
        //     // não salva, é necessário ID existente em tabela Exames
        //     return BadRequest("Exame não identificado em base de dados! Tente novamente!");
        // }
        if (!await VerificarExameExistente(item.ExameId))        
        {
            // não salva, é necessário ID existente em tabela Exames
            return BadRequest("Exame não identificado! Tente novamente!");
        }        

        // hora de inicio do agendamento não pode ser igual ou maior na hora do fim do agendamento
        if (item.HorIni >= item.HorFim)
        {
            return BadRequest("A data e hora de início não podem ser posteriores ou iguais à data e hora de término.");
        }        

        // caso exista agendamento de Exame para o mesmo dia e hora: NÃO SALVA
        // bool existeExameDuplicado = await context.Agendamentos.AnyAsync(a => a.ExameId == item.ExameId && a.HorIni == item.HorIni);
        // if(existeExameDuplicado)
        // {
        //     return BadRequest("Já existe Agendamento deste Exame para a hora informada! Tente novamente!");
        // }

        // caso exista agendamento com mesmo Paciente para o mesmo dia e hora: NÃO SALVA
        // bool existeAgendamento = await context.Agendamentos.AnyAsync(a => a.ExameId == item.ExameId && a.HorIni == item.HorIni  && a.Status == 1);
        if (item.HorIni.HasValue)
        {
             // conversão para horário local
            //DateTime horIniPacDup = item.HorIni.Value.ToLocalTime();
            DateTime horIniPacDup = Funcoes.ConverterParaHorarioLocal(item.HorIni.Value);            ;
            horIniPacDup = Funcoes.TruncarParaMinuto(horIniPacDup);
            bool existePacienteDuplicado = await context.Agendamentos.AnyAsync(a => a.PacienteId == item.PacienteId && a.HorIni == horIniPacDup);
            if(existePacienteDuplicado)
            {
                return BadRequest("Já existe Agendamento para este Paciente na hora informada!");
            }        
         }

// bool existeAgendamento = await context.Agendamentos
//     .AnyAsync(a => a.ExameId == item.ExameId && a.HorIni == item.HorIni);

// if (existeAgendamento)
// {
//     return BadRequest("Já existe um agendamento para esse exame no mesmo horário.");
// }        

        try
        {
            var msgResult = "Agendamento salvo com sucesso";
            // converte campo para data e hora local para evitar problemas com fuso horário
            // verifica antes se campo, que é anulável, tem valor
            DateTime horIniLocal = Funcoes.ConverterParaHorarioLocal(item.HorIni.Value);                
            if (item.HorIni.HasValue)
            {
                // conversão para horário local
                // DateTime horIniLocal = item.HorIni.Value.ToLocalTime();                
                // DateTime dtHoraAtual = DateTime.Now.ToLocalTime();
                DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
                DateTime dtHoraBD = dtHoraAtual;                
                horIniLocal = Funcoes.TruncarParaMinuto(horIniLocal);                
                dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);  
                dtHoraBD = Funcoes.TruncarParaSegundo(dtHoraBD);                                
                // Console.WriteLine(horIniLocal);
                // Console.WriteLine(dtHoraAtual);
                // Verifica se a hora de início é anterior à hora atual do servidor
                if (horIniLocal < dtHoraAtual)
                {
                    return BadRequest("A data e hora de início não podem ser anteriores à data atual.");
                }                

                // altera campo 
                item.HorIni = horIniLocal;
                // informa campo de data lançamento no bd
                item.HorLancto = dtHoraBD;
            }
            // salva data agendamento par enviar no e-mail
            DateTime valDtAgend = horIniLocal;
            await context.Agendamentos.AddAsync(item);
            await context.SaveChangesAsync();
            // após salvar busca dados para enviar email
            // nome do paciente 
            // string nomePaciente = await BuscaDadosPacienteID(item.PacienteId);
            var (pacienteNome, pacienteEmail)  = await BuscaDadosPacienteID(item.PacienteId);
            // string exameNome = await BuscaDadosExameID(item.ExameId);
            var (exameNome, exameInstrucao) = await BuscaDadosExameID(item.ExameId);
            var resultadoEmail = await emailService.EmailAgendamentoAsync(pacienteNome, pacienteEmail, exameNome, exameInstrucao, valDtAgend,"",0);
            // pelo retorno informa sucesso ou não da conclusão
            if (!resultadoEmail.Sucesso)
                msgResult = "Agendamento salvo MAS E-mail NÃO enviado, tente enviar novamente";
                // return Ok("Agendamento salvo MAS E-mail NÃO enviado, tente enviar novamente");                                                    
            // return Ok("Agendamento salvo com sucesso");
            Logger.EscreveLog("Agendamento - Post", msgResult);
            return Ok(msgResult);
        }
        catch (Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Agendamento - Post / Erro ", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");

            return BadRequest("Agendamento: Erro ao salvar o Agendamento informado");            
        }        
        // catch
        // {
        //     return BadRequest("Erro ao salvar o Agendamento informado");
        // }
    }

    [HttpPost("emailagend")]
    public async Task<ActionResult> ReenviaEmailAgendamento([FromBody]AgendReenviaEmail item)
    {
        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo

        try
        {
            // verifica se existe agendamento informado (e ativo) e retorna campos desejados
            var agendamentoInfo = await context.Agendamentos
                // .Where(a => a.Id == item.AgendamentoId && a.Status == 0)
                .Where(a => a.Id == item.AgendamentoId && (a.Status == 0 || a.Status == 1 || a.Status == 2))
                .Select(a => new 
                {
                    a.PacienteId,
                    a.ExameId,
                    a.HorIni,
                    a.Status
                })
                .FirstOrDefaultAsync();

            if (agendamentoInfo == null)
            {
                return NotFound("Agendamento não encontrado.");
            }

            // após salvar busca dados para enviar email
            // nome do paciente 
            // string nomePaciente = await BuscaDadosPacienteID(item.PacienteId);
            var (pacienteNome, pacienteEmail)  = await BuscaDadosPacienteID(agendamentoInfo.PacienteId);
            // string exameNome = await BuscaDadosExameID(agendamentoInfo.ExameId);        
            var (exameNome, exameInstrucao) = await BuscaDadosExameID(agendamentoInfo.ExameId);
            // Console.WriteLine(pacienteNome);
            // Console.WriteLine(pacienteEmail);
            // Console.WriteLine(agendamentoInfo.HorIni);
            // salva data agendamento par enviar no e-mail
            DateTime valDtAgend = agendamentoInfo.HorIni.Value;
            // var resultadoEmail = await emailService.EmailAgendamentoAsync(pacienteNome, pacienteEmail, exameNome, valDtAgend ,"",0);

            // verifica o tipo de e-mail: Novo/Edição ou Cancelamento
            var tipoEmail = 0;
            if(agendamentoInfo.Status == 1)
            {
                tipoEmail = 2; // e-mail de cancelamento
            }

            // var resultadoEmail = await emailService.EmailAgendamentoAsync(pacienteNome, pacienteEmail, exameNome,exameInstrucao, valDtAgend ,"",0);
            var resultadoEmail = await emailService.EmailAgendamentoAsync(pacienteNome, pacienteEmail, exameNome,exameInstrucao, valDtAgend ,"",tipoEmail);
            // pelo retorno informa sucesso ou não da conclusão
            if (resultadoEmail.Sucesso)
            {
                return Ok("E-mail reenviado com sucesso!");
            }
            else
            {
                return BadRequest("Não foi possível reenviar e-mail!");            
            }              


        }
        catch (Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Agendamento - Reenvia Email / Erro ", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Agendamento: Erro ao reenviar e-mail informado");            
        }        
    }    

    [HttpPut("{id}")]
    public async Task<ActionResult> Put([FromRoute] int id, [FromBody] AgendEdicao model)
    {
       
        try
        {
            var msgResult = "Agendamento salvo com sucesso";

            if (id != model.Id) //se é diferente da rota, erro
                return BadRequest("Agendamento inválido");

            if (!await VerificarPacienteExistente(model.PacienteId))       
            {
                // não salva, é necessário ID existente em tabela Pacientes
                return BadRequest("Paciente não identificado! Tente novamente!");
            }                 

            if (!await VerificarExameExistente(model.ExameId))        
            {
                // não salva, é necessário ID existente em tabela Exames
                return BadRequest("Exame não identificado! Tente novamente!");
            }               

            // caso exista agendamento com mesmo Paciente para o mesmo dia e hora: NÃO SALVA
            // conversão para horário local
            // DateTime horIniPacDup = model.HorIni.Value.ToLocalTime();
            DateTime horIniPacDup = Funcoes.ConverterParaHorarioLocal(model.HorIni);
            horIniPacDup = Funcoes.TruncarParaMinuto(horIniPacDup);
            // Console.WriteLine("ID Atual: " + model.Id);
            bool existePacienteDuplicado = await context.Agendamentos.AnyAsync(a => a.PacienteId == model.PacienteId && a.HorIni == horIniPacDup && a.Id != model.Id);
            if(existePacienteDuplicado)
            {
                return BadRequest("Já existe Agendamento para este Paciente na hora informada!");
            }    

            DateTime horIniLocal = Funcoes.ConverterParaHorarioLocal(model.HorIni);            
            DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            horIniLocal = Funcoes.TruncarParaMinuto(horIniLocal);                
            dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                                
            // Console.WriteLine(horIniLocal);
            // Console.WriteLine(dtHoraAtual);
            // Verifica se a hora de início é anterior à hora atual do servidor
            if (horIniLocal < dtHoraAtual)
            {
                return BadRequest("A data e hora de início não podem ser anteriores à data atual.");
            }                     

            // verifica se tem agendamento informado
            var agendamentoBD = await context.Agendamentos.FindAsync(id);
            if (agendamentoBD == null)
                return NotFound("Agendamento não encontrado"); 

            DateTime valDtAgend = horIniLocal;
            int pacienteCod = model.PacienteId;
            int exameCod = model.ExameId;

            agendamentoBD.ExameId = model.ExameId;
            agendamentoBD.PacienteId = model.PacienteId;
            agendamentoBD.HorIni = horIniLocal;
            await context.SaveChangesAsync();            
            
            // context.Agendamentos.Update(model);
            // await context.SaveChangesAsync();
            // após salvar busca dados para enviar email
            // nome do paciente 
            // string nomePaciente = await BuscaDadosPacienteID(item.PacienteId);
            var (pacienteNome, pacienteEmail)  = await BuscaDadosPacienteID(pacienteCod);
            // string exameNome = await BuscaDadosExameID(exameCod);
            var (exameNome, exameInstrucao) = await BuscaDadosExameID(exameCod);
            // var resultadoEmail = await emailService.EmailAgendamentoAsync(pacienteNome, pacienteEmail, exameNome, valDtAgend ,"",1);
            var resultadoEmail = await emailService.EmailAgendamentoAsync(pacienteNome, pacienteEmail, exameNome, exameInstrucao ,valDtAgend ,"",1);
            // pelo retorno informa sucesso ou não da conclusão
            if (!resultadoEmail.Sucesso)
                msgResult = "Agendamento salvo MAS E-mail NÃO enviado, tente enviar novamente";
                // return Ok("Agendamento salvo MAS E-mail NÃO enviado, tente enviar novamente");                        
            // return Ok("Agendamento salvo com sucesso");            
            return Ok(msgResult);            
        }
        catch(Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Agendamento - Put", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Agendamento: Erro ao salvar o Agendamento informado");
        }
    }    

    // [HttpPut("{id}")]
    // public async Task<ActionResult> Put([FromRoute] int id, [FromBody] Agendamento model)
    // {
    //     // O body do Put espera TODOS os dados. Se precisar, faça um get do registro desejado e copie o Json dele para enviar no body
    //     // Exemplo de Json para ter noção de um registro que tinha no BD:
    //     // {
    //     //   "id": 1,  
    //     //   "exameId": 1,
    //     //   "pacienteId": 2,
    //     //   "horIni": "2025-03-31T11:30:55.439Z",
    //     //   "status": 1,
    //     //   "horFim": "2025-03-31T12:38:55.439Z",
    //     //   "usuarioId": 1
    //     // }     

    //     if (id != model.Id) //se é diferente da rota, erro
    //         return BadRequest("Agendamento inválido");

    //     //Console.WriteLine(model.ExameId);

    //     //Verificar em post e put se ID do Paciente existem no banco, se não tiver, não salva
    //     // bool existePacienteBD = await context.Pacientes.AnyAsync(a => a.Id == model.PacienteId);

    //     // if(!existePacienteBD)
    //     // {
    //     //     // não salva, é necessário ID existente em tabela Pacientes
    //     //     return BadRequest("Paciente não identificado em base de dados! Tente novamente!");
    //     // }
    //     if (!await VerificarPacienteExistente(model.PacienteId))       
    //     {
    //         // não salva, é necessário ID existente em tabela Pacientes
    //         return BadRequest("Paciente não identificado! Tente novamente!");
    //     }                 

    //     //Verificar em post e put se ID do Exame existem no banco, se não tiver, não salva
    //     // bool existeExameBD = await context.Exames.AnyAsync(a => a.Id == model.ExameId);        
    //     // if(!existeExameBD)
    //     // {
    //     //     // não salva, é necessário ID existente em tabela Exames
    //     //     return BadRequest("Exame não identificado em base de dados! Tente novamente!");
    //     // }       
    //     if (!await VerificarExameExistente(model.ExameId))        
    //     {
    //         // não salva, é necessário ID existente em tabela Exames
    //         return BadRequest("Exame não identificado! Tente novamente!");
    //     }          

    //     // hora de inicio do agendamento não pode ser igual ou maior na hora do fim do agendamento
    //     if (model.HorIni >= model.HorFim)
    //     {
    //         return BadRequest("A data e hora de início não podem ser posteriores ou iguais à data e hora de término.");
    //     }          

    //     // caso exista agendamento de Exame para o mesmo dia e hora: NÃO SALVA
    //     // bool existeExameDuplicado = await context.Agendamentos.AnyAsync(a => a.ExameId == model.ExameId && a.HorIni == model.HorIni);
    //     // if(existeExameDuplicado)
    //     // {
    //     //     return BadRequest("Já existe Agendamento deste Exame para a hora informada! Tente novamente!");
    //     // }

    //     // caso exista agendamento com mesmo Paciente para o mesmo dia e hora: NÃO SALVA
    //      if (model.HorIni.HasValue)
    //     {
    //          // conversão para horário local
    //         // DateTime horIniPacDup = model.HorIni.Value.ToLocalTime();
    //         DateTime horIniPacDup = Funcoes.ConverterParaHorarioLocal(model.HorIni.Value);
    //         horIniPacDup = Funcoes.TruncarParaMinuto(horIniPacDup);
    //         // Console.WriteLine("ID Atual: " + model.Id);
    //         bool existePacienteDuplicado = await context.Agendamentos.AnyAsync(a => a.PacienteId == model.PacienteId && a.HorIni == horIniPacDup && a.Id != model.Id);
    //         if(existePacienteDuplicado)
    //         {
    //             return BadRequest("Já existe Agendamento para este Paciente na hora informada!");
    //         }        
    //     }          

    //     try
    //     {
    //         var msgResult = "Agendamento salvo com sucesso";
    //        // converte campo para data e hora local para evitar problemas com fuso horário
    //         // verifica antes se campo, que é anulável, tem valor
    //         // conversão para horário local
    //         // DateTime horIniLocal = model.HorIni.Value.ToLocalTime();
    //         // DateTime dtHoraAtual = DateTime.Now.ToLocalTime();
    //         DateTime horIniLocal = Funcoes.ConverterParaHorarioLocal(model.HorIni.Value);            
    //         if (model.HorIni.HasValue)
    //         {
    //             DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
    //             horIniLocal = Funcoes.TruncarParaMinuto(horIniLocal);                
    //             dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                                
    //             // Console.WriteLine(horIniLocal);
    //             // Console.WriteLine(dtHoraAtual);
    //             // Verifica se a hora de início é anterior à hora atual do servidor
    //             if (horIniLocal < dtHoraAtual)
    //             {
    //                 return BadRequest("A data e hora de início não podem ser anteriores à data atual.");
    //             }                 
    //             // altera campo 
    //             model.HorIni = horIniLocal;
    //         }
    //         // variaveis usadas na busca
    //         DateTime valDtAgend = horIniLocal;
    //         int pacienteCod = model.PacienteId;
    //         int exameCod = model.ExameId;

    //         // // verifica antes se campo, que é anulável, tem valor
    //         // if (model.HorFim.HasValue)
    //         // {
    //         //     // conversão para horário local
    //         //     // DateTime horFimLocal = model.HorFim.Value.ToLocalTime();
    //         //     DateTime horFimLocal = Funcoes.ConverterParaHorarioLocal(model.HorFim.Value);
    //         //     horFimLocal = Funcoes.TruncarParaMinuto(horFimLocal);  
    //         //     // altera campo 
    //         //     model.HorFim = horFimLocal;
    //         // }        

    //         // verifica antes se campo, que é anulável, tem valor
    //         // if (model.HorDes.HasValue)
    //         // {
    //         //     // conversão para horário local
    //         //     // DateTime horDesLocal = model.HorDes.Value.ToLocalTime();
    //         //     DateTime horDesLocal = Funcoes.ConverterParaHorarioLocal(model.HorDes.Value);
    //         //     horDesLocal = Funcoes.TruncarParaMinuto(horDesLocal);  
    //         //     // altera campo 
    //         //     model.HorDes = horDesLocal;
    //         // }                  


    //         //se não existe, erro, senão cria um novo tipo de curso
    //         if (!await context.Agendamentos.AnyAsync(p => p.Id == id))
    //             return NotFound("Agendamento inválido");
    //         context.Agendamentos.Update(model);
    //         await context.SaveChangesAsync();
    //         // após salvar busca dados para enviar email
    //         // nome do paciente 
    //         // string nomePaciente = await BuscaDadosPacienteID(item.PacienteId);
    //         var (pacienteNome, pacienteEmail)  = await BuscaDadosPacienteID(pacienteCod);
    //         // string exameNome = await BuscaDadosExameID(exameCod);
    //         var (exameNome, exameInstrucao) = await BuscaDadosExameID(exameCod);
    //         // var resultadoEmail = await emailService.EmailAgendamentoAsync(pacienteNome, pacienteEmail, exameNome, valDtAgend ,"",1);
    //         var resultadoEmail = await emailService.EmailAgendamentoAsync(pacienteNome, pacienteEmail, exameNome, exameInstrucao ,valDtAgend ,"",1);
    //         // pelo retorno informa sucesso ou não da conclusão
    //         if (!resultadoEmail.Sucesso)
    //             msgResult = "Agendamento salvo MAS E-mail NÃO enviado, tente enviar novamente";
    //             // return Ok("Agendamento salvo MAS E-mail NÃO enviado, tente enviar novamente");                        
    //         // return Ok("Agendamento salvo com sucesso");            
    //         return Ok(msgResult);            
    //     }
    //     catch(Exception ex)
    //     {
    //         // Aqui  pega a mensagem de erro da exceção
    //         string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
    //         Logger.EscreveLog("Agendamento - Put", errorMessage);
    //         // Console.WriteLine(errorMessage);
    //         // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
    //         return BadRequest("Agendamento: Erro ao salvar o Agendamento informado");
    //     }
    // }

    // [HttpDelete("{id}")]
    // public async Task<ActionResult> Delete([FromRoute] int id)
    // {
    //     try
    //     {
    //         Agendamento model = await context.Agendamentos.FindAsync(id);

    //         if (model == null)
    //             return NotFound("Agendamento inválido");

    //         context.Agendamentos.Remove(model);
    //         await context.SaveChangesAsync();
    //         return Ok("Agendamento removido com sucesso");
    //     }
    //     catch
    //     {
    //         return BadRequest("Falha ao remover o Agendamento");
    //     }
    // }

    [HttpGet("gridAgendamento")] 
    public async Task<ActionResult<IEnumerable<object>>> GridAgendamento()
    {
        try
        {
            // retorna Objeto JSON personalizado:
            // Dados de Agendamento, Exame e Pacientes para exibição em grid de Agendamento
            var resultado = await context.Agendamentos
            .Join(
                context.Exames, // informa tabela que participará do join
                agendamento => agendamento.ExameId, // apelido para primeira tabela: informo o campo para join
                exame => exame.Id, // apelido para segunda tabela: informo o campo para join
                (agendamento, exame) => new {agendamento, exame} // crio variavel(objeto anônimo) que tem os objetos agendamento e exame a ser usado no próximo Join
            )
            .Join(
                context.Pacientes, // informa tabela Pacientes para join com Agendamento e Exame
                agendamentoExame => agendamentoExame.agendamento.PacienteId, // é o alias para o objeto anônimo que tem Agendamento e Exame
                paciente => paciente.Id, // informa join entre agendamento e paciente
                (agendamentoExame,paciente) => new // crio objeto com dados finais que serão informados em resultado
                {
                    agendamentoExame.agendamento.Id,
                    agendamentoExame.agendamento.ExameId,
                    agendamentoExame.agendamento.PacienteId,
                    agendamentoExame.agendamento.HorIni,
                    agendamentoExame.agendamento.Status,
                    agendamentoExame.agendamento.HorFim,
                    agendamentoExame.agendamento.HorDes,
                    agendamentoExame.agendamento.MotDes,
                    ExameNome = agendamentoExame.exame.Nome, // Nome do Exame                    
                    PacienteNome = paciente.Nome
                })          
            //.OrderBy(x => x.HorIni) // Ordena por ordem de data de inicio
            .OrderByDescending(x => x.HorIni) // Ordena por decrescente
            .ThenBy(x => x.PacienteNome) // Se houver "empate" em HorIni, ordena por PacienteNome                
            .ToListAsync();
                
            // retorna objeto
            return Ok(resultado);            
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("GridAgendamento / Erro ", errorMessage);
            return BadRequest("Agendamento Grid: Não é possível buscar dados de Agendamento");
        }


    }

  [HttpGet("selectPacientes")]
    public async Task<ActionResult<IEnumerable<Paciente>>> SelectPacientes()
    {
        // lista pacientes por ordem de nome para uso em Agendamento
        try
        {
            List<Paciente> resultado = await context.Pacientes.OrderBy(a => a.Nome).ToListAsync();
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Agendamento - Select Paciente / Erro ", errorMessage);
            return BadRequest("Agendamento: erro ao listar Pacientes");
        }
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
            Logger.EscreveLog("Agendamento - Select Exame / Erro ", errorMessage);
            return BadRequest("Agendamento: erro ao listar Exames");
        }
    }      

    [HttpPost("gridTerminal")]
    public async Task<ActionResult<IEnumerable<object>>> GridTerminal([FromBody] TerminalQuery model)
    
    {
        // lista todos os agendamentos ativos (Status = 0) a partir da ID paciente informada
        // para o DIA ATUAL
        try
        {
            if (!await VerificarCPFExistente(model.CPF))
            {
             return BadRequest("Não foi possível identificar CPF informado!");   
            }

                // obtém data atual do servidor
                // DateTime dtAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now.Date);                
                DateTime dtAtual = DateTime.Now.Date;                
                // Console.WriteLine("Data Atual:");
                // Console.WriteLine(dtAtual); 

            // ao invés de join faz o uso de include 
            //pois em minhas models já tenho relacionamento PK e FK
            // retorna Objeto JSON personalizado (select com campos que desejo)
            // observe que é filtrado: 
            // a) agendamento ativo (status 0)
            // b) cpf do paciente
            // c) SOMENTE data dos agendamentos através de .Date
            var resultado = await context.Agendamentos
            .Where( a=> a.Status == 0 && a.Paciente.CPF == model.CPF && a.HorIni.Value.Date  ==  dtAtual.Date) // consigo mencionar Paciente.CPF pois em model Agendamento tem Paciente? que permite acessar
            .Include( a=> a.Exame) // carrega os dados de tabela Exame (devido a model) a partir da relação ExameID (Agendamento) = Id (Exame)
            .Include( a=> a.Paciente) // carrega os dados de tabela Paciente (devido a model) a partir da relação PacienteID (Agendamento) = Id (Paciente)            
            .Select( a=> new {
                a.Id, // id do agendamento
                a.ExameId, // ExameID do agendamento
                a.PacienteId, // PacienteID do Agendamento
                a.HorIni, // Horini do Agendamento
                a.Status, // Status do Agendamento
                ExameNome = a.Exame.Nome, // o campo ExameNome é um alias para o campo a.Exame.Nome (nome de tabela Exame)
                PacienteNome = a.Paciente.Nome, // o campo PacienteNome é um alias para o campo a.Paciente.Nome (nome de tabela Paciente)
                PacienteCPF = a.Paciente.CPF // o campo PacienteCPF é um alias para o campo a.Paciente.CPF (cpf de tabela Paciente)                
            }) // igual select de SQL: permite definir os campos que quero retornar
            .OrderBy( x=> x.HorIni) // Ordena por ordem de data de inicio
            .ThenBy( x => x.Id) // Se houver "empate" em HorIni, ordena por Id
            .ToListAsync();

             // retorna objeto
            return Ok(resultado);               
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Agendamento - Grid Terminal / Erro ", errorMessage);
            return BadRequest("Agendamento: Erro ao listar exames agendados para o paciente informado!");
        }
    }      

    [HttpPost("updateTerminal")]
    public async Task<ActionResult> ConfirmaPresencaTerminal([FromBody] TerminalUpdate model)
    {
        // realiza update para confirmar presença do paciente para os agendamentos
        // DO DIA
        try
        {
            // obtem data do servidor e compara com data do Json
            // pra atualizar é necessário que sejam as mesmas datas
            DateTime dtAtual = DateTime.Now; 
            // data com base na região local
            dtAtual = Funcoes.ConverterParaHorarioLocal(dtAtual);            
            // dtAtual = Funcoes.TruncarParaMinuto(dtAtual);
            dtAtual = Funcoes.TruncarParaSegundo(dtAtual);



            // a data da model NÃO é convertida para região local pois eu só informo nela a data (não tem hora)
            // por não ter hora não é necessário converter pra horário local
            // DateTime dtModel = Funcoes.ConverterParaHorarioLocal(model.DtAgenda.Date);
            DateTime dtModel = model.DtAgenda.Date;
            // Console.WriteLine(dtAtual);
            // Console.WriteLine(dtModel);
            if (dtModel != dtAtual.Date)
            {
                return BadRequest("Terminal: a confirmação de presença só pode ser feita para os exames DO DIA ATUAL!");   
            }

            var sqlUpd = "UPDATE AGENDAMENTOS set Status = 2, HorPresenca = {0} WHERE Status = 0 AND PacienteID = {1} AND CAST(HorIni AS DATE) = {2}";

            // realiza sql de update DIRETAMENTE no bd
            var rowsUpdated = await context.Database.ExecuteSqlRawAsync(
                sqlUpd,
                dtAtual,
                model.PacienteCod,
                dtModel);

            // Console.WriteLine(rowsUpdated);
            if (rowsUpdated > 0) 
            {
                return Ok($"Terminal: Sua presença foi confirmada para os {rowsUpdated} exame(s) agendado(s) para o dia de hoje! Por favor aguarde na sala de espera!");
            }   
            else
            {
                return BadRequest("Terminal: não foi possível confirmar presença para agendamentos do paciente!");   
            }            
        }
        catch(Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Agendamento - Update Terminal / Erro ", errorMessage);
            return BadRequest("Agendamento: erro ao confirmar presença para exames agendados!");
        }
    }      


    [HttpPost("gridAgendConf")]
    public async Task<ActionResult<IEnumerable<AgendConfGrid>>> ListaAgendConf([FromBody] AgendConfBusca model)
    {
        try
        {
            var msgResult = "";
            // Buscando o primeiro valor de TempoAtraso
            var valAtrasoMaximo = await context.Parametros
                .Where(p => p.AtrasoMaximo != null) // Certifica-se de pegar apenas os registros com TempoAtraso
                .Select(p => p.AtrasoMaximo)
                .FirstOrDefaultAsync();

            // Converte para TimeSpan (tempo máximo de espera) no formato DateTime
            var valAtrasoMaxSpan = TimeSpan.FromMinutes(valAtrasoMaximo);
            // var dtAgenda = Funcoes.ConverterParaHorarioLocal(model.DtAgenda.Date);
            var dtAgenda = model.DtAgenda.Date;
            // dtAgenda = Funcoes.TruncarParaMinuto(dtAgenda);
            // Console.WriteLine(model.DtAgenda.Date);
            // Obtenção dos agendamentos
            var agendamentos = await context.Agendamentos
                .Where(a => a.Status == 2) // 2 - agendamentos com presença confirmada e SEM dados confirmados
                .Where(a => a.HorIni != null && a.HorPresenca != null)
                .Where(a => a.HorFim == null)
                // .Where(a => a.HorIni.Value.Date == model.DtAgenda) // Compara HorIni com Data Agendamento
                .Where(a => a.HorIni.Value.Date == dtAgenda.Date) // Compara HorIni com Data Agendamento
                .Include(a => a.Exame) // carrega dados de Exame
                .Include(a => a.Paciente) // carrega dados de Paciente
                .ToListAsync();

            // agendamentos DENTRO do horário
            var dentroDoHorario = agendamentos
                    .Where(a => a.HorPresenca <= a.HorIni.Value.Add(valAtrasoMaxSpan))
                    .OrderBy(a => a.HorIni)
                    .Select(a => new AgendConfGrid
                    {
                        Id = a.Id,
                        HorIni = a.HorIni,
                        HorPresenca = a.HorPresenca,
                        Status = a.Status,
                        DadosOk = a.DadosOk,
                        PacienteId = a.PacienteId,
                        PacienteNome = a.Paciente.Nome,
                        ExameId = a.ExameId,
                        ExameNome = a.Exame.Nome,     
                        Confirmacao = a.Confirmacao,                   
                    })
                    .ToList();  

            var comAtraso = agendamentos
                    .Where(a => a.HorPresenca > a.HorIni.Value.Add(valAtrasoMaxSpan))
                    .OrderBy(a => a.HorIni)
                    .Select(a => new AgendConfGrid
                    {
                        Id = a.Id,
                        HorIni = a.HorIni,
                        HorPresenca = a.HorPresenca,
                        Status = a.Status,
                        DadosOk = a.DadosOk,
                        PacienteId = a.PacienteId,
                        PacienteNome = a.Paciente.Nome,
                        ExameId = a.ExameId,
                        ExameNome = a.Exame.Nome,
                        Confirmacao = a.Confirmacao,                                           
                    })
                    .ToList();                    

            // retorno dados separados juntos usando concat
            var filaFinal = dentroDoHorario
                .Concat(comAtraso)
                .ToList();

            return Ok(filaFinal);                         

        }
        catch(Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Agendamento - Confirmação de Dados Grid/ Erro ", errorMessage);
            return BadRequest("Agendamento: erro ao listar dados!");
        }
    }

    [HttpPost("dadosAgendConf")]
    public async Task<ActionResult> DadosAgendConf([FromBody] AgendConf model)
    {

        try
        {
            DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                
            dtHoraAtual = Funcoes.TruncarParaSegundo(dtHoraAtual);                

            // encontro o agendamento e armazeno na variável
            var agendamentoBD = await context.Agendamentos.FindAsync(model.AgendamentoId);
            if (agendamentoBD == null)
                return NotFound("Agendamento inválido (1)");

            // informo que dados estão confirmados para esse agendamento
            agendamentoBD.DadosOk = true;
            agendamentoBD.HorDados = dtHoraAtual;
            // salva alterações
            await context.SaveChangesAsync();
            return Ok("Dados confirmados com sucesso!");      
        }
        catch(Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Agendamento - Confirmação de Dados / Erro", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Agendamento: Erro ao salvar confirmação de dados");
        }
    }    


    [HttpPost("gridAtendimento")]
    public async Task<ActionResult<IEnumerable<AgendConfGrid>>> ListaAgendAtend([FromBody] AgendFinBusca model)
    {
        try
        {
            var msgResult = "";
            // DateTime dtAgendamento = Funcoes.ConverterParaHorarioLocal(model.DtAgenda.Date);     
            DateTime dtAgendamento = model.DtAgenda;     
            // dtAgendamento = Funcoes.TruncarParaMinuto(dtAgendamento);

            // Buscando o primeiro valor de TempoAtraso
            var valAtrasoMaximo = await context.Parametros
                .Where(p => p.AtrasoMaximo != null) // Certifica-se de pegar apenas os registros com TempoAtraso
                .Select(p => p.AtrasoMaximo)
                .FirstOrDefaultAsync();

            // Converte para TimeSpan (tempo máximo de espera) no formato DateTime
            var valAtrasoMaxSpan = TimeSpan.FromMinutes(valAtrasoMaximo);            

            // Console.WriteLine(dtAgendamento.Date);
            // Obtenção dos agendamentos com Paciente Presente e Dados confirmados
            // e pacienets que ainda não confirmaram presença
            var agendamentos = await context.Agendamentos
                .Where(a => a.Status == 0 || a.Status == 2) // 2 - agendamentos com presença confirmada
                // .Where(a => a.DadosOk == true) // 2 - agendamentos com dados confirmados
                .Where(a => a.HorIni.Value.Date == dtAgendamento.Date)
                .Include(a => a.Exame) // carrega dados de Exame
                .Include(a => a.Paciente) // carrega dados de Paciente
                .ToListAsync();

              // agendamentos DENTRO do horário
            var dentroDoHorario = agendamentos
                .Where(a => a.Status == 2) // confirmada presença
                .Where(a => a.HorPresenca <= a.HorIni.Value.Add(valAtrasoMaxSpan))
                .Where(a => a.NumFila == 0) // não entraram em nenhuma lista de espera
                .OrderBy(a => a.HorIni)
                .Select(a => new AgendAtendGrid
                {
                    Id = a.Id,
                    HorIni = a.HorIni,
                    HorPresenca = a.HorPresenca,
                    Status = a.Status,
                    DadosOk = a.DadosOk,
                    PacienteId = a.PacienteId,
                    PacienteNome = a.Paciente.Nome,
                    ExameId = a.ExameId,
                    ExameNome = a.Exame.Nome,
                    Convocacao = a.Convocacao                       
                })
                .ToList();  
            

            var comAtraso = agendamentos
                .Where(a => a.Status == 2) // confirmada presença
                .Where(a => a.HorPresenca > a.HorIni.Value.Add(valAtrasoMaxSpan))
                .Where(a => a.NumFila == 0) // não entraram em nenhuma lista de espera
                .OrderBy(a => a.HorIni)
                .Select(a => new AgendAtendGrid
                {
                    Id = a.Id,
                    HorIni = a.HorIni,
                    HorPresenca = a.HorPresenca,
                    Status = a.Status,
                    DadosOk = a.DadosOk,
                    PacienteId = a.PacienteId,
                    PacienteNome = a.Paciente.Nome,
                    ExameId = a.ExameId,
                    ExameNome = a.Exame.Nome,    
                    Convocacao = a.Convocacao                    
                })
                .ToList();       

            var comListaEspera = agendamentos
                .Where(a => a.Status == 2)      // presença confirmada
                .Where(a => a.NumFila > 0)      // já estão em alguma posição na fila
                .OrderBy(a => a.NumFila)        // ordenar pela posição na fila
                .Select(a => new AgendAtendGrid
                {
                    Id = a.Id,
                    HorIni = a.HorIni,
                    HorPresenca = a.HorPresenca,
                    Status = a.Status,
                    DadosOk = a.DadosOk,
                    PacienteId = a.PacienteId,
                    PacienteNome = a.Paciente.Nome,
                    ExameId = a.ExameId,
                    ExameNome = a.Exame.Nome,
                    Convocacao = a.Convocacao
                })
                .ToList();


            var naoConfirmados = agendamentos
                .Where(a => a.Status == 0) // SEM presença confirmada
                .OrderBy(a => a.HorIni)
                .Select(a => new AgendAtendGrid
                {
                    Id = a.Id,
                    HorIni = a.HorIni,
                    HorPresenca = a.HorPresenca,
                    Status = a.Status,
                    DadosOk = a.DadosOk,
                    PacienteId = a.PacienteId,
                    PacienteNome = a.Paciente.Nome,
                    ExameId = a.ExameId,
                    ExameNome = a.Exame.Nome,
                    Convocacao = a.Convocacao                        
                })
                .ToList();                    



            // retorno dados separados juntos usando concat
            var filaFinal = dentroDoHorario
                .Concat(comAtraso)
                .Concat(comListaEspera)     // adiciona aqui o comNumFila
                .Concat(naoConfirmados)
                .ToList();

            return Ok(filaFinal);                         

        }
        catch(Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Agendamento - Atendimento Grid/ Erro ", errorMessage);
            return BadRequest("Atendimento: erro ao listar dados!");
        }
    }


    [HttpPost("finaliza")]
    public async Task<ActionResult> FinalizaAtendimento([FromBody] AtendFinaliza model)
    {

        try
        {
            DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                
            dtHoraAtual = Funcoes.TruncarParaSegundo(dtHoraAtual);                

            // encontro o registro e armazeno na variável
            var agendamentoBD = await context.Agendamentos.FindAsync(model.AgendamentoId);
            if (agendamentoBD == null)
                return NotFound("Agendamento inválido (1)");

            // finaliza agendamentos que somente tem: status = 2 (presença confirmada) e dados confirmados
            if ( agendamentoBD.Status == 2 && agendamentoBD.DadosOk )
            {
                // informo que agendamento está finalizado
                agendamentoBD.Status = 5; // 5 = agendamento finalizado
                agendamentoBD.HorFim = dtHoraAtual;
                // salva alterações
                await context.SaveChangesAsync();
                return Ok("Agendamento finalizado com sucesso!");      
            }
            else
            {
                return BadRequest("Operação permitida somente para agendamentos com presença confirmada!");                      
            }
                
        }
        catch(Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Atendimento - Finalização / Erro", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Atendimento: Erro ao salvar dados de finalização");
        }
    }        

    [HttpPost("cancela")]
    public async Task<ActionResult> CancelaAgendamento([FromBody] AgendCancela model)
    {

        try
        {
            var msgResult = "Agendamento cancelado com sucesso!";
            DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                
            dtHoraAtual = Funcoes.TruncarParaSegundo(dtHoraAtual);                

            // encontro o registro e armazeno na variável
            var agendamentoBD = await context.Agendamentos.FindAsync(model.AgendamentoId);
            if (agendamentoBD == null)
                return NotFound("Agendamento inválido (1)");

            // cancela agendamentos que NÃO tiveram presença confirma (0) e que tiveram presença confirmada (2)
            // e que NÃO houve confirmação de dados (DadosOk = false)
            // if ( agendamentoBD.Status == 2 && agendamentoBD.DadosOk )
            if ((agendamentoBD.Status == 0 || agendamentoBD.Status == 2) && agendamentoBD.DadosOk == false)
            {
                // obtenho dados de paciente e exame:
                var (pacienteNome, pacienteEmail)  = await BuscaDadosPacienteID(agendamentoBD.PacienteId);
                // string exameNome = await BuscaDadosExameID(item.ExameId);
                var (exameNome, exameInstrucao) = await BuscaDadosExameID(agendamentoBD.ExameId);                
                // data agendamento
                DateTime valDtAgend = agendamentoBD.HorIni.Value;
                // informo que agendamento está cancelado
                agendamentoBD.Status = 1; // 1 = agendamento cancelado
                agendamentoBD.HorCancela = dtHoraAtual;
                // salva alterações
                await context.SaveChangesAsync();

                // envia e-mail
                var resultadoEmail = await emailService.EmailAgendamentoAsync(pacienteNome, pacienteEmail, exameNome, exameInstrucao, valDtAgend,"",2);
                // pelo retorno informa sucesso ou não da conclusão
                if (!resultadoEmail.Sucesso)
                    msgResult = "Agendamento cancelado MAS E-mail NÃO enviado, tente enviar novamente";
                // return Ok("Agendamento cancelado com sucesso!");      
                return Ok(msgResult);      
            }
            else
            {
                return BadRequest("Operação permitida somente para agendamentos com presença confirmada!");                      
            }
                
        }
        catch(Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Atendimento - Cancelamento / Erro", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Atendimento: Erro ao salvar dados de cancelamento");
        }
    }        

    [HttpPost("convocacao")]
    public async Task<ActionResult> ConvocaPaciente([FromBody] AtendConvocacao model)
    {

        try
        {
            DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                
            dtHoraAtual = Funcoes.TruncarParaSegundo(dtHoraAtual);                

            // encontro o registro e armazeno na variável
            var agendamentoBD = await context.Agendamentos.FindAsync(model.AgendamentoId);
            if (agendamentoBD == null)
                return NotFound("Agendamento inválido (1)");

            // caso agendamento já esteja com paciente CONVOCADO então NÃO permite chamar de novo
            if (agendamentoBD.Convocacao)
                return BadRequest("Paciente já foi chamado! Não é possível realizar nova convocação!");  

            // convoca pacientes somente com presença confirmada e dados verificados
            if ( agendamentoBD.Status == 2 && agendamentoBD.DadosOk )               
            {
                // informo que paciente está sendo convocado para o exame
                agendamentoBD.Convocacao = true;
                agendamentoBD.HorConvocacao = dtHoraAtual;
                // salva alterações
                await context.SaveChangesAsync();
                return Ok("Chamada do Paciente foi realizada com sucesso!");      
            }     
            else
            {
                return BadRequest("Operação permitida somente para agendamentos com presença confirmada!");                      
            }


        }
        catch(Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Atendimento - Chamada de Paciente / Erro", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Atendimento: Erro ao salvar dados de convocação");
        }
    }      

    [HttpPost("convocadados")]
    public async Task<ActionResult> ConvocaPacienteDados([FromBody] AtendConvocacao model)
    {

        try
        {
            DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                
            dtHoraAtual = Funcoes.TruncarParaSegundo(dtHoraAtual);                

            // encontro o registro e armazeno na variável
            var agendamentoBD = await context.Agendamentos.FindAsync(model.AgendamentoId);
            if (agendamentoBD == null)
                return NotFound("Agendamento inválido (1)");

            // caso agendamento já esteja com paciente CONVOCADO então NÃO permite chamar de novo
            if (agendamentoBD.Confirmacao)
                return BadRequest("Paciente já foi chamado para confirmar dados! Não é possível realizar nova convocação!");  

            // convoca pacientes somente com presença confirmada e dados verificados
            if ( agendamentoBD.Status == 2 && !agendamentoBD.DadosOk )               
            {
                // informo que paciente está sendo convocado para o exame
                agendamentoBD.Confirmacao = true;
                agendamentoBD.HorConfirmacao = dtHoraAtual;
                // salva alterações
                await context.SaveChangesAsync();
                return Ok("Chamada do Paciente (Conf. Dados) foi realizada com sucesso!");      
            }     
            else
            {
                return BadRequest("Operação permitida somente para agendamentos com presença confirmada!");                      
            }


        }
        catch(Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Atendimento - Chamada de Paciente (Conf. Dados) / Erro", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Atendimento: Erro ao salvar dados de convocação");
        }
    }          

    [HttpPost("ausenciapac")]
    public async Task<ActionResult> RegistraAusencia([FromBody] AtendAusencia model)
    {

        try
        {
            // Buscando o primeiro valor de TempoAtraso
            var valAtrasoMaximo = await context.Parametros
                .Where(p => p.AtrasoMaximo != null) // Certifica-se de pegar apenas os registros com TempoAtraso
                .Select(p => p.AtrasoMaximo)
                .FirstOrDefaultAsync();

            // Converte para TimeSpan (tempo máximo de espera) no formato DateTime EM DUAS VEZES
            var valAtrasoMaxAusencia = TimeSpan.FromMinutes(valAtrasoMaximo * 2);    

            DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                
            dtHoraAtual = Funcoes.TruncarParaSegundo(dtHoraAtual);                

            // encontro o usuário e armazeno na variável
            var agendamentoBD = await context.Agendamentos.FindAsync(model.AgendamentoId);
            if (agendamentoBD == null)
                return NotFound("Agendamento inválido (1)");


            // caso agendamento já esteja com paciente CONVOCADO então NÃO permite chamar de novo
            if (agendamentoBD.Convocacao)
                return BadRequest("Paciente já foi chamado! Não é possível realizar nova convocação!");      

            // agendamentos SEM presença confirmada e com tempo de atraso MAIOR QUE DUAS vezes o tempo de agendamento
            // permitem registrar ausência 
            Console.WriteLine("Hora do Agendamento:" + agendamentoBD.HorIni);
            Console.WriteLine("Minutos Máx. Atraso:" + valAtrasoMaxAusencia);
            // a hora atual precisa ser maior ao limite para estar ausente: hora agendamento + 2x o limite máximo de atraso
            DateTime horaBD = agendamentoBD.HorIni.Value;
            DateTime prazoAusencia = horaBD.Add(valAtrasoMaxAusencia); 
            Console.WriteLine("Ausência Permitida após:" + prazoAusencia);
            Console.WriteLine("Hora Atual:" + dtHoraAtual);
            if ( agendamentoBD.Status == 0 && dtHoraAtual > prazoAusencia )                   
            {
                // informo que paciente está ausente
                agendamentoBD.Status = 3;
                agendamentoBD.HorAusencia = dtHoraAtual;
                // salva alterações
                await context.SaveChangesAsync();
                return Ok("Registro de Ausência foi realizada com sucesso!");                      
            }
            else
            {
                // return BadRequest("Registro de Ausência permitido somente para o agendamento (sem presença) após " + prazoAusencia);      
                return BadRequest("Registro de Ausência permitido somente para o agendamento (sem presença) após " + prazoAusencia.ToString("dd/MM/yyyy HH'h'mm"));

            }
        }
        catch(Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Atendimento - Chamada de Paciente / Erro", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Atendimento: Erro ao salvar dados de ausência");
        }
    }        


    [HttpPost("desistenciapac")]
    public async Task<ActionResult> RegistraDesistencia([FromBody] AtendDesistencia model)
    {

        try
        {
            DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                
            dtHoraAtual = Funcoes.TruncarParaSegundo(dtHoraAtual);                

            // encontro o usuário e armazeno na variável
            var agendamentoBD = await context.Agendamentos.FindAsync(model.AgendamentoId);
            if (agendamentoBD == null)
                return NotFound("Agendamento inválido (1)");

            // desistencia permitida SOMENTE para agendamentos com presença confirmada
            if (agendamentoBD.Status != 2)
                return BadRequest("Desistência permitida somente para agendamentos com presença confirmada!");      

            // Console.WriteLine("Data Atual:" + dtHoraAtual.Date);
            // Console.WriteLine("Data Des (1):" + model.DtDes);
            
            // registra desistencia
            DateTime valDtDes = Funcoes.ConverterParaHorarioLocal(model.DtDes);
            valDtDes = Funcoes.TruncarParaSegundo(valDtDes);    


            // data e hora de desistência NÃO pode ser maior que a data e hora do servidor
            if (valDtDes > dtHoraAtual)
                return BadRequest("Hora de Desistência não pode ser maior que a data e hora atual!");                  

            // Console.WriteLine("Data Des (2):" + valDtDes);
            // aplico atualização no registro
            agendamentoBD.Status = 4; // informa desistência
            agendamentoBD.HorDes = valDtDes;
            agendamentoBD.MotDes = model.MotDes;
            // salva alterações
            await context.SaveChangesAsync();
            return Ok("Registro de Desistência foi realizada com sucesso!"); 
       }
        catch(Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Atendimento - Desistência de Paciente / Erro", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Atendimento: Erro ao salvar dados de desistência");
        }
    }        

    [HttpPost("listaesperapac")]
    public async Task<ActionResult> RegistraListaEspera([FromBody] AtendEspera model)
    {

        try
        {

            // encontro o registro e armazeno na variável
            var agendamentoBD = await context.Agendamentos.FindAsync(model.AgendamentoId);
            if (agendamentoBD == null)
                return NotFound("Agendamento inválido (1)");

            // obtem código do exame
            var codExame = agendamentoBD.ExameId;
            // obtém data do agendamento
            DateTime dtAgend = agendamentoBD.HorIni.Value;

            DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                
            dtHoraAtual = Funcoes.TruncarParaSegundo(dtHoraAtual);  


            // Buscar maior valor de NumFila com os filtros especificados
            var maiorNumFila = await context.Agendamentos
                .Where(a => a.Status == 2 
                            && a.DadosOk 
                            && a.Convocacao
                            && a.ExameId == codExame
                            && a.HorIni.Value.Date == dtAgend.Date)            
                .Select(a => (int?)a.NumFila) // Cast para int? para evitar erro se nenhum registro for encontrado e retorna null caso azio
                .MaxAsync() ?? 0; // se nenhum registro for encontrado, retorna 0

            // identifica nova posição na lista de espera
            int novoValorFila = 0;
            if (maiorNumFila == 0)
            {
                novoValorFila = 1; // começa a fila em 1 se ainda estiver vazia
            }
            else
            {
                novoValorFila = maiorNumFila + 1; // incrementa o último valor da fila
            }

            if ( agendamentoBD.Status == 2 && agendamentoBD.DadosOk && agendamentoBD.Convocacao )   
            {
                // informa posição na fila de espera
                agendamentoBD.NumFila = novoValorFila;
                agendamentoBD.HorFila = dtHoraAtual;
                // retira a convocação para realizar novamente chamada após atender os outros agendamentos (que não estavam na lista de espera)
                agendamentoBD.Convocacao = false;
                agendamentoBD.HorConvocacao = null;
                await context.SaveChangesAsync();
                return Ok("Registro de Lista de Espera foi realizada com sucesso! Posição Lista de Espera: " + novoValorFila);                      
            }
            else
            {
                return BadRequest("Registro de Lista de Espera permitido somente para o agendamento com presença confirmada, dados confirmados e paciente chamado para exame!");
            }

        }
        catch(Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Atendimento - Lista de Espera / Erro", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Atendimento: Erro ao salvar dados de lista de espera");
        }
    }       
        

    [Route("pesquisa")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Agendamento>>> Pesquisa([FromBody] object item)
    {
        // URL de exemplo para acessar: http://localhost:5175/api/Agendamento/pesquisa/
        // o conteúdo da pesquisa NÃO estará na rota, mas no corpo do Body (no Postman: raw + Json)
        // Abaixo exemplo de pesquisa de nome e e-mail enviando no body da requisição.
        // Perceba que os campos do body da requisição são IGUAIS como declarados na model. Pois parece que é case sensitive. 
        // Se colocar tudo minúsculo ou maiúsculo NÃO dá certo. Abaixo exemplo com os nomes iguais ao model Usuário:
//    {
//         "Nome": "Agendamento4",
//         "Email": "u4sr3@example.com"
//    }
        // Mas também você pode remover obrigação de capitalizar propriedades do Json igual estão declaradas na model
        // var options = new JsonSerializerOptions
        // {
        //     PropertyNameCaseInsensitive = true // Permite que a capitalização das propriedades seja ignorada
        // };                  
        // Perceba que está como Nome e Email assim pois na model está declarado da mesma forma
        // aqui é pesquisa EXATA (where campo = "%valor%") que se deseja pesquisar no campo nome da tabela em questão        
        // a pesquisa daqui irá buscar o registro cujas colunas tenham os dois valores informados no body (lembre-se, é um where + and)
        
        try
        {
            // JsonSerializer exige using System.Text.Json;
            // removo obrigação de capitalizar propriedades do Json igual estão declaradas na model
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true // Permite que a capitalização das propriedades seja ignorada
            };            

            Agendamento model = JsonSerializer.Deserialize<Agendamento>(item.ToString(),options);

            List<Agendamento> resultado = await context.Agendamentos
                .WhereIf(model.MotDes != null, p => p.MotDes == model.MotDes).ToListAsync();            
                // .WhereIf(model.MotDes != null, p => p.MotDes == model.MotDes)
                // .WhereIf(model.Email != null, p => p.Email == model.Email).ToListAsync();

            return Ok(resultado);
        }
        catch
        {
            return BadRequest();
        }
    }    
}


