using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;



[Route("api/[controller]")]
[ApiController]
public class PacienteController : ControllerBase
{
    private readonly DataContext context;


    public PacienteController(DataContext _context)
    {
        // para cada context o nome da tabela será o nome da tabela NO BANCO DE DADOS
        // e NÃO no model.
        context = _context;      
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<Paciente>>> Get()
    {
          try
            {
              return Ok(await context.Pacientes.OrderBy(x => x.Nome).ToListAsync());
            }
            catch (Exception ex)
            {
                string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                Logger.EscreveLog("Pacientes - Get / Erro ", errorMessage);
                return BadRequest("Pacientes: Erro ao listar Pacientes");
            }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Paciente>> Get([FromRoute] int id)
    {
        try
        {
            if (await context.Pacientes.AnyAsync(p => p.Id == id))
                return Ok(await context.Pacientes.FindAsync(id));
            else
                return NotFound("Paciente informado não foi encontrado");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Pacientes - Get ID / Erro ", errorMessage);
            return BadRequest("Pacientes: Erro ao efetuar a busca de Paciente");
        }
    }

    [HttpPost]
    public async Task<ActionResult> Post([FromBody]Paciente item)
    {
        // Exemplo de body Json:
        // {
        //   "cpf": "92219103009",
        //   "nome": "Paciente 3",
        //   "email": "pacit3@example.com",
        //   "dataNascimento": "2025-03-30T01:49:03.031Z",
        //   "ativo": false
        // }

        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo

        // verifica se já há CPF informo já existe na tabela
        var cpfExistente = await context.Pacientes.AnyAsync(p => p.CPF == item.CPF);

        // caso exista CPF, não conclui processo de salvar
        if (cpfExistente)
        {
            return BadRequest("Já existe Paciente com o CPF informado");            
        }

        try
        {
            // converte campo para fuso horário local para evitar problemas ao salvar no bd
            // DateTime dtNascLocal = item.DataNascimento.ToLocalTime();
            DateTime dtNascLocal = item.DataNascimento.Date;
            // altera campo que veio do objeto JSON antes de salvar
            item.DataNascimento = dtNascLocal;
            await context.Pacientes.AddAsync(item);
            await context.SaveChangesAsync();
            return Ok("Paciente salvo com sucesso");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Paciente - Post / Erro ", errorMessage);
            return BadRequest("Paciente: Erro ao salvar o Paciente informado");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Put([FromRoute] int id, [FromBody] Paciente model)
    {
        // O body do Put espera TODOS os dados. Se precisar, faça um get do registro desejado e copie o Json dele para enviar no body
        // Exemplo de Json para ter noção de um registro que tinha no BD:
        // {
        //     "id": 2,
        //     "cpf": "22219100002",
        //     "nome": "Paciente 2",
        //     "email": "pacit2@example.com",
        //     "dataNascimento": "2025-03-30T01:49:03.031",
        //     "ativo": true
        // },     
        if (id != model.Id) //se é diferente da rota, erro
            return BadRequest("Paciente inválido");

        // verifica se já há CPF informo já existe na tabela (diferente da ID atual)
        var cpfExistente = await context.Pacientes.AnyAsync(p => p.CPF == model.CPF && p.Id != model.Id);

        // caso exista CPF, não conclui processo de salvar
        if (cpfExistente)
        {
            return BadRequest("Já existe Paciente com o CPF informado");            
        }            

        try
        {
            // converte campo para fuso horário local para evitar problemas ao salvar no bd
            DateTime dtNascLocal = model.DataNascimento.ToLocalTime();
            // altera campo que veio do objeto JSON antes de salvar
            model.DataNascimento = dtNascLocal;

            //se não existe, erro, senão cria um novo tipo de curso
            if (!await context.Pacientes.AnyAsync(p => p.Id == id))
                return NotFound("Paciente inválido");

            context.Pacientes.Update(model);
            await context.SaveChangesAsync();
            return Ok("Paciente salvo com sucesso");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Pacientes - Put / Erro ", errorMessage);
            return BadRequest("Pacientes: Erro ao salvar o Paciente informado");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete([FromRoute] int id)
    {
        try
        {
            // Antes de excluir verifica se há agendamento com o Paciente informado para exclusão
            // AnyAsync retorna true/false ao verificar se há registro na tabela ou não 
            // a partir do critério informado
            var agendamentoExistente = await context.Agendamentos.AnyAsync(a => a.PacienteId == id );

            // se houver agendamento IMPEDE de excluir
            if (agendamentoExistente)
            {
                return BadRequest("Não é possível excluir Paciente com agendamento associado");
            }


            Paciente model = await context.Pacientes.FindAsync(id);

            if (model == null)
                return NotFound("Paciente inválido");

            context.Pacientes.Remove(model);
            await context.SaveChangesAsync();
            return Ok("Paciente removido com sucesso");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Pacientes - Delete / Erro ", errorMessage);
            return BadRequest("Pacientes: Falha ao remover Paciente");
        }
    }

    [HttpGet("pesquisaNome/{nome}")]
    public async Task<ActionResult<IEnumerable<Paciente>>> Get([FromRoute] string nome)
    {
        // URL de exemplo para acessar: http://localhost:5175/api/Paciente/pesquisaNome/Paciente4
        // Paciente4 é o nome EXATO (where campo = valor) que se deseja pesquisar no campo nome da tabela em questão
        try
        {
            List<Paciente> resultado = await context.Pacientes.Where(p => p.Nome == nome).ToListAsync();
            return Ok(resultado);
        }
        catch
        {
            return BadRequest("Falha ao buscar Paciente");
        }
    }    

    [HttpGet("pesquisaNomeSemelhante/{nome}")]
    public async Task<ActionResult<IEnumerable<Paciente>>> PesquisaNomeSemelhante([FromRoute] string nome)
    {
        // URL de exemplo para acessar: http://localhost:5175/api/Paciente/pesquisaNomeSemelhante/ario4
        // ario4 é o nome SIMILAR (where campo LIKE "%valor%") que se deseja pesquisar no campo nome da tabela em questão        
        try
        {
            List<Paciente> resultado = await context.Pacientes.
            Where(p => p.Nome.Contains(nome)).ToListAsync();
            return Ok(resultado);
        }
        catch
        {
            return BadRequest("Falha ao buscar Paciente");
        }
    }    

    [Route("pesquisa")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Paciente>>> Pesquisa([FromBody] object item)
    {
        // URL de exemplo para acessar: http://localhost:5175/api/Paciente/pesquisa/
        // o conteúdo da pesquisa NÃO estará na rota, mas no corpo do Body (no Postman: raw + Json)
        // Abaixo exemplo de pesquisa de nome e e-mail enviando no body da requisição.
        // Perceba que os campos do body da requisição são IGUAIS como declarados na model. Pois parece que é case sensitive. 
        // Se colocar tudo minúsculo ou maiúsculo NÃO dá certo. Abaixo exemplo com os nomes iguais ao model Usuário:
//   {
        // "Nome": "Paciente 2",
        // "Email": "pacit2@example.com"
//     }
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

            Paciente model = JsonSerializer.Deserialize<Paciente>(item.ToString(), options);
            //Console.WriteLine("Valor do nome: " + model.Nome);
            List<Paciente> resultado = await context.Pacientes
                .WhereIf(model.Nome != null, p => p.Nome == model.Nome)
                .WhereIf(model.Email != null, p => p.Email == model.Email).ToListAsync();

            return Ok(resultado);
        }
        catch
        {
            return BadRequest();
        }
    }    
}