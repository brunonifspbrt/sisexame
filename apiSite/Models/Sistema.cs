using System.ComponentModel.DataAnnotations;

// controla se o sistema foi inicializado
// isto é: criou-se usuário administrador na primeira vez que acessou sistema
public class Sistema
{
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "Necessário informar data de inicialização do sistema")]    
    public DateTime DataInicializacao { get; set; }

    [Required(ErrorMessage = "Necessário informar status de inicialização do sistema")]    
    public bool Inicializado { get; set; }
}
