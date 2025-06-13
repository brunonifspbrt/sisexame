using System.ComponentModel.DataAnnotations;

// DTO será usado:
// a) SistemaBody: usado para informar model do body de registro de usuário 



public class SistemaBody
{
    [Required(ErrorMessage = "O nome é obrigatório")]
    [MinLength(5,ErrorMessage = "Nome deve ter no mínimo 5 caracteres")]
    [MaxLength(200, ErrorMessage = "O nome deve possuir, no máximo, 200 caracteres")]
    public string Nome { get; set; } // Nome 

    [Required(ErrorMessage = "E-mail é obrigatório")]
    [EmailAddress(ErrorMessage = "Preencha o campo com e-mail válido")]
    public string Email { get; set; } // E-mail 

    [Required(ErrorMessage = "Senha é obrigatório")]
    public string Senha { get; set; } // Senha (hash + salt)

    [Required(ErrorMessage = "Atraso máximo do paciente é obrigatório")]    
    [Range(10, 120, ErrorMessage = "Atraso máximo do paciente deve ser no mínimo 10 minutos e máximo de 2 horas (120 minutos).")]    
    public int Atraso { get; set; }  // Tempo, em minutos, permitido de atraso de comparecimento de paciente

}

