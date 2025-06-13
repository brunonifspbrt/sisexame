using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;



[Route("api/[controller]")]
[ApiController]
public class ParametroController : ControllerBase
{
    private readonly DataContext context;

    public ParametroController(DataContext _context)
    {
        // para cada context o nome da tabela será o nome da tabela NO BANCO DE DADOS
        // e NÃO no model.
        context = _context;
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<Parametro>>> Get()
    {
          try
            {
              return Ok(await context.Parametros.ToListAsync());
            }
            catch (Exception ex)
            {
                string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                Logger.EscreveLog("Parâmetros - Get / Erro ", errorMessage);
                return BadRequest("Parâmetros: Erro ao listar os tipos de Parametros");
            }
    }

  [HttpGet("{id}")]
    public async Task<ActionResult<Parametro>> Get([FromRoute] int id)
    {
        try
        {
            if (await context.Parametros.AnyAsync(p => p.Id == id))
                return Ok(await context.Parametros.FindAsync(id));
            else
                return NotFound("Parâmetro informado não foi encontrado");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Parâmetros - Get Id / Erro ", errorMessage);
            return BadRequest("Parâmetros: Erro ao efetuar a busca de Parâmetro");
        }
    }    

    [HttpPost]
    public async Task<ActionResult> Post([FromBody]Parametro item)
    {
        // Exemplo de body Json:
        // {
        //   "atrasoMaximo": 40
        // }

        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo
        try
        {
            await context.Parametros.AddAsync(item);
            await context.SaveChangesAsync();
            return Ok("Parametro salvo com sucesso");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Parâmetros - Post / Erro ", errorMessage);
            return BadRequest("Parâmetros: Erro ao salvar o Parametro informado");
        }
    }

  [HttpPut("{id}")]
    public async Task<ActionResult> Put([FromRoute] int id, [FromBody] Parametro model)
    {
        // O body do Put espera TODOS os dados. Se precisar, faça um get do registro desejado e copie o Json dele para enviar no body
        // Exemplo de Json para ter noção de um registro que tinha no BD:
        // {
        // "id": 2,
        // "atrasoMaximo": 40
        // }        
        if (id != model.Id) //se é diferente da rota, erro
            return BadRequest("Parâmetro inválido");

        try
        {
            //se não existe, erro, senão cria um novo tipo de curso
            if (!await context.Parametros.AnyAsync(p => p.Id == id))
                return NotFound("Parâmetro inválido");

            context.Parametros.Update(model);
            await context.SaveChangesAsync();
            return Ok("Parâmetro salvo com sucesso");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Parâmetros - Put / Erro ", errorMessage);
            return BadRequest("Parâmetros: Erro ao salvar o Parâmetro informado");
        }
    }    

  
}