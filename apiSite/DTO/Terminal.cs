using System.ComponentModel.DataAnnotations;

// DTO será usada somente na api
// no arquivo Terminal.cs há dois modelos:
// a) TerminalQuery: usada ao pesquisar CPF 
// b) TerminalUpdate: usada ao solicitar update

public class TerminalQuery
{
    [Required(ErrorMessage = "O CPF é obrigatório.")]
    [RegularExpression(@"^\d{11}$", ErrorMessage = "O CPF deve conter exatamente 11 dígitos.")]
    [MaxLength(11, ErrorMessage = "CPF deve ter no máximo 11 digitos")]    
    //CPF formatado: [RegularExpression(@"^\d{3}\.\d{3}\.\d{3}-\d{2}$", ErrorMessage = "O CPF deve estar no formato XXX.XXX.XXX-XX.")]    
    public string CPF { get; set; }  // CPF do paciente (apenas números, 11 dígitos)

}

public class TerminalUpdate
{
    [Required(ErrorMessage = "Código do Paciente é obrigatório.")]
    public int PacienteCod { get; set; }  // Código/ID do paciente
    [Required(ErrorMessage = "Data do agendamento é obrigatório")]    
    public DateTime DtAgenda { get; set; }  // Data de agendamento do exame (parte da hora será ignorada)

}