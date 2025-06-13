using System.ComponentModel.DataAnnotations;

// DTO será usado:
// a) ResumoBusca: usado para informar model do body de requisição ao listar dados
// b) AgendFinaliza: usado para finalizar agendamento
// c) ResumoGrid: dados exibidos na grid de resumo
// d) ResumoDetalhe: dados exibidos no detalhamento


public class ResumoBusca
{
    
    [Required(ErrorMessage = "Data do agendamento é obrigatório")]    
    public DateTime DtAgenda { get; set; }  // Data de agendamento do exame (parte da hora será ignorada)
    public int? ExameID { get; set; }
    public int? PacienteID { get; set; }
    public int? SitAgenda { get; set; }
}

public class ResumoGrid
{
    
    public int Id { get; set; } 
    public DateTime? DtAgenda { get; set; }  // Data e hora de início do exame

    public int Status { get; set; }  // Status Agendamento

    public int PacienteId { get; set; } 
    public string PacienteNome { get; set; }  

    public int ExameId { get; set; } 
    public string ExameNome { get; set; }  

    public DateTime? HorOperacao { get; set; }  // Data e hora que paciente confirmou exame    
    
}

public class ResumoDetalhe
{
    
    public int Id { get; set; } 
    public DateTime? DtAgenda { get; set; }  // Data e hora de início do exame

    public int Status { get; set; }  // Status Agendamento

    public int PacienteId { get; set; } 
    public string PacienteNome { get; set; }  

    public int ExameId { get; set; } 
    public string ExameNome { get; set; }  

    public DateTime? HorPresenca { get; set; }

    public DateTime? HorFim { get; set; }  // Data e hora de fim do exame    

    public DateTime? HorDes { get; set; }  // Data e hora da desistência

    public string? MotDes { get; set; }  // motivo da desistência

    public bool DadosOk { get; set; } 

    public DateTime? HorDados { get; set; }  // Data e hora da desistência  
    public bool Convocacao { get; set; }

    public DateTime? HorConvocacao { get; set; } 

    public DateTime? HorAusencia { get; set; }  

    public DateTime? HorCancela { get; set; }  

    public DateTime? HorLancto { get; set; }  

    public bool Confirmacao { get; set; }  
    public DateTime? HorConfirmacao { get; set; }  

    public int NumFila { get; set; }
    public DateTime? HorFila { get; set; }  



    
}