using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// o campo enum permite dar nome a valores ao invés de usar somente números no código
// o que facilita é que para o código abaixo, os três valores são: 0,1,2
// public enum TipoUsuario
// {
//     // Valores: Administracao = 0, Secretaria = 1, Paciente = 2
//     Administracao,  // (cadastro de informações iniciais, manutenção de usuários, etc.)
//     Secretaria,     // coleta de informações dos pacientes e fluxo de atendimento
//     Paciente        // fornecer dados sobre exames
// }


public class Usuario
{
    // public DateTime? = campo datetime criado permitindo NULO

    // Quando precisar definir tamanho do campo:
    // a) aplique [MaxLength(200, ErrorMessage = "E-mail deve possuir, no máximo, 200 caracteres")]    
    // b) aplique [Column(TypeName = "varchar(300)")]

    [Required]
    // no post NÃO é passado o ID no body. A Api aceita sem passar o campo ID
    public int Id { get; set; } 

    [Required(ErrorMessage = "O nome é obrigatório")]
    [MinLength(5,ErrorMessage = "Nome deve ter no mínimo 5 caracteres")]
    [MaxLength(200, ErrorMessage = "O nome deve possuir, no máximo, 200 caracteres")]
    public string Nome { get; set; } // Nome 
   
    [Required(ErrorMessage = "E-mail é obrigatório")]
    [MinLength(6,ErrorMessage = "E-mail deve ter ao menos 6 caracteres")]
    [MaxLength(200, ErrorMessage = "E-mail deve possuir, no máximo, 200 caracteres")]    
    [EmailAddress(ErrorMessage = "Preencha o campo com e-mail válido")]
    public string Email { get; set; } // E-mail 
    
    public string? Foto { get; set; } // Caminho ou URL da foto
  
    //[Required] para o administrador não é obrigatório, para os demais sim
    //para o administrador não é obrigatório, para os demais sim
    // [Range(typeof(DateTime), "01-01-1900", "31-12-2050", ErrorMessage = "A data deve estar entre 01/01/1900 e 31-12-2050")]
    [Range(typeof(DateTime), "1900-01-01", "2050-12-31", ErrorMessage = "A data deve estar entre 01/01/1900 e 31/12/2050.")] 
    public DateTime DtNasc { get; set; } // Data de nascimento do usuário
  
//    [Required(ErrorMessage = "Senha é obrigatório")]
//    [MinLength(6,ErrorMessage = "Senha deve ter ao menos 6 caracteres")]
    public string? Senha { get; set; } // Senha (hash + salt)
    public string? SenhaTemp { get; set; } // Senha temporaria que armazena código de acesso
  
    [Required]
    // public TipoUsuario Tipo { get; set; } // Tipo de usuário (Administração, Secretaria, Paciente) internamente o valor será: 0,1,2
    [Range(0, 1, ErrorMessage = "Tipo de usuário deve ser Administração ou Secretaria!")]
    public byte Tipo { get; set; } // Tipo de usuário (Administração, Secretaria) internamente o valor será: 0,1
    
    [Required(ErrorMessage = "Status do Usuário é obrigatório")]
    public bool Ativo { get; set; } // Indica se o usuário está ativo ou inativo

    // se nulo implica
    // public DateTime? DataCriacao { get; set; } // ? = permite nulo ; Data de criação do usuário (definida ao criar o usuário)
    public DateTime? DtUltAcesso { get; set; } // ? = permite nulo ; data do último acesso (permite saber quem nunca acessou sistema)
  
    // para a troca de e-mail aqui ficará o e-mail novo até o código (de troca de e-mail) for utilizado
    // caso não seja utilizado o campo ficará com o e-mail que "planejou" ser o novo
    [MaxLength(200, ErrorMessage = "Novo e-mail deve possuir, no máximo, 200 caracteres")]    
    public string? EmailTemp { get; set; } // E-mail temporário (novo e-mail aguardando confirmação)
    // caso ocorra troca de e-mail guarda o código de verificação
    public string? CodigoVerEmail { get; set; } // Código para confirmar troca de e-mail (caso necessário)
  
    public DateTime? DtUltTrocaEmail { get; set; } // Data da última alteração de senha
   
    // caso ocorra troca de senha guarda o código de verificação
    public string? CodigoVerSenha { get; set; } // Código para confirmar alteração de senha
   
    public DateTime? DtUltTrocaSenha { get; set; } // Data da última alteração de senha

    // Algumas operações:
    // 0 ou null - não tem nada "pendente"
    // 1- Alteração de senha
    // 2- Alteração de e-mail
    // 3- Define que usuário foi criado e é o primeiro acesso
    public byte? Operacao { get; set; } 

    [NotMapped]
    public string? UrlSite { get; set; } // informa caminho do site

    [NotMapped]
    public string? CodIni { get; set; } // codigo de verificação inicial para primeiro acesso

    [NotMapped]
    public string? CodIniHash { get; set; } // codigo de verificação inicial hash para primeiro acesso    
}
