using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

[Route("api/[controller]")]
[ApiController]

public class SistemaController : ControllerBase
{
     private readonly DataContext context;

    public SistemaController(DataContext _context)
    {
        // para cada context o nome da tabela será o nome da tabela NO BANCO DE DADOS
        // e NÃO no model.
        context = _context;
    }

    [NonAction]
    private static string Hash(string valPassword)
    {
         // Usando SHA512 diretamente, sem a necessidade de usar Create(string)
        using (SHA512 sha512 = SHA512.Create())
        {
            // Converte a senha para bytes usando a codificação ASCII
            byte[] stringBytes = Encoding.ASCII.GetBytes(valPassword);

            // Computa o hash
            byte[] byteArray = sha512.ComputeHash(stringBytes);

            // Converte o array de bytes para uma string hexadecimal
            StringBuilder stringBuilder = new StringBuilder();
            foreach (byte b in byteArray)
            {
                stringBuilder.AppendFormat("{0:x2}", b);
            }

            return stringBuilder.ToString();
        }
        
        // HashAlgorithm hasher = HashAlgorithm.Create(HashAlgorithmName.SHA512.Name);
        // byte[] stringBytes = Encoding.ASCII.GetBytes(valPassword);
        // byte[] byteArray = hasher.ComputeHash(stringBytes);

        // StringBuilder stringBuilder = new StringBuilder();
        // foreach (byte b in byteArray)
        // {
        //     stringBuilder.AppendFormat("{0:x2}", b);
        // }

        // return stringBuilder.ToString();
    }

    [NonAction]
    private static string CriaSenha(string valorSenha)
    {
        if (valorSenha == null || valorSenha.Trim() == "")
            throw new Exception();

        string retorno = valorSenha;

        retorno = "a8sgv93l" + retorno;
        retorno = Hash(retorno);
        retorno += "lk7wd09jhue3";                    
        retorno = Hash(retorno);

        return retorno;
    }

    [HttpGet("checkstatus")]
    public async Task<IActionResult> VerificaInicializacao()
    {
        try
        {
            // Busca o registro no banco de dados
            var sistemaBD = await context.Sistemas.FirstOrDefaultAsync();

            bool inicializado = false;
             if (sistemaBD != null)
             {
                inicializado = sistemaBD.Inicializado;
             }
            // considera inicializado se:
            // 1) há registro na tabela
            // 2) se campo Inicializado = true;
            // bool inicializado = sistemaBD != null && sistemaBD.Inicializado;

             var resultado = new {
                Status = inicializado 
            };
            // return Ok(new { inicializado });     
            return Ok(resultado);     
        }
        catch (Exception ex)
        {
           string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
           Logger.EscreveLog("Sistema - Status / Erro ", errorMessage);
           return BadRequest("Sistema: erro ao exibir dados");            
        }      
    }

    [HttpPost("inserir")]
    public async Task<IActionResult> RegistraUsuario([FromBody] SistemaBody model)
    {
        try
        {
             // retorna data atual, no caso somente data
            //var dataBD = DateTime.Today;
            DateTime dataBD = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtBD = Funcoes.TruncarParaMinuto(dtBD);                                            
            dataBD = Funcoes.TruncarParaSegundo(dataBD);  

            // verifica se há registro em Sistemas
            // se houver retorna o registro ou null caso contrário
            // vai ser utilizado no final
            var sistemaExistente = await context.Sistemas
                .FirstOrDefaultAsync();

            // Verifica se existe registro em tabela de Parâmetros
            var existeParametro = await context.Parametros
                .AnyAsync();          

            if (existeParametro)
            {
                return BadRequest("Existe parâmetro cadastrado, não é possível continuar!");
            }       


            // Verifica se o e-mail já está cadastrado no sistema
            var existeEmail = await context.Usuarios
                .AnyAsync(u => u.Email == model.Email);

            if (existeEmail)
            {
                // Se o e-mail já estiver cadastrado, retorna um erro
                return BadRequest("Este e-mail já está em uso.");
            }

            // verifica se já existe usuário administrador
            var existeAdmin = await context.Usuarios
                .AnyAsync(u => u.Tipo == 0);

            if (existeAdmin)
            {
                return BadRequest("Já existe usuário Administrador cadastrado");
            }

            // caso não haja restrição acima, realiza o registro de novo usuário
            // Cria um novo usuário com os dados recebidos no DTO
            var novoUsuario = new Usuario
            {
                // Nome = "Administrador",
                Nome = model.Nome,
                Email = model.Email,
                Senha = CriaSenha(model.Senha),
                DtNasc = dataBD.Date,
                DtUltAcesso = dataBD,// ultimo acesso registra o primeiro acesso
                Tipo = 0, // usuário administrador
                Ativo = true,
                Operacao = 0, // não há operação pendente
            };
          
            // Adiciona o novo usuário 
            await context.Usuarios.AddAsync(novoUsuario);

            // Salva as alterações no banco de dados
            await context.SaveChangesAsync();

            var novoParametro = new Parametro {
                AtrasoMaximo = model.Atraso
            };

            // Adiciona o novo registro
            await context.Parametros.AddAsync(novoParametro);
            // Salva as alterações no banco
            await context.SaveChangesAsync();

            // verificação em tabela Sistemas
            // Verifica se já existe um sistema inicializado
            if (sistemaExistente != null)
            {
                // Se o sistema já existe, atualiza os campos necessários
                sistemaExistente.DataInicializacao = dataBD;
                sistemaExistente.Inicializado = true;

                // Atualiza o registro
                context.Sistemas.Update(sistemaExistente);
                // Salva as alterações no banco
                await context.SaveChangesAsync();
            }    
             else
           {
                // Caso não exista, cria um novo registro para o sistema
                var novoSistema = new Sistema
                {
                    DataInicializacao = dataBD,
                    Inicializado = true
                };

                // Adiciona o novo registro
                await context.Sistemas.AddAsync(novoSistema);
                // Salva as alterações no banco
                await context.SaveChangesAsync();
           }



            return Ok("Cadastro realizado com sucesso!");     
        }
        catch (Exception ex)
        {
           string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
           Logger.EscreveLog("Sistema - Registra Administrador / Erro ", errorMessage);
           return BadRequest("Sistema: erro ao exibir dados");            
        }      
    }    
}