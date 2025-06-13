using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text;
using System.Security.Cryptography;
using System.ComponentModel.DataAnnotations;
using System.Linq; // Certifique-se de ter esse using para usar o método Count()


[Route("api/[controller]")]
[ApiController]
public class UsuarioController : ControllerBase
{
    private readonly DataContext context;
    private readonly EmailService emailService;

    public UsuarioController(DataContext _context, EmailService _emailService)
    {
        // para cada context o nome da tabela será o nome da tabela NO BANCO DE DADOS
        // e NÃO no model.
        context = _context;
        // inclui serviço de e-mail
        emailService = _emailService;
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<Usuario>>> Get()
    {
          try
            {
              return Ok(await context.Usuarios.OrderBy(x => x.Nome).ToListAsync());
            }
            catch
            {
                return BadRequest("Erro ao listar os tipos de curso");
            }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Usuario>> Get([FromRoute] int id)
    {
        try
        {
            if (await context.Usuarios.AnyAsync(p => p.Id == id))
                return Ok(await context.Usuarios.FindAsync(id));
            else
                return NotFound("Usuário informado não foi encontrado");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Get ID / Erro ", errorMessage);
            return BadRequest("Usuários: Erro ao efetuar a busca de Usuário");
        }
    }

    // Método público, mas NÃO deve ser exposto como ação HTTP
    [NonAction]
    private async Task<bool> VerificarEmailExistente(string valEmail, int codId = 0)
    {
        if (codId == 0)
        {
            // Console.WriteLine("Valor do e-mail");
            // Console.WriteLine(valEmail);
            // significa que é novo registro então NÃO filtra id
            return await context.Usuarios.AnyAsync(a => a.Email == valEmail);
        }
        else
        {
            // quando tem código é que está usando em método tipo put (que já tem o registro)
            return await context.Usuarios.AnyAsync(a => a.Id != codId && a.Email == valEmail);
        }        
    }

    // Método público, verifica se já tem usuário administrador
    [NonAction]
    private async Task<bool> VerificarAdminExistente(int codId = 0)
    {
         if (codId == 0)
         {
            // significa que é novo registro então NÃO filtra id
            return await context.Usuarios.AnyAsync(a => a.Tipo == 0);        
         }
         else
         {
            // quando tem código então verifico se não tem nenhum usuário administrador ativo no sistema
            // return await context.Usuarios.AnyAsync(a => a.Id != codId && a.Ativo == true && a.Tipo == 0);        
            return await context.Usuarios.AnyAsync(a => a.Id != codId && a.Tipo == 0);        
         }

    }

     // Método privado [NonAction] para gerar senha aleatória de 10 caracteres
    [NonAction]
    private string GerarSenhaAleatoria()
    {
        // Obtém data e hora para incluir na senha aleatória de 10 caracteres
        // Formato: 20230427123045987
        string dataHoraAtual = DateTime.Now.ToString("yyyyMMddHHmmssfff"); 

        // Gero números aleatórios
        Random valRandom = new Random();
        const string letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder senhaBuilder = new StringBuilder();

        // Inclui parte da data e hora na senha
        // Pego os últimos 4 dígitos do campo data/hora
        senhaBuilder.Append(dataHoraAtual.Substring(dataHoraAtual.Length - 4)); 

        // Adiciona caracteres aleatórios
        for (int i = 0; i < 2; i++) // Gera 2 caracteres aleatórios
        {
            senhaBuilder.Append(letras[valRandom.Next(letras.Length)]);
        }

        // Gera 4 dígitos aleatórios adicionais
        for (int i = 0; i < 4; i++)
        {
            senhaBuilder.Append(valRandom.Next(0, 10)); // Adiciona um dígito entre 0 e 9
        }

        // senha aleatória de 10 caracteres
        return senhaBuilder.ToString();
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

    // [HttpPost("enviaemail")]
    // public async Task<IActionResult> EnviarEmail()
    // {
    //     try
    //     {
    //         await emailService.EnviarEmailAsync("Aluno", "bruno.neto@aluno.ifsp.edu.br", "É um teste de e-mail","");
    //         return Ok(new { message = "E-mail enviado com sucesso." });
    //     }
    //     catch (Exception ex)
    //     {
    //         return StatusCode(500, new { error = "Erro ao enviar e-mail.", detalhe = ex.Message });
    //     }
    // }    

   [HttpPost]
    public async Task<ActionResult> Post(IFormCollection formData)
    {
        // Exemplo de body Json:
        // {
        //     "nome": "Usuario1",
        //     "email": "user1@example.com",
        //     "dtNasc": "2025-04-29T01:59:24.615Z",
        //     "tipo": 1,
        //     "ativo": true
        // }

        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo
        try
        {

            var fotoResult = true;
            var msgResult = "Usuário salvo com sucesso!";
            // os dados recebidos pelo FormData serão passados para o DTO UsuarioPost 
            // pra verificar se os dados estão com os valores e formatos válidos!
            var usuarioDto = new UsuarioPost
            {
                Nome = formData["nome"],
                Email = formData["email"],
                DtNasc = DateTime.Parse(formData["dtNasc"]),
                Tipo = Convert.ToByte(formData["tipo"]),
                Ativo = Convert.ToBoolean(formData["ativo"]),
                UrlSite = formData["urlsite"],
                CodIni = formData["codini"],
                CodIniHash = formData["codinihash"]
            };


            // tento validar os dados que criei a partir do dto
            var validacaoResult = new List<ValidationResult>();
            var dadosValidos = Validator.TryValidateObject(usuarioDto, new ValidationContext(usuarioDto), validacaoResult, true);

            // se algum dado NÃO é válido ele não conclui procedimento
            if (!dadosValidos)
            {
                return BadRequest(validacaoResult); // Retorna os erros de validação se houver
            }

            // verifica se já tem usuário administrador
            if(usuarioDto.Tipo == 0)
            {
                if (await VerificarAdminExistente())
                {
                   // não salva, é necessário ID existente em tabela Exames
                   return BadRequest("Já existe usuário Administrador para o sistema!");
                }
            }           

            // verifica se e-mail NÃO existe na base de dados
            if (await VerificarEmailExistente(usuarioDto.Email))        
            {
                // não salva, é necessário ID existente em tabela Exames
                return BadRequest("Email informado já existe no sistema! Tente novamente!");
            }    

            // cria variáveis para incluir no e-mail
            var valNome = usuarioDto.Nome;
            var valEmail = usuarioDto.Email;
            var valSite = usuarioDto.UrlSite;
            // Console.WriteLine(valSite);

            // formata data de nascimento
            // DateTime valNasc = Funcoes.ConverterParaHorarioLocal(usuarioDto.DtNasc); 
            DateTime valNasc = usuarioDto.DtNasc.Date; 


            // depois de passar a validação de dados cria o registro do Usuário
            // a partir do model Usuário
            var usuarioBD = new Usuario
            {
                Nome = usuarioDto.Nome,
                Email = usuarioDto.Email,
                Tipo = usuarioDto.Tipo,
                Ativo = usuarioDto.Ativo,
                DtNasc = valNasc.Date,
                UrlSite = usuarioDto.UrlSite,                
                CodIni = usuarioDto.CodIni,
                CodIniHash = usuarioDto.CodIniHash 
            };

            
            // define senha aleatória
            // var valSenha = GerarSenhaAleatoria();
            var valSenha = usuarioBD.CodIniHash;
            // Console.WriteLine(valSenha);
            usuarioBD.Senha = CriaSenha(valSenha);  // Gerar a senha aleatória e hasheada

            // para exibir no corpo do email a senha inicial
            // eu informo o valor da senha SEM hash
            valSenha = usuarioBD.CodIni;
            // Console.WriteLine(usuarioBD.Senha);            
            // item.Senha = CriaSenha(valSenha);
            // // REMOVER, É SÓ PARA TESTE
            // item.Senha = valSenha;
            // senha com hash campo temporário
            // item.Senha = Hash(valSenha);
            // item.SenhaTemp = Hash(valSenha);
       
            //item.SenhaTemp = valSenha;            
            
            // se tipo Secretaria (1) então já posiciona que é primeiro acesso e envia e-mail
            if(usuarioBD.Tipo == 1)
            {
                usuarioBD.Operacao = 3; // define que é primeiro acesso
            }         

            await context.Usuarios.AddAsync(usuarioBD);
            await context.SaveChangesAsync();
            
            // Verifica se existe algum arquivo na coleção de arquivos (foto) no formdata
            var fotoFile = formData.Files.FirstOrDefault(f => f.Name == "foto");
            // Se houver pelo menos um arquivo com o nome 'foto', processa
            if (fotoFile != null && fotoFile.Length > 0)
            {
                var fotoService = new FotoService();  // Instancia o serviço de foto
                // salva a foto: informo a foto + id do usuário
                fotoResult = await fotoService.SalvarFotoAsync(fotoFile, usuarioBD.Id);  // Salva a foto
                
                if(!fotoResult)
                {
                    msgResult = $"{msgResult} Foto não foi salva! Tente novamente!";
                }     
            }

            //return Ok(new { mensagem = "Usuário salvo com sucesso", novaSenha = valSenha });
            //enviar e-mail
            // if(usuarioBD.Operacao == 0)
            if(usuarioBD.Operacao == 3)
            {
                // var resultadoEmail = await emailService.EmailUsuarioAsync(item.Nome, item.Email, valSenha,item.UrlSite,0);
                var emailResult = await emailService.EmailUsuarioAsync(valNome, valEmail, valSenha,valSite,0);
                // Console.WriteLine(resultadoEmail.Sucesso);
                // pelo retorno informa sucesso ou não da conclusão
                if (!emailResult.Sucesso)
                {
                    msgResult = $"{msgResult} E-mail não enviado! Solicite o reenvio de e-mail!";
                    // return Ok("Usuário salvo com sucesso MAS e-mail não foi enviado! Verifique seu provedor!");
                }
                    
            }

          
            // return Ok("Usuário salvo com sucesso");
            return Ok(msgResult);
        }
        catch(Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Post / Erro ", errorMessage);
            return BadRequest("Usuários: Erro ao salvar o Usuário informado");
        }
    }


    [HttpPost("alterapwd")]
    public async Task<ActionResult> AlteraSenha([FromBody]UsuarioSenha item)
    {
        // Exemplo de body Json:
        // {
        //     "nome": "Usuario1",
        //     "email": "user1@example.com",
        //     "dtNasc": "2025-04-29T01:59:24.615Z",
        //     "tipo": 1,
        //     "ativo": true
        // }

        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo
       try
        {
            // Console.WriteLine(item.Id);
            // Console.WriteLine(item.SenhaAtual);
            // Console.WriteLine(item.SenhaConfirma);

            // encontro o usuário e armazeno na variável
            var usuarioAtual = await context.Usuarios.FindAsync(item.Id);
            if (usuarioAtual == null)
                return NotFound("Usuário inválido (1)");

            // //se não existe, erro, senão cria um novo tipo de curso
            // if (!await context.Usuarios.AnyAsync(p => p.Id == id))
            //     return NotFound("Usuário inválido (2)");

            var senhaBD = usuarioAtual.Senha;
            var codBD = usuarioAtual.CodigoVerSenha;
            // Console.WriteLine("Senha BD");
            // Console.WriteLine(senhaBD);
            var senhaNova = CriaSenha(item.SenhaNova);  
            var codSite = CriaSenha(item.CodVer);  
            // Console.WriteLine("Senha Atual");            
            // Console.WriteLine(item.SenhaAtual);          
            // Console.WriteLine(senhaSite);

            // compara senha do banco com senha informada pelo site
            if (codBD != codSite)
             return NotFound("Código de Verificação inválido");

            if (senhaBD == senhaNova)
             return NotFound("Senha nova NÃO pode ser igual a atual");

            // atualizo SOMENTE os campos que sei que serão enviados de tela de edição de usuário
            usuarioAtual.Senha = senhaNova;
            // inform data ult alt senha
            DateTime dtBD = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtBD = Funcoes.TruncarParaMinuto(dtBD);                                            
            dtBD = Funcoes.TruncarParaSegundo(dtBD);        
            usuarioAtual.DtUltTrocaSenha = dtBD;
            usuarioAtual.CodigoVerSenha = null;
            usuarioAtual.Operacao = 0; // não há operação pendente
            await context.SaveChangesAsync();
            return Ok("Senha alterada com sucesso");
        }
         catch(Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Altera Senha / Erro ", errorMessage);
            return BadRequest("Usuários: Erro ao atualizar senha");
        }
    }    

    [HttpPost("alteramail")]
    public async Task<ActionResult> AlteraEmail([FromBody]UsuarioEmail item)
    {
        // Exemplo de body Json:
        // {
        //     "nome": "Usuario1",
        //     "email": "user1@example.com",
        //     "dtNasc": "2025-04-29T01:59:24.615Z",
        //     "tipo": 1,
        //     "ativo": true
        // }

        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo
       try
        {
            // Console.WriteLine(item.Id);
            // Console.WriteLine(item.SenhaAtual);
            // Console.WriteLine(item.SenhaConfirma);

            // encontro o usuário e armazeno na variável
            var usuarioAtual = await context.Usuarios.FindAsync(item.Id);
            if (usuarioAtual == null)
                return NotFound("Usuário inválido (1)");

            // //se não existe, erro, senão cria um novo tipo de curso
            // if (!await context.Usuarios.AnyAsync(p => p.Id == id))
            //     return NotFound("Usuário inválido (2)");

            var codBD = usuarioAtual.CodigoVerEmail;
            // Console.WriteLine("Senha BD");
            // Console.WriteLine(senhaBD);
            var codSite = CriaSenha(item.CodVer);  
            // Console.WriteLine("Senha Atual");            
            // Console.WriteLine(item.SenhaAtual);          
            // Console.WriteLine(senhaSite);

            // compara senha do banco com senha informada pelo site
            if (codBD != codSite)
             return NotFound("Código de Verificação inválido");

            // realiza troca de e-mail
            usuarioAtual.Email = usuarioAtual.EmailTemp;
            usuarioAtual.CodigoVerEmail = null;
            usuarioAtual.EmailTemp = null;
            DateTime dtBD = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtBD = Funcoes.TruncarParaMinuto(dtBD);                                            
            dtBD = Funcoes.TruncarParaSegundo(dtBD); 
            usuarioAtual.DtUltTrocaEmail = dtBD;
            usuarioAtual.Operacao = 0; // não há operação pendente
            await context.SaveChangesAsync();
            return Ok("E-mail alterada com sucesso");
        }
         catch(Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Altera Email / Erro ", errorMessage);
            return BadRequest("Usuários: Erro ao atualizar email");
        }
    }   

   [HttpPost("emailacesso")]
    public async Task<ActionResult> EnviaEmailAcesso([FromBody]UsuarioEmailInicial item)
    {
        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo
       try
        {
            var msgResult = "E-mail reenviado com sucesso!";
            // encontro o usuário e armazeno na variável
            var usuarioAtual = await context.Usuarios.FindAsync(item.UsuarioId);
            // operacao = 3 : indica que usuário foi criado 
            // e está pendente o primeiro acesso
            if ( (usuarioAtual == null) || (usuarioAtual.Operacao != 3))
                return NotFound("Usuário inválido (1)");

            // cria variáveis para incluir no e-mail
            var valSite = item.UrlSite;                  
            var valNome = usuarioAtual.Nome;
            var valEmail = usuarioAtual.Email;
            // ao reenviar o e-mail de primeiro acesso 
            // é necessário gerar uma nova senha
            var valSenha = GerarSenhaAleatoria();
            // atualiza essa senha no BD
            usuarioAtual.Senha = CriaSenha(valSenha);  // Gerar a senha aleatória e hasheada
            await context.SaveChangesAsync();

            // var resultadoEmail = await emailService.EmailUsuarioAsync(item.Nome, item.Email, valSenha,item.UrlSite,0);
            var emailResult = await emailService.EmailUsuarioAsync(valNome, valEmail, valSenha,valSite,0);
            // Console.WriteLine(resultadoEmail.Sucesso);
            // pelo retorno informa sucesso ou não da conclusão
            if (!emailResult.Sucesso)
            {
                msgResult = $"{msgResult} E-mail não enviado! Solicite o reenvio de e-mail!";
                // return Ok("Usuário salvo com sucesso MAS e-mail não foi enviado! Verifique seu provedor!");
            }            

            return Ok(msgResult);
            // return Ok("Senha alterada com sucesso");
        }
         catch(Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Email 1 Acesso / Erro ", errorMessage);
            return BadRequest("Usuários: Erro ao enviar e-mail");
        }
    }        

    [HttpPut("{id}")]
    public async Task<ActionResult> Put([FromRoute] int id, IFormCollection formData)
    {
        // O body do Put espera TODOS os dados. Se precisar, faça um get do registro desejado e copie o Json dele para enviar no body
        // Exemplo de body Json:
        // {
        //     "nome": "Usuario1",
        //     "email": "user1@example.com",
        //     "dtNasc": "2025-04-29T01:59:24.615Z",
        //     "tipo": 1,
        //     "ativo": true
        // }


        try
        {
            // O Put é usado na tela de Usuário para alterar somente ALGUNS campos (não todos)
            // por isso como são só alguns campos não posso usar PUT pois se algum campo faltar no objeto JSON, 
            // aquele campo será Null. Ex: se não colocar campo dtultacesso no Json esse campo será null na próxima chamada do verbo PUT
            var fotoResult = true;
            var msgResult = "Usuário salvo com sucesso!";

            // os dados recebidos pelo FormData serão passados para o DTO UsuarioPut
            // pra verificar se os dados estão com os valores e formatos válidos!
            var usuarioDto = new UsuarioPut
            {
                Id = Convert.ToInt16(formData["id"]),
                Nome = formData["nome"],
                Email = formData["email"],
                DtNasc = DateTime.Parse(formData["dtNasc"]),
                Tipo = Convert.ToByte(formData["tipo"]),
                Ativo = Convert.ToBoolean(formData["ativo"]),
                UrlSite = formData["urlsite"]
            };          

            // tento validar os dados que criei a partir do dto
            var validacaoResult = new List<ValidationResult>();
            var dadosValidos = Validator.TryValidateObject(usuarioDto, new ValidationContext(usuarioDto), validacaoResult, true);            

            // se algum dado NÃO é válido ele não conclui procedimento
            if (!dadosValidos)
            {
                return BadRequest(validacaoResult); // Retorna os erros de validação se houver
            }

            // Console.WriteLine(id);
            // Console.WriteLine(usuarioDto.Id);

            if (id != usuarioDto.Id) //se é diferente da rota, erro
                return BadRequest("Usuário inválido (1)");            

            // encontro o usuário e armazeno na variável
            var usuarioAtual = await context.Usuarios.FindAsync(id);
            if (usuarioAtual == null)
                return NotFound("Usuário inválido (2)");

            // //se não existe, erro, senão cria um novo tipo de curso
            // if (!await context.Usuarios.AnyAsync(p => p.Id == id))
            //     return NotFound("Usuário inválido (2)");


            // verifica se o Tipo Administrador é o mesmo registro da ID, caso não seja interrompe update
            if(usuarioDto.Tipo == 0)
            {
                // Console.WriteLine("Tentou como usuário Administrador");
                if (await VerificarAdminExistente(usuarioDto.Id))
                {
                   // não salva, é necessário ID existente em tabela Exames
                   return BadRequest("Já existe usuário Administrador para o sistema! Não é possível atualizar dados!");
                }                
            }   

            // verifica se e-mail NÃO existe na base de dados
            if (await VerificarEmailExistente(usuarioDto.Email, usuarioDto.Id))        
            {
                // não salva, é necessário ID existente em tabela Exames
                return BadRequest("Email informado já existe no sistema! Tente novamente!");
            }                

            // atualizo SOMENTE os campos que sei que serão enviados de tela de edição de usuário
            usuarioAtual.Nome = usuarioDto.Nome;
            // usuarioAtual.Email = model.Email;            
            // usuarioAtual.Tipo = model.Tipo;
            // formata data de nascimento
            // DateTime valNasc = Funcoes.ConverterParaHorarioLocal(usuarioDto.DtNasc); 
            DateTime valNasc = usuarioDto.DtNasc; 
            usuarioAtual.DtNasc = valNasc.Date; // somente parte da data
            usuarioAtual.Ativo = usuarioDto.Ativo;
            // context.Usuarios.Update(model);
            await context.SaveChangesAsync();

            // Verifica se existe algum arquivo na coleção de arquivos (foto) no formdata
            var fotoFile = formData.Files.FirstOrDefault(f => f.Name == "foto");
            // Console.WriteLine("Conteudo variavel foto");
            // Console.WriteLine(fotoFile);
            // Se houver pelo menos um arquivo com o nome 'foto', processa
            if (fotoFile != null && fotoFile.Length > 0)
            {
                var fotoService = new FotoService();  // Instancia o serviço de foto
                // salva a foto: informo a foto + id do usuário
                fotoResult = await fotoService.SalvarFotoAsync(fotoFile, usuarioAtual.Id);  // Salva a foto
                
                if(!fotoResult)
                {
                    msgResult = $"{msgResult} Foto não foi salva! Tente novamente!";
                }     
            }
            else
            {
                var fotoService = new FotoService();  // Instancia o serviço de foto
                // tenta excluir caso tenha a foto
                var exclusaoResult = await fotoService.ExcluirFotoAsync(usuarioAtual.Id); 
            }

            // return Ok("Usuário salvo com sucesso");
            return Ok(msgResult);
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Put / Erro ", errorMessage);
            return BadRequest("Usuários: Erro ao salvar o usuário informado");
        }
    }         

    // [HttpPut("{id}")]
    // public async Task<ActionResult> Put([FromRoute] int id, [FromBody] Usuario model)
    // {
    //     // O body do Put espera TODOS os dados. Se precisar, faça um get do registro desejado e copie o Json dele para enviar no body
    //     // Exemplo de body Json:
    //     // {
    //     //     "nome": "Usuario1",
    //     //     "email": "user1@example.com",
    //     //     "dtNasc": "2025-04-29T01:59:24.615Z",
    //     //     "tipo": 1,
    //     //     "ativo": true
    //     // }



    //     if (id != model.Id) //se é diferente da rota, erro
    //         return BadRequest("Usuário inválido (1)");

    //     try
    //     {
    //         // O Put é usado na tela de Usuário para alterar somente ALGUNS campos (não todos)
    //         // por isso como são só alguns campos não posso usar PUT pois se algum campo faltar no objeto JSON, 
    //         // aquele campo será Null. Ex: se não colocar campo dtultacesso no Json esse campo será null na próxima chamada do verbo PUT

    //         // encontro o usuário e armazeno na variável
    //         var usuarioAtual = await context.Usuarios.FindAsync(id);
    //         if (usuarioAtual == null)
    //             return NotFound("Usuário inválido (2)");

    //         // //se não existe, erro, senão cria um novo tipo de curso
    //         // if (!await context.Usuarios.AnyAsync(p => p.Id == id))
    //         //     return NotFound("Usuário inválido (2)");


    //         // verifica se o Tipo Administrador é o mesmo registro da ID, caso não seja interrompe update
    //         if(model.Tipo == 0)
    //         {
    //             Console.WriteLine("Tentou como usuário Administrador");
    //             if (await VerificarAdminExistente(model.Id))
    //             {
    //                // não salva, é necessário ID existente em tabela Exames
    //                return BadRequest("Já existe usuário Administrador para o sistema! Não é possível atualizar dados!");
    //             }                
    //         }   

    //         // verifica se e-mail NÃO existe na base de dados
    //         if (await VerificarEmailExistente(model.Email, model.Id))        
    //         {
    //             // não salva, é necessário ID existente em tabela Exames
    //             return BadRequest("Email informado já existe no sistema! Tente novamente!");
    //         }                

    //         // atualizo SOMENTE os campos que sei que serão enviados de tela de edição de usuário
    //         usuarioAtual.Nome = model.Nome;
    //         // usuarioAtual.Email = model.Email;            
    //         // usuarioAtual.Tipo = model.Tipo;
    //         // formata data de nascimento
    //         DateTime valNasc = Funcoes.ConverterParaHorarioLocal(model.DtNasc); 
    //         usuarioAtual.DtNasc = valNasc.Date; // somente parte da data
    //         usuarioAtual.Ativo = model.Ativo;
           
    //         // context.Usuarios.Update(model);
    //         await context.SaveChangesAsync();
    //         return Ok("Usuário salvo com sucesso");
    //     }
    //     catch
    //     {
    //         return BadRequest("Erro ao salvar o usuário informado");
    //     }
    // }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete([FromRoute] int id)
    {
        try
        {   // Antes de excluir verifica se o usuário informado
            // NUNCA utilizou o sistema (DtUltAcesso = null)
            // AnyAsync retorna true/false ao verificar se há registro na tabela ou não 
            // a partir do critério informado
            var jaAcessou = await context.Usuarios.AnyAsync(a => a.Id == id && a.DtUltAcesso != null);

            // Console.WriteLine("Já Acessou?");
            // Console.WriteLine(jaAcessou);
            // se já acessou
            if (jaAcessou)
            {
                return BadRequest("Não é possível excluir Usuário que já acessou o sistema!");
            }

            Usuario model = await context.Usuarios.FindAsync(id);

            if (model == null)
                return NotFound("Usuário inválido");

            context.Usuarios.Remove(model);
            await context.SaveChangesAsync();


            // caso exista foto, vai remover foto:
            // tenta excluir caso tenha a foto
            var fotoService = new FotoService();  // Instancia o serviço de foto
            var exclusaoResult = await fotoService.ExcluirFotoAsync(id); 


            return Ok("Usuário removido com sucesso");
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Delete / Erro ", errorMessage);
            return BadRequest("Usuários: Falha ao remover o Usuário");
        }
    }

    [HttpGet("gridUsuario")]
    public async Task<ActionResult<IEnumerable<object>>> GridUsuario()
    {
        // lista Usuários para grid
        try
        {
            // somente os Usuários
            // List<Usuario> resultado = await context.Usuarios.OrderBy(a => a.Nome).ToListAsync();
            var resultado = await context.Usuarios
                .OrderBy(a => a.Nome)
                .Select(a => new 
                {
                    a.Id,
                    a.Nome,
                    a.Email,
                    a.Senha,
                    a.DtNasc,
                    a.Tipo,
                    a.Ativo,
                    a.DtUltAcesso,
                    a.DtUltTrocaEmail,
                    a.DtUltTrocaSenha,
                    a.Operacao,
                })
                .ToListAsync();                            
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - GridUsuário / Erro ", errorMessage);
            return BadRequest("Usuários: erro ao listar Usuários");
        }
    }    

    [HttpGet("seluserpwd/{id}")]
    public async Task<ActionResult<IEnumerable<object>>> SelectUsuarioSenha([FromRoute] int id)
    {
        // lista Usuários por id
        try
        {
            // somente os Usuários
            var resultado = await context.Usuarios
                .Where( a => a.Id == id && a.Ativo == true && a.Operacao == 1 )
                .Select(a => new 
                {
                    a.Id,
                    a.Nome,
                    a.Email,                    
                    a.Ativo,
                    a.Tipo,
                    a.Operacao,
                    a.EmailTemp,
                })
                .ToListAsync();                            
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Select Usuário (Senha) / Erro ", errorMessage);
            return BadRequest("Usuários: erro ao identificar Usuário");
        }
    }        

    [HttpGet("selacessopwd/{id}")]
    public async Task<ActionResult<IEnumerable<object>>> SelectAcessoSenha([FromRoute] int id)
    {
        // lista Usuários por id
        try
        {
            // somente os Usuários de PRIMEIRO ACESSO (Operacao = 3)
            var resultado = await context.Usuarios
                .Where( a => a.Id == id && a.Ativo == true && a.Operacao == 3 )
                .Select(a => new 
                {
                    a.Id,
                    a.Nome,
                    a.Email,                    
                    a.Ativo,
                    a.Tipo,
                    a.Operacao,
                    a.EmailTemp,
                })
                .ToListAsync();                            
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Select Acesso (Senha) / Erro ", errorMessage);
            return BadRequest("Usuários: erro ao identificar Usuário");
        }
    }    

    [HttpGet("selusermail/{id}")]
    public async Task<ActionResult<IEnumerable<object>>> SelectUsuarioEmail([FromRoute] int id)
    {
        // lista Usuários por id
        try
        {
            // somente os Usuários
            var resultado = await context.Usuarios
                .Where( a => a.Id == id && a.Ativo == true && a.Operacao == 2 )
                .Select(a => new 
                {
                    a.Id,
                    a.Nome,
                    a.Email,                    
                    a.Ativo,
                    a.Tipo,
                    a.Operacao,
                    a.EmailTemp,
                })
                .ToListAsync();                            
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Select Usuário (Email) / Erro ", errorMessage);
            return BadRequest("Usuários: erro ao identificar Usuário");
        }
    }            

    [HttpPost("reqpwd")]
    public async Task<ActionResult> EnviaReqSenha([FromBody]UsuarioAltSenha item)
    {
        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo

        try
        {
            // verifica se existe agendamento informado (e ativo) e retorna campos desejados
            // var usuarioInfo = await context.Usuarios
            //     .Where(a => a.Id == item.UsuarioId && a.Ativo == true)
            //     .Select(a => new 
            //     {
            //         a.Nome,
            //         a.Email
            //     })
            //     .FirstOrDefaultAsync();

            var usuario = await context.Usuarios
            .FirstOrDefaultAsync(a => a.Id == item.UsuarioId && a.Ativo == true);

            if (usuario == null)
            {
                return NotFound("Usuário não encontrado.");
            }

            // obtem nome e e-mail
            var nomeUsuario = usuario.Nome;
            var emailUsuario = usuario.Email;
            var valCodigo = GerarSenhaAleatoria();

            usuario.CodigoVerSenha = CriaSenha(valCodigo);
            usuario.Operacao = 1; // 1 = troca de senha

            // Salva a alteração no banco
            await context.SaveChangesAsync();

            // após salvar busca dados para enviar email
            // nome do paciente 
            // string nomePaciente = await BuscaDadosPacienteID(item.PacienteId);
            var resultadoEmail = await emailService.EmailUsuarioAsync(nomeUsuario, emailUsuario, valCodigo, item.UrlSite ,1);
            // pelo retorno informa sucesso ou não da conclusão
            if (resultadoEmail.Sucesso)
            {
                return Ok("Redefinição de senha enviado com sucesso!");
            }
            else
            {
                return BadRequest("Não foi possível enviar redefinição de senha!");            
            }              


        }
        catch (Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Req. Senha / Erro ", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Usuários: Erro enviar redefinição de senha");            
        }        
    }        

   [HttpPost("alterapwd2")]
    public async Task<ActionResult> AlteraSenha([FromBody]UsuarioSenha2 item)
    {
       try
        {
            // Console.WriteLine(item.Id);
            // Console.WriteLine(item.SenhaAtual);
            // Console.WriteLine(item.SenhaConfirma);

            // encontro o usuário e armazeno na variável
            var usuarioAtual = await context.Usuarios.FindAsync(item.UsuarioID);
            if (usuarioAtual == null)
                return NotFound("Usuário inválido (1)");

            // compara senha atual entre: bd e informada no site
            var senhaBD = usuarioAtual.Senha;
            var senhaAtual = CriaSenha(item.SenhaAntiga); 
            if (senhaBD != senhaAtual)
             return NotFound("Senha atual inválida!");
            var senhaNova = CriaSenha(item.SenhaNova);  
            // atualizo SOMENTE os campos que sei que serão enviados de tela de edição de usuário
            usuarioAtual.Senha = senhaNova;
            // inform data ult alt senha
            DateTime dtBD = Funcoes.ConverterParaHorarioLocal(DateTime.Now);                
            // dtBD = Funcoes.TruncarParaMinuto(dtBD);                                            
            dtBD = Funcoes.TruncarParaSegundo(dtBD);        
            usuarioAtual.DtUltTrocaSenha = dtBD;
            usuarioAtual.CodigoVerSenha = null;
            usuarioAtual.Operacao = 0; // não há operação pendente
            await context.SaveChangesAsync();
            return Ok("Senha alterada com sucesso");
        }
         catch(Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Altera Senha 2 / Erro ", errorMessage);
            return BadRequest("Usuários: Erro ao alterar senha");
        }
    }      

    [HttpPost("reqmail")]
    public async Task<ActionResult> EnviaReqEmail([FromBody]UsuarioAltEmail item)
    {
        // No Postman é necessário:
        // a) Body: Tipo raw + Json 
        // b) Body: informar no corpo o conteúdo json. Pode ser aquele acima por exemplo

        try
        {
            // verifica se existe agendamento informado (e ativo) e retorna campos desejados
            // var usuarioInfo = await context.Usuarios
            //     .Where(a => a.Id == item.UsuarioId && a.Ativo == true)
            //     .Select(a => new 
            //     {
            //         a.Nome,
            //         a.Email
            //     })
            //     .FirstOrDefaultAsync();

            var usuario = await context.Usuarios
            .FirstOrDefaultAsync(a => a.Id == item.UsuarioId && a.Ativo == true);

            if (usuario == null)
            {
                return NotFound("Usuário não encontrado.");
            }

            // obtem nome e e-mail
            var nomeUsuario = usuario.Nome;
            var emailNovo = item.EmailNovo;
            var valCodigo = GerarSenhaAleatoria();

            usuario.CodigoVerEmail = CriaSenha(valCodigo);
            usuario.Operacao = 2; // 2 = troca de email
            usuario.EmailTemp = emailNovo; // registra novo e-mail temporário só pra questão de registro

            // Salva a alteração no banco
            await context.SaveChangesAsync();

            // após salvar busca dados para enviar email
            // nome do paciente 
            // string nomePaciente = await BuscaDadosPacienteID(item.PacienteId);
            var resultadoEmail = await emailService.EmailUsuarioAsync(nomeUsuario, emailNovo, valCodigo, item.UrlSite ,2);
            // pelo retorno informa sucesso ou não da conclusão
            if (resultadoEmail.Sucesso)
            {
                return Ok("Solicitação de troca de e-mail enviada com sucesso!");
            }
            else
            {
                return BadRequest("Não foi possível enviar solicitação de troca de e-mail!");            
            }              


        }
        catch (Exception ex)
        {
            // Aqui  pega a mensagem de erro da exceção
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Usuários - Req. Email / Erro ", errorMessage);
            // Console.WriteLine(errorMessage);
            // return BadRequest($"Erro ao salvar o Agendamento informado: {ex.Message}");
            return BadRequest("Usuários: Erro enviar solicitação de troca de e-mail");            
        }        
    }            

    [Route("pesquisa")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Usuario>>> Pesquisa([FromBody] object item)
    {
        // URL de exemplo para acessar: http://localhost:5175/api/Usuario/pesquisa/
        // o conteúdo da pesquisa NÃO estará na rota, mas no corpo do Body (no Postman: raw + Json)
        // Abaixo exemplo de pesquisa de nome e e-mail enviando no body da requisição.
        // Perceba que os campos do body da requisição são IGUAIS como declarados na model. Pois parece que é case sensitive. 
        // Se colocar tudo minúsculo ou maiúsculo NÃO dá certo. Abaixo exemplo com os nomes iguais ao model Usuário:
//    {
//         "Nome": "Usuario4",
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

            Usuario model = JsonSerializer.Deserialize<Usuario>(item.ToString(),options);

            List<Usuario> resultado = await context.Usuarios
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