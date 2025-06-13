using System.ComponentModel.DataAnnotations;

// o campo enum permite dar nome a valores ao invés de usar somente números no código
// o que facilita é que para o código abaixo, os três valores são: 0,1,2

public class Exame
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

    [Required(ErrorMessage = "Descrição é obrigatório")]
    [MinLength(5,ErrorMessage = "Descrição deve ter no mínimo 5 caracteres")]
    [MaxLength(250, ErrorMessage = "Descrição deve possuir, no máximo, 250 caracteres")]
    public string Descricao { get; set; } 

    [Required(ErrorMessage = "Duração padrão do exame é obrigatório")]    
    [Range(10, 600, ErrorMessage = "A duração padrão do exame deve ser no mínimo 10 minutos.")]    
    public int Duracao { get; set; }  // Tempo, em minutos, que o exame leva para ser realizado

    [Required(ErrorMessage = "Instruções de preparo é obrigatório")]
    [MinLength(5,ErrorMessage = "Instruções de preparo deve ter no mínimo 5 caracteres")]
    [MaxLength(300, ErrorMessage = "Instruções de preparo deve possuir, no máximo, 300 caracteres")]
    public string Instrucoes { get; set; }  // Instruções de preparo para o paciente

    [Required(ErrorMessage = "Status do exame é obrigatório")]
    public bool Ativo { get; set; }  // Define se o tipo de exame está ativo ou inativo
   
}

