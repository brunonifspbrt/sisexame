using System.ComponentModel.DataAnnotations;

// DTO será usado:
// a) DashSecBusca: usado para informar model do body de requisição ao listar dados de secretaria

public class DashSecBusca
{
    
    [Required(ErrorMessage = "Data do agendamento é obrigatório")]    
    public DateTime DtAgenda { get; set; }  // Data de agendamento do exame (parte da hora será ignorada)
}

