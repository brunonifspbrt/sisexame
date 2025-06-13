using System.ComponentModel.DataAnnotations;

// DTO será usado:
// a) LoginBusca: usado para informar model do body de requisição ao fazer login



public class LoginBusca
{
    
    [Required(ErrorMessage = "E-mail é obrigatório")]
    [EmailAddress(ErrorMessage = "Preencha o campo com e-mail válido")]
    public string Email { get; set; } // E-mail 

    [Required(ErrorMessage = "Senha é obrigatório")]
    public string Senha { get; set; } // Senha (hash + salt)
}

