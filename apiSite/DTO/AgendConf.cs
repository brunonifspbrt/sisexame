using System.ComponentModel.DataAnnotations;

// DTO será usado:
// a) AgendConfBusca: usado para informar model do body de requisição ao listar dados
// b) AgendConf: usado para informar model do body de requisição ao listar dados
// c) AgendConfGrid: dados exibidos na grid de agendamentos com presença já confirmada

public class AgendConfBusca
{
    
    [Required(ErrorMessage = "Data do agendamento é obrigatório")]    
    public DateTime DtAgenda { get; set; }  // Data de agendamento do exame (parte da hora será ignorada)
}

public class AgendConf
{
    
    [Required(ErrorMessage = "ID do Agendamento é obrigatório")]
    public int AgendamentoId { get; set; } 
}


public class AgendConfGrid
{
    
    public int Id { get; set; } 
    public DateTime? HorIni { get; set; }  // Data e hora de início do exame

    public DateTime? HorPresenca { get; set; }  // Data e hora que paciente confirmou exame    

    public int Status { get; set; }  // Status Agendamento

    public bool DadosOk { get; set; } 

    public int PacienteId { get; set; } 
    public string PacienteNome { get; set; }  

    public int ExameId { get; set; } 
    public string ExameNome { get; set; }  

    public bool Confirmacao { get; set; }  
}

