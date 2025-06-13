using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

public class DataContext : DbContext
{
    public DataContext(DbContextOptions<DataContext> options)
        : base(options) 
    {
    }

    // vincula contexto ao model / 
    // nome da tabela no bd / 
    // get e set permite operações da model no BD
    // null! é só pra tirar warning 
    public DbSet<Usuario> Usuarios { get; set; } = null!;
    public DbSet<Exame> Exames { get; set; } = null!;
    public DbSet<Paciente> Pacientes { get; set; } = null!;

    public DbSet<Agendamento> Agendamentos { get; set; } = null!;        

    public DbSet<Parametro> Parametros { get; set; } = null!;    

    public DbSet<Sistema> Sistemas { get; set; } = null!;    

}

// classe usada para verificar campos e construir where em consulta personalizada em método Pesquisa (verbo http)
public static class LinqExtensions
{
    public static IQueryable<TSource> WhereIf<TSource>(this IQueryable<TSource> source, bool condition, Expression<Func<TSource, bool>> predicate)
    {
        return condition ? source.Where(predicate) : source;
    }
}