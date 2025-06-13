using System.ComponentModel.DataAnnotations;

// o campo enum permite dar nome a valores ao invés de usar somente números no código
// o que facilita é que para o código abaixo, os três valores são: 0,1,2

public class Agendamento
{
    // public DateTime? = campo datetime criado permitindo NULO

    // Quando precisar definir tamanho do campo:
    // a) aplique [MaxLength(200, ErrorMessage = "E-mail deve possuir, no máximo, 200 caracteres")]    
    // b) aplique [Column(TypeName = "varchar(300)")]    

    [Required]
    // no post NÃO é passado o ID no body. A Api aceita sem passar o campo ID
    public int Id { get; set; } 

    [Required]
    // id do exame
    public int ExameId { get; set; } 
 
    // Propriedade de navegação: sem ela NÃO é possível definir a relação FK
    // um agendamento está associada a um único Exame
    public Exame? Exame { get; set; }    

     [Required]
    // id do Paciente
    public int PacienteId { get; set; } 

    // Propriedade de navegação: sem ela NÃO é possível definir a relação FK
    // um agendamento está associada a um único Paciente
    public Paciente? Paciente { get; set; }   

    // Aplicando a validação personalizada para o campo Horario
    [Required(ErrorMessage = "Horário do exame é obrigatório")]
    // [HorarioValido(ErrorMessage = "O horário ou a data fornecidos não são válidos.")]
    public DateTime? HorIni { get; set; }  // Data e hora de início do exame

    [Required(ErrorMessage = "Status do Agendamento é obrigatório")]
    // Define o Agendamento: 
    // 0 (ativo e presença NÃO confirmada), 
    // 1(cancelado), 
    // 2(paciente Presente para fazer exame / presença confirmada), 
    // 3 (paciente ausente),
    // 4 (paciente desistiu),
    // 5 (agendamento finalizado)
    public int Status { get; set; }  

    // // [HorarioValido(ErrorMessage = "O horário ou a data fornecidos não são válidos.")]
    public DateTime? HorPresenca { get; set; }  // Data e hora que paciente confirmou exame

    // Aplicando a validação personalizada para o campo Horario
    // [HorarioValido(ErrorMessage = "O horário ou a data fornecidos não são válidos.")]
    public DateTime? HorFim { get; set; }  // Data e hora de fim do exame    


    // Aplicando a validação personalizada para o campo Horario
//    [Range(typeof(DateTime), "01-01-1900", "31-12-2050", ErrorMessage = "A data deve estar entre 01/01/1900 e 31-12-2050")]
    // //  [HorarioValido(ErrorMessage = "O horário ou a data fornecidos não são válidos.")]
    public DateTime? HorDes { get; set; }  // Data e hora da desistência

    [MaxLength(200, ErrorMessage = "Motivo não pode ter mais de 200 caracteres.")]
    public string? MotDes { get; set; }  // motivo da desistência

    [Required(ErrorMessage = "Dados Conf. é obrigatório")]
    public bool DadosOk { get; set; }  // Define se no agendamento os dados são confirmados ou não para repassar para chamar no exame

    public DateTime? HorDados { get; set; }  // Data e hora da desistência    

    public bool Convocacao { get; set; }  // informa se o paciente do agendamento está sendo chamado (em atendimento) ou não
    public DateTime? HorConvocacao { get; set; }  // Data e hora da convocacao para o exame/atendimento        
    public DateTime? HorAusencia { get; set; }  // Data e hora de quando agendamento foi registrado como paciente ausente
    public DateTime? HorCancela { get; set; }  // Data e hora de quando agendamento foi registrado como paciente ausente
    public DateTime? HorLancto { get; set; }  // Data e hora de lançamento na tabela

    public bool Confirmacao { get; set; }  // informa se o paciente do agendamento está sendo chamado (para confirmar os dados) ou não
    public DateTime? HorConfirmacao { get; set; }  // Data e hora que chamou o paciente para confirmar os dados

    // Indica a posição alternativa na fila de convocação
    // 0 = posição original (fila normal), >0 = perdeu lugar na fila
    public int NumFila { get; set; }
    public DateTime? HorFila { get; set; }  // Data e hora que agendamento entrou na lista de espera
    

}

public class HorarioValidoAttribute : ValidationAttribute
{
    public override bool IsValid(object value)
    {
         // Verifica se o valor é nulo
         // HorFim e HorDes são nulos, logo eles devem ser validados somente quando NÃO forem nulos
        if (value == null)
            return true; // Se for nulo, considera válido, pois é opcional


        // realiza pattern matching:
        // testa se value é tipo DateTime
        // caso TRUE, ele atribui em horário o valor de value
        // é como se fizesse: Datetime Horario = (Datetime) value
        if (value is DateTime horario)
        {
            // Converte a data para o horário local
            // var horarioLocal = horario.ToLocalTime();
            var horarioLocal = Funcoes.ConverterParaHorarioLocal(horario);


            // Console.WriteLine("Está verificando a data");
            // Console.WriteLine(value);
            // Verifica se a data está entre 01/01/1990 e 31/12/2050
            var dataMinima = new DateTime(1990, 1, 1);
            var dataMaxima = new DateTime(2050, 12, 31);
            if (horarioLocal  < dataMinima || horarioLocal  > dataMaxima)
            {
                ErrorMessage = "A data deve estar entre 01/01/1990 e 31/12/2050.";
                return false;
            }

            // Verifica se o horário está entre 08:00 e 18:00
            var horaMinima = new TimeSpan(8, 0, 0); // 08:00
            var horaMaxima = new TimeSpan(18, 0, 0); // 18:00
            var horarioVerificado = horarioLocal.TimeOfDay; // usa hora local
            // Console.WriteLine("Horario Verificado");
            // Console.WriteLine(horarioVerificado);

            if (horarioVerificado < horaMinima || horarioVerificado > horaMaxima)
            {
                ErrorMessage = "O horário deve estar entre 08:00 e 18:00.";
                return false;
            }

            // Se passar nas duas verificações
            return true;
        }

        return false; // Retorna falso caso o valor não seja do tipo DateTime
    }
}

