using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;



[Route("api/[controller]")]
[ApiController]
public class ExameController : ControllerBase
{
    private readonly DataContext context;

    public ExameController(DataContext _context)
    {
        // para cada context o nome da tabela será o nome da tabela NO BANCO DE DADOS
        // e NÃO no model.
        context = _context;
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<Exame>>> Get()
    {
          try
            {
              return Ok(await context.Exames.OrderBy(x => x.Nome).ToListAsync());

            }
            catch (Exception ex)
            {
                string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                Logger.EscreveLog("Exame - Get / Erro ", errorMessage);
                return BadRequest("Exame: Erro ao listar os tipos de exames");
            }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Exame>> Get([FromRoute] int id)
    {
        try
        {
            if (await context.Exames.AnyAsync(p => p.Id == id))
                return Ok(await context.Exames.FindAsync(id));
            else
                return NotFound("Exame informado não foi encontrado");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Exames - Get ID / Erro ", errorMessage);
            return BadRequest("Exames: Erro ao efetuar a busca de Exame");
        }
    }

    [HttpPost]
    public async Task<ActionResult> Post([FromBody]Exame item)
    {
        // Exemplo de body Json:
        // {
        //   "nome": "Exame 1",
        //   "descricao": "Descrição Exame 1",
        //   "duracaoPadrao": 10,
        //   "Instrucoes": "Instruções Preparo Exame 1",
        //   "ativo": true
        // }

        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo
        try
        {
            await context.Exames.AddAsync(item);
            await context.SaveChangesAsync();
            return Ok("Exame salvo com sucesso");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Exame - Post / Erro ", errorMessage);
            return BadRequest("Exame: Erro ao salvar o Exame informado");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Put([FromRoute] int id, [FromBody] Exame model)
    {
        // O body do Put espera TODOS os dados. Se precisar, faça um get do registro desejado e copie o Json dele para enviar no body
        // Exemplo de Json para ter noção de um registro que tinha no BD:
        // {
        // "id": 2,
        // "nome": "Exame2",
        // "email": "user2@example.com",
        // "foto": null,
        // "dtNasc": null,
        // "senha": "str122",
        // "tipo": 1,
        // "ativo": true,
        // "dtUltAcesso": null,
        // "codigoVerEmail": null,
        // "dtUltTrocaEmail": null,
        // "codigoVerSenha": null,
        // "dtUltTrocaSenha": null
        // }        
        if (id != model.Id) //se é diferente da rota, erro
            return BadRequest("Exame inválido");

        try
        {
            //se não existe, erro, senão cria um novo tipo de curso
            if (!await context.Exames.AnyAsync(p => p.Id == id))
                return NotFound("Exame inválido");

            context.Exames.Update(model);
            await context.SaveChangesAsync();
            return Ok("Exame salvo com sucesso");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Exames - Put / Erro ", errorMessage);
            return BadRequest("Exames: Erro ao salvar o Exame informado");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete([FromRoute] int id)
    {
        try
        {
            // Antes de excluir verifica se há agendamento com o Exame informado para exclusão
            // AnyAsync retorna true/false ao verificar se há registro na tabela ou não 
            // a partir do critério informado
            var agendamentoExistente = await context.Agendamentos.AnyAsync(a => a.ExameId == id );

            // se houver agendamento IMPEDE de excluir
            if (agendamentoExistente)
            {
                return BadRequest("Não é possível excluir Exame com agendamento associado");
            }

            Exame model = await context.Exames.FindAsync(id);

            if (model == null)
                return NotFound("Exame inválido");

            context.Exames.Remove(model);
            await context.SaveChangesAsync();
            return Ok("Exame removido com sucesso");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Exame - Delete / Erro ", errorMessage);
            return BadRequest("Exame: Falha ao remover Exame");
        }
    }

    [HttpGet("pesquisaNome/{nome}")]
    public async Task<ActionResult<IEnumerable<Exame>>> Get([FromRoute] string nome)
    {
        // URL de exemplo para acessar: http://localhost:5175/api/Exame/pesquisaNome/Exame4
        // Exame4 é o nome EXATO (where campo = valor) que se deseja pesquisar no campo nome da tabela em questão
        try
        {
            List<Exame> resultado = await context.Exames.Where(p => p.Nome == nome).ToListAsync();
            return Ok(resultado);
        }
        catch
        {
            return BadRequest("Falha ao buscar Exame");
        }
    }    

    [HttpGet("pesquisaNomeSemelhante/{nome}")]
    public async Task<ActionResult<IEnumerable<Exame>>> PesquisaNomeSemelhante([FromRoute] string nome)
    {
        // URL de exemplo para acessar: http://localhost:5175/api/Exame/pesquisaNomeSemelhante/ario4
        // ario4 é o nome SIMILAR (where campo LIKE "%valor%") que se deseja pesquisar no campo nome da tabela em questão        
        try
        {
            List<Exame> resultado = await context.Exames.
            Where(p => p.Nome.Contains(nome)).ToListAsync();
            return Ok(resultado);
        }
        catch
        {
            return BadRequest("Falha ao buscar Exame");
        }
    }    

    [Route("pesquisa")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Exame>>> Pesquisa([FromBody] object item)
    {
        // URL de exemplo para acessar: http://localhost:5175/api/Exame/pesquisa/
        // o conteúdo da pesquisa NÃO estará na rota, mas no corpo do Body (no Postman: raw + Json)
        // Abaixo exemplo de pesquisa de nome e e-mail enviando no body da requisição.
        // Perceba que os campos do body da requisição são IGUAIS como declarados na model. Pois parece que é case sensitive. 
        // Se colocar tudo minúsculo ou maiúsculo NÃO dá certo. Abaixo exemplo com os nomes iguais ao model Usuário:
//    {
//         "Nome": "Exame4",
//         "Email": "u4sr3@example.com"
//    }
        // Mas também você pode remover obrigação de capitalizar propriedades do Json igual estão declaradas na model
        // var options = new JsonSerializerOptions
        // {
        //     PropertyNameCaseInsensitive = true // Permite que a capitalização das propriedades seja ignorada
        // };                  
        // Perceba que está como Nome e Email assim pois na model está declarado da mesma forma
        // aqui é pesquisa EXATA (where campo = "%valor%") que se deseja pesquisar no campo nome da tabela em questão        
        // a pesquisa daqui irá buscar o registro cujas colunas tenham os dois valores informados no body (lembre-se, é um where + and)
        try
        {
            // JsonSerializer exige using System.Text.Json;
            // removo obrigação de capitalizar propriedades do Json igual estão declaradas na model
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true // Permite que a capitalização das propriedades seja ignorada
            };          
            Exame model = JsonSerializer.Deserialize<Exame>(item.ToString(),options);

            List<Exame> resultado = await context.Exames
                .WhereIf(model.Nome != null, p => p.Nome == model.Nome)
                .WhereIf(model.Descricao != null, p => p.Descricao == model.Descricao)
                .WhereIf(model.Instrucoes != null, p => p.Instrucoes == model.Instrucoes).ToListAsync();

            return Ok(resultado);
        }
        catch
        {
            return BadRequest();
        }
    }    
}