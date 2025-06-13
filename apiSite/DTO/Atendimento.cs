using System.ComponentModel.DataAnnotations;

// DTO será usado:
// a) AgendFinBusca: usado para informar model do body de requisição ao listar dados
// b) AgendFinaliza: usado para finalizar agendamento
// c) AgendConfGrid: dados exibidos na grid de agendamentos com presença já confirmada


public class AgendFinBusca
{
    
    [Required(ErrorMessage = "Data do agendamento é obrigatório")]    
    public DateTime DtAgenda { get; set; }  // Data de agendamento do exame (parte da hora será ignorada)
}

public class AgendAtendGrid
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

    public bool Convocacao { get; set; }  
}

public class AtendFinaliza
{
    
    [Required(ErrorMessage = "ID do Agendamento é obrigatório")]
    public int AgendamentoId { get; set; } 
}

public class AtendConvocacao
{
    
    [Required(ErrorMessage = "ID do Agendamento é obrigatório")]
    public int AgendamentoId { get; set; } 
}

public class AtendAusencia
{
    
    [Required(ErrorMessage = "ID do Agendamento é obrigatório")]
    public int AgendamentoId { get; set; } 
}

public class AtendDesistencia
{
    
    [Required(ErrorMessage = "ID do Agendamento é obrigatório")]
    public int AgendamentoId { get; set; } 
    [Required(ErrorMessage = "Data da desistência é obrigatório")]    
    public DateTime DtDes { get; set; }  // Data de desistencia
    [MaxLength(200, ErrorMessage = "Motivo não pode ter mais de 200 caracteres.")]
    public string MotDes { get; set; } // motivo da desistencia
}

public class AtendEspera
{
    
    [Required(ErrorMessage = "ID do Agendamento é obrigatório")]
    public int AgendamentoId { get; set; } 
}


