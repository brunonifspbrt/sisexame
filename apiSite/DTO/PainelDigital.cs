using System.ComponentModel.DataAnnotations;


// aqui passo o objeto JSON adequado para executar a construção do Painel Digital
public class PainelObjeto
{
    [Required(ErrorMessage = "Informe a data desejada para exibição do painel")]    
    public DateTime  DataPainel   { get; set; }
    // public List<int>? CodExames { get; set; }
    public int? CodExame { get; set; }
}



// construo o Painel Digital para exibição dos exames
// serão exibidos os exames EM ABERTO
// serão exibidos os exames FINALIZADOS
public class PainelExame
{
    public int ExameCod { get; set; }
    public string ExameNome { get; set; }
    public int ExameTempoPadrao { get; set; }
    public double ExameTempoMedio { get; set; }

    public List<PacienteFila> PacientesNaFila { get; set; } = new();
    public List<PacienteAtendido> PacientesAtendidos { get; set; } = new();

    public List<PacienteChamada> PacientesChamados { get; set; } = new();    
    public List<PacienteChamDado> PacientesChamDados { get; set; } = new();    
    
}

public class PacienteFila
{
    public string PFNome { get; set; }
    public DateTime PFHoraAgenda { get; set; }
    public TimeSpan PFTempoEst { get; set; }
}

public class PacienteAtendido
{
    public string PANome { get; set; }
    public DateTime PAHoraAgenda { get; set; }
    public DateTime PAHoraIni { get; set; }
    public DateTime PAHoraFim { get; set; }
}


public class PacienteChamada
{
    public string PFNome { get; set; }
    public DateTime PFHoraAgenda { get; set; }
}

public class PacienteChamDado
{
    public string PFNome { get; set; }
    public DateTime PFHoraAgenda { get; set; }
}