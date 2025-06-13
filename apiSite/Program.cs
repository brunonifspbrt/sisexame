using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// Se estiver debugando: usa conexão de Dev, caso contrário usa de Produção
#if DEBUG
builder.Services.AddDbContext<DataContext>(options =>
    options.UseSqlServer("name=ConnectionStrings:Development"));
#else
builder.Services.AddDbContext<DataContext>(options =>
    options.UseSqlServer("name=ConnectionStrings:Production"));
#endif

// // vincula context
// builder.Services.AddDbContext<DataContext>(options =>
//     options.UseSqlServer("name=ConnectionStrings:Development"));

// Registra o serviço de envio de e-mails
builder.Services.AddScoped<EmailService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
// linha abaixo é swagger SEM uso de x-api-key
builder.Services.AddSwaggerGen();



var app = builder.Build();
app.UseAPIKey(); // usa chave para api

// Configuração para servir arquivos estáticos da pasta 'fotos'
// app.UseStaticFiles(); // Serve arquivos da pasta desejada (se houver)


// Caso a pasta 'fotos' não exista antes de configurar os arquivos estáticos
// então cria
var pastaFotos = Path.Combine(Directory.GetCurrentDirectory(), "fotos");
if (!Directory.Exists(pastaFotos))
{
    Directory.CreateDirectory(pastaFotos);
}

// Serve arquivos da pasta 'fotos' com o caminho base '/fotos'
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "fotos")),
    RequestPath = "/fotos" // A URL será /fotos/1.jpg
});


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
