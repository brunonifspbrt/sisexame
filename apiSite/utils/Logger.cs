public static class Logger
{
    public static void EscreveLog(string nomeLocal, string mensagem)
    {
        var dataHora = DateTime.Now.ToLocalTime().ToString("dd-MM-yyyy HH:mm:ss");
        Console.WriteLine($"[{dataHora}] | {nomeLocal} | {mensagem}");
    }
}