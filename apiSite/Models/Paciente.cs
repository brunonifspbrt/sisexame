using System.ComponentModel.DataAnnotations;


public class Paciente
{
    // Quando precisar definir tamanho do campo:
    // a) aplique [MaxLength(200, ErrorMessage = "E-mail deve possuir, no máximo, 200 caracteres")]    
    // b) aplique [Column(TypeName = "varchar(300)")]

    [Required]
    // no post NÃO é passado o ID no body. A Api aceita sem passar o campo ID
    public int Id { get; set; }  // Identificador único do paciente

    [Required(ErrorMessage = "O CPF é obrigatório.")]
    [RegularExpression(@"^\d{11}$", ErrorMessage = "O CPF deve conter exatamente 11 dígitos.")]
    [MaxLength(11, ErrorMessage = "CPF deve ter no máximo 11 digitos")]    
    //CPF formatado: [RegularExpression(@"^\d{3}\.\d{3}\.\d{3}-\d{2}$", ErrorMessage = "O CPF deve estar no formato XXX.XXX.XXX-XX.")]    
    public string CPF { get; set; }  // CPF do paciente (apenas números, 11 dígitos)

    [Required(ErrorMessage = "O nome é obrigatório.")]
    [MinLength(5,ErrorMessage = "Nome deve ter no mínimo 5 caracteres")]
    [MaxLength(200, ErrorMessage = "O nome não pode ter mais de 200 caracteres.")]
    public string Nome { get; set; }  // Nome completo do paciente

    [Required(ErrorMessage = "E-mail é obrigatório")]
    [MinLength(6,ErrorMessage = "E-mail deve ter ao menos 6 caracteres")]
    [MaxLength(200, ErrorMessage = "E-mail deve possuir, no máximo, 200 caracteres")]        
    [EmailAddress(ErrorMessage = "Preencha o campo com e-mail válido")]
    public string Email { get; set; }  // E-mail do paciente

    [Required(ErrorMessage = "A data de nascimento é obrigatória.")]
    // [Range(typeof(DateTime), "01-01-1900", "31-12-2050", ErrorMessage = "A data deve estar entre 01/01/1900 e 31-12-2050")]
    [Range(typeof(DateTime), "1900-01-01", "2050-12-31", ErrorMessage = "A data deve estar entre 01/01/1900 e 31/12/2050.")] 
    public DateTime DataNascimento { get; set; }  // Data de nascimento do paciente

    [Required(ErrorMessage = "Status do Paciente é obrigatório")]
    public bool Ativo { get; set; }  // Status de ativo ou não do paciente

    [MaxLength(500, ErrorMessage = "Observação não pode ter mais de 500 caracteres.")]
    public string? Obs { get; set; }  // Nome completo do paciente


}

