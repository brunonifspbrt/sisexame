using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

public class FotoService
{
    private readonly string _diretorioFotos;

    public FotoService()
    {
        // Caminho da pasta 'fotos' na raiz do projeto
        _diretorioFotos = Path.Combine(Directory.GetCurrentDirectory(), "fotos");
        // Console.WriteLine(_diretorioFotos);

        // Crio a pasta 'fotos' caso não exista
        if (!Directory.Exists(_diretorioFotos))
        {
            Directory.CreateDirectory(_diretorioFotos);
            Logger.EscreveLog("Foto Service - Criação de Pasta Fotos", "Criado com sucesso");
        }
    }

    // Propriedade para acessar o diretório de fotos
    public string DiretorioFotos => _diretorioFotos;

    // Função para salvar a foto do usuário
    public async Task<bool> SalvarFotoAsync(IFormFile fotoFile, int usuarioId)
    {
        try
        {
            // Cria o caminho para o arquivo de foto com o Id do usuário
            var caminhoArquivo = Path.Combine(_diretorioFotos, $"{usuarioId}.jpg");

            // Verifica se a foto foi recebida e tem conteúdo
            if (fotoFile != null && fotoFile.Length > 0)
            {
                // Salva a foto no diretório
                using (var stream = new FileStream(caminhoArquivo, FileMode.Create))
                {
                    await fotoFile.CopyToAsync(stream);
                }
                Logger.EscreveLog("Foto Service - Salvar Foto", "Foto salva com sucesso");            
                return true; // Foto salva com sucesso
            }

            return false; // Se o arquivo não for válido
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            Logger.EscreveLog("Foto Service - Salvar Foto / Erro ", errorMessage);            
            // Console.WriteLine(errorMessage);  
            // Caso ocorra algum erro durante o processo
            return false;
        }
    }

    public async Task<bool> ExcluirFotoAsync(int usuarioId)
    {
        try
        {
            // Cria o caminho para o arquivo de foto com o Id do usuário
            var caminhoArquivo = Path.Combine(_diretorioFotos, $"{usuarioId}.jpg");

            // Verifica se a foto existe
            if (System.IO.File.Exists(caminhoArquivo))
            {
                // Exclui o arquivo de foto
                System.IO.File.Delete(caminhoArquivo);     
                Logger.EscreveLog("FotoService - Excluir Foto", "Foto removida com sucesso");           
            }
            return true; // Foto excluída com sucesso
        }
        catch (Exception ex)
        {
            string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            // Console.WriteLine(errorMessage);  
            Logger.EscreveLog("FotoService - Excluir Foto / Erro ", errorMessage);
            // Caso ocorra algum erro durante o processo
            return false;
        }
    }    
}
