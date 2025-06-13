using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text;

[Route("api/[controller]")]
[ApiController]

public class LoginController : ControllerBase
{
    private readonly DataContext context;

     public LoginController(DataContext _context)
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

    [HttpPost("autenticar")]
    public async Task<ActionResult> Autenticar(
        [FromBody] LoginBusca model)
    {
 
        try
        {
            // busca usuário a partir do e-mail
            var usuarioBD = await context.Usuarios.FirstOrDefaultAsync(x => x.Email == model.Email);

            // caso não tenha usuário com esse e-mail
            if (usuarioBD == null)
            {
                Console.WriteLine("Login - Login: E-mail informado não foi encontrado");
                return BadRequest("E-mail e/ou senha inválido(s)");
            }
                

            // Console.WriteLine(CriaSenha("368abbc5aca52a49761deb4bc1607bfb275cfc8fcfdabe5bb40bec348f6177a9"));    

            // gera senha a partir da senha do site
            var valSenha = CriaSenha(model.Senha);
            // Console.WriteLine(usuarioBD.Senha);
            // Console.WriteLine(valSenha);

            // compara senha de BD com senha informada no site
            if (usuarioBD.Senha != valSenha)
            {
                Console.WriteLine("Login - Login: Senhas não conferem");
                return BadRequest("Email e/ou senha inválido(s)");
            }

            DateTime dtHoraAtual = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtHoraAtual = Funcoes.TruncarParaMinuto(dtHoraAtual);                
            dtHoraAtual = Funcoes.TruncarParaSegundo(dtHoraAtual);
            // atualiza a data do último acesso
            usuarioBD.DtUltAcesso = dtHoraAtual;
            // if(usuarioBD.Operacao == 3) // 3 - primeiro acesso ao sistema
            // {
            //     usuarioBD.Operacao = 0;
            // }            
            context.Usuarios.Update(usuarioBD); 
            // salva alteraçõ~es no banco
            await context.SaveChangesAsync();
                

            // retorna objeto anônimo com informações que desejo exibir
              // // resultado enviado como resposta
            var resultado = new {
                UsuarioID = usuarioBD.Id,
                UsuarioNome = usuarioBD.Nome,
                UsuarioEmail = usuarioBD.Email,
                UsuarioTipo = usuarioBD.Tipo, 
                UsuarioOperacao = usuarioBD.Operacao, 
            };
            return Ok(resultado);            
        }
        catch (Exception ex)
        {
           string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
           Logger.EscreveLog("Login - Login / Erro ", errorMessage);
           return BadRequest("Login: erro ao exibir dados ao autenticar");            
        }
        
    }      

   [HttpGet("infousuario/{email}")]
    public async Task<ActionResult> GeraInfoUsuario([FromRoute] string email)
    {
        try
        {
          // Verifica se o e-mail já está cadastrado no sistema
          var existeEmail = await context.Usuarios.AnyAsync(u => u.Email == email);
          if(!existeEmail)
          {
            return BadRequest("E-mail não identificado! (1)");
          }

          var usuarioBD = await context.Usuarios.FirstOrDefaultAsync(p => p.Email == email);
          if (usuarioBD == null)
              return BadRequest("E-mail não identificado! (2)");

          // retorna dados em objeto anônimo    
          var resultado = new 
          {
              UsuarioID = usuarioBD.Id,
              UsuarioNome = usuarioBD.Nome,
              UsuarioEmail = usuarioBD.Email,
              UsuarioTipo = usuarioBD.Tipo, 
              UsuarioOperacao = usuarioBD.Operacao,
          };  

          return Ok(resultado);

        }
        catch (Exception ex)
        {
           string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
           Logger.EscreveLog("Login - Info Usuário / Erro ", errorMessage);
           return BadRequest("Login: erro ao exibir info do usuário");            
        }
       
    }

       
}