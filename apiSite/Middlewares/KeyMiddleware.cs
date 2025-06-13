using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;


public class KeyMiddleware
{
    private const string KeyName = "x-api-key";
    private readonly RequestDelegate _next;

    public KeyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {

        // código do Path é para usar swagger sem a api key
        var path = context.Request.Path.Value;

        if (path != null && (path.StartsWith("/swagger") || path.StartsWith("/favicon.ico")))
        {
            await _next(context);
            return;
        }

       string DesiredKey = context.RequestServices.GetRequiredService<IConfiguration>().GetValue<string>(KeyName);

        if (!context.Request.Headers.TryGetValue(KeyName, out Microsoft.Extensions.Primitives.StringValues value))
        {
            context.Response.StatusCode = 401;
            // await context.Response.WriteAsync("Chave não informada");
            // as respostas sempre são como Json, retorno como Json também
            await context.Response.WriteAsJsonAsync("Chave não informada");            
            return;
        }

        if (DesiredKey != value)
        {
            context.Response.StatusCode = 401;
            // await context.Response.WriteAsync("Acesso não autorizado");
            // as respostas sempre são como Json, retorno como Json também
            await context.Response.WriteAsJsonAsync("Acesso não autorizado");            
            return;
        }

        await _next(context);
    }
}

public static class KeyMiddlewareExtensions
{
    public static IApplicationBuilder UseAPIKey(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<KeyMiddleware>();
    }
}