using System.ComponentModel.DataAnnotations;

// DTO será usada somente na api
// no arquivo há  modelos:
// a) AgendReenviaEmail: usado para reenviar e-mails (na tela de lançamento de Agendamento)

public class AgendReenviaEmail
{
    [Required(ErrorMessage = "Código do Agendamento é obrigatório.")]
    public int AgendamentoId { get; set; }
}

public class AgendCancela
{
    [Required(ErrorMessage = "Código do Agendamento é obrigatório.")]
    public int AgendamentoId { get; set; }
}

public class AgendEdicao
{
    [Required(ErrorMessage = "Código do Agendamento é obrigatório.")]
    public int Id { get; set; }

    [Required(ErrorMessage = "Código do Paciente é obrigatório.")]
    public int PacienteId { get; set; } 

    [Required(ErrorMessage = "Código do Exame é obrigatório.")]
    public int ExameId { get; set; } 

    [Required(ErrorMessage = "Horário do exame é obrigatório.")]
    public DateTime HorIni { get; set; }  // Data e hora de início do exame
}

