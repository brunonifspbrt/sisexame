public static class Funcoes
{
       // quando for analisar data é necessário truncar ela pra minuto
    public static DateTime TruncarParaMinuto(DateTime data)
    {
        return new DateTime(data.Year, data.Month, data.Day, data.Hour, data.Minute, 0);
    }

    // quando for analisar data é necessário truncar ela pra segundo
    public static DateTime TruncarParaSegundo(DateTime data)
    {   
        return new DateTime(data.Year, data.Month, data.Day, data.Hour, data.Minute, data.Second, 0);
    }

    // permite que a hora seja convertida em conformidade a data e hora do servidor onde API está rodando
    public static DateTime ConverterParaHorarioLocal(DateTime horario)
    {
        return horario.ToLocalTime();
    }    
}
