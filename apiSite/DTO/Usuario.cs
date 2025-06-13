using System.ComponentModel.DataAnnotations;

// DTO usado para cenários abaixo:
// a) UsuarioSenha - ao atualizar senha
// b) UsuarioAltSenha - ao solicitar alteração de senha
public class UsuarioSenha
{
    [Required(ErrorMessage = "ID do Usuário é obrigatório")]    
    public int Id { get; set; }  // Código/ID do paciente
    // public int? Id { get; set; }  // Código/ID do paciente

    [Required(ErrorMessage = "Código de verificação é obrigatório")]    
    public string CodVer { get; set; } // Senha (hash + salt)
    
    [Required(ErrorMessage = "Nova Senha é obrigatório")]    
    [MinLength(6,ErrorMessage = "Nova Senha deve ter no mínimo 6 caracteres")]
    // [MaxLength(20, ErrorMessage = "Nova Senha deve ter no máximo 20 caracteres")]    
    public string SenhaNova { get; set; } // Senha (hash + salt)
    [Required(ErrorMessage = "Confirmação de Senha é obrigatório")]   
    [MinLength(6,ErrorMessage = "Confirmação de Senha deve ter no mínimo 6 caracteres")]
    // [MaxLength(20, ErrorMessage = "Confirmação de Senha deve ter no máximo 20 caracteres")]         
    public string SenhaConfirma { get; set; } // Senha (hash + salt)
}

public class UsuarioSenha2
{
    [Required(ErrorMessage = "ID do Usuário é obrigatório")]    
    public int UsuarioID { get; set; }  // Código/ID do paciente

    [Required(ErrorMessage = "Senha Atual é obrigatório")]    
    [MinLength(6,ErrorMessage = "Senha Atual deve ter no mínimo 6 caracteres")]
    // [MaxLength(20, ErrorMessage = "Nova Senha deve ter no máximo 20 caracteres")]    
    public string SenhaAntiga { get; set; } // Senha (hash + salt)   
    [Required(ErrorMessage = "Nova Senha é obrigatório")]    
    [MinLength(6,ErrorMessage = "Nova Senha deve ter no mínimo 6 caracteres")]
    // [MaxLength(20, ErrorMessage = "Nova Senha deve ter no máximo 20 caracteres")]    
    public string SenhaNova { get; set; } // Senha (hash + salt)
    [Required(ErrorMessage = "Confirmação de Senha é obrigatório")]   
    [MinLength(6,ErrorMessage = "Confirmação de Senha deve ter no mínimo 6 caracteres")]
    // [MaxLength(20, ErrorMessage = "Confirmação de Senha deve ter no máximo 20 caracteres")]         
    public string SenhaConfirma { get; set; } // Senha (hash + salt)
}


public class UsuarioAltSenha
{
    [Required(ErrorMessage = "Código do Usuário é obrigatório.")]
    public int UsuarioId { get; set; }  // Código/ID do usuario

    [Required(ErrorMessage = "Não foi possível identificar origem do website")]
    public string UrlSite { get; set; } // informa caminho do site
    
}


public class UsuarioEmail
{  
     [Required(ErrorMessage = "Código do Usuário é obrigatório.")]
    public int Id { get; set; }  // Código/ID do usuario

    [Required(ErrorMessage = "Código de verificação é obrigatório")]    
    public string CodVer { get; set; } // Senha (hash + salt)     
    

}

public class UsuarioAltEmail
{
    [Required(ErrorMessage = "Código do Usuário é obrigatório.")]
    public int UsuarioId { get; set; }  // Código/ID do usuario

    [Required(ErrorMessage = "E-mail é obrigatório")]
    [MinLength(6,ErrorMessage = "E-mail deve ter ao menos 6 caracteres")]
    [MaxLength(200, ErrorMessage = "E-mail deve possuir, no máximo, 200 caracteres")]        
    [EmailAddress(ErrorMessage = "Preencha o campo com e-mail válido")]
    public string EmailNovo { get; set; }  // E-mail do paciente    

    [Required(ErrorMessage = "Não foi possível identificar origem do website")]
    public string UrlSite { get; set; } // informa caminho do site
    
}

public class UsuarioEmailInicial
{
    [Required(ErrorMessage = "Código do Usuário é obrigatório.")]
    public int UsuarioId { get; set; }  // Código/ID do usuario
    [Required(ErrorMessage = "Não foi possível identificar origem do website")]
    public string UrlSite { get; set; } // informa caminho do site
 
}

// usado pra rota post já que usa FormData
public class UsuarioPost
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [MinLength(5, ErrorMessage = "Nome deve ter no mínimo 5 caracteres.")]
    [MaxLength(200, ErrorMessage = "O nome deve possuir, no máximo, 200 caracteres.")]
    public string Nome { get; set; }

    [Required(ErrorMessage = "E-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    [MaxLength(200, ErrorMessage = "E-mail deve possuir, no máximo, 200 caracteres.")]
    public string Email { get; set; }

    // [Range(typeof(DateTime), "01-01-1900", "31-12-2050", ErrorMessage = "A data deve estar entre 01/01/1900 e 31-12-2050")]
    [Range(typeof(DateTime), "1900-01-01", "2050-12-31", ErrorMessage = "A data deve estar entre 01/01/1900 e 31/12/2050.")] 
    public DateTime DtNasc { get; set; } // Data de nascimento do usuário

    [Required]
    // public TipoUsuario Tipo { get; set; } // Tipo de usuário (Administração, Secretaria, Paciente) internamente o valor será: 0,1,2
    [Range(0, 1, ErrorMessage = "Tipo de usuário deve ser Administração ou Secretaria!")]
    public byte Tipo { get; set; }

    [Required(ErrorMessage = "O status do usuário é obrigatório.")]
    public bool Ativo { get; set; }

    [Required(ErrorMessage = "Origem/site da requisição é obrigatório")]
    public string UrlSite { get; set; }

    [Required(ErrorMessage = "Código Vericação é obrigatório")]
    public string CodIni { get; set; }

    [Required(ErrorMessage = "Código Vericação 2 é obrigatório")]
    public string CodIniHash { get; set; }    
}

// usado pra rota put já que usa FormData
public class UsuarioPut
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome é obrigatório.")]
    [MinLength(5, ErrorMessage = "Nome deve ter no mínimo 5 caracteres.")]
    [MaxLength(200, ErrorMessage = "O nome deve possuir, no máximo, 200 caracteres.")]
    public string Nome { get; set; }

    [Required(ErrorMessage = "E-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    [MaxLength(200, ErrorMessage = "E-mail deve possuir, no máximo, 200 caracteres.")]
    public string Email { get; set; }

    // [Range(typeof(DateTime), "01-01-1900", "31-12-2050", ErrorMessage = "A data deve estar entre 01/01/1900 e 31-12-2050")]
    [Range(typeof(DateTime), "1900-01-01", "2050-12-31", ErrorMessage = "A data deve estar entre 01/01/1900 e 31/12/2050.")] 
    public DateTime DtNasc { get; set; } // Data de nascimento do usuário

    [Required]
    // public TipoUsuario Tipo { get; set; } // Tipo de usuário (Administração, Secretaria, Paciente) internamente o valor será: 0,1,2
    [Range(0, 1, ErrorMessage = "Tipo de usuário deve ser Administração ou Secretaria!")]
    public byte Tipo { get; set; }

    [Required(ErrorMessage = "O status do usuário é obrigatório.")]
    public bool Ativo { get; set; }

    [Required(ErrorMessage = "Origem/site da requisição é obrigatório")]
    public string UrlSite { get; set; }
}