using System.ComponentModel.DataAnnotations;

// o campo enum permite dar nome a valores ao invés de usar somente números no código
// o que facilita é que para o código abaixo, os três valores são: 0,1,2

public class Parametro
{
    // public DateTime? = campo datetime criado permitindo NULO

    // Quando precisar definir tamanho do campo:
    // a) aplique [MaxLength(200, ErrorMessage = "E-mail deve possuir, no máximo, 200 caracteres")]    
    // b) aplique [Column(TypeName = "varchar(300)")]    

    [Required]
    // no post NÃO é passado o ID no body. A Api aceita sem passar o campo ID
    public int Id { get; set; } 

    [Required(ErrorMessage = "Atraso máximo do paciente é obrigatório")]    
    [Range(10, 120, ErrorMessage = "Atraso máximo do paciente deve ser no mínimo 10 minutos e máximo de 2 horas (120 minutos).")]    
    public int AtrasoMaximo { get; set; }  // Tempo, em minutos, permitido de atraso de comparecimento de paciente
  
}

