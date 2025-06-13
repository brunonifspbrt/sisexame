using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;

 public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<EmailResult> EmailUsuarioAsync(string nomeDes, string emailDes, string mensagem, string caminhoSite = "", int tipo = 0)
        {
            try
            {
                // configura formato de mensagem
                // tipo 0 = usuário criado e e-mail será de primeiro acesso
                var emailAssunto = "";
                var emailMsg = "";

                if(tipo==0)
                {
                  emailAssunto = "Sistema de Exames - Primeiro Acesso";
                  emailMsg = $@"
                    <html>
                    <body style='margin:0; padding:0; background-color:#f9f9f9; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif; color:#333;'>
                        <div style='max-width:600px; margin:40px auto; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); padding:30px;'>
                            <h2 style='color:#1e88e5;'>Bem-vindo(a), {nomeDes}!</h2>
                            <p>Você foi cadastrado no <strong>Sistema de Exames</strong>.</p>
                            <br />
                            <p>Sua senha temporária é:</p>
                            <p style='font-size:1.2em; font-weight:bold; color:#d32f2f;'>{mensagem}</p>
                            <br />
                            <p>Para escolher sua senha definitiva e acessar o sistema, clique no botão abaixo:</p>
                            <a href='{caminhoSite}' target='_blank'
                                style='
                                    display:inline-block;
                                    margin-top:20px;
                                    padding:12px 24px;
                                    background-color:#6c757d;
                                    color:#ffffff;
                                    text-decoration:none;
                                    border-radius:4px;
                                    font-weight:bold;
                                    font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;
                                    font-size:16px;
                                '>
                                Acessar Sistema
                            </a>
                            <br /><br />
                            <div style='margin-top:30px; font-size:0.9em; color:#777;'>
                                <p>Se você não esperava este e-mail, por favor ignore-o.</p>
                                <p>Atenciosamente,<br />Equipe do Sistema de Exames</p>
                            </div>
                        </div>
                    </body>
                    </html>";


                }

                if(tipo==1)
                {
                    emailAssunto = "Sistema de Exames - Redefinição de Senha";
                    emailMsg = $@"
                    <html>
                    <body style='margin:0; padding:0; background-color:#f4f4f4; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif; color:#333;'>
                        <div style='max-width:600px; margin:40px auto; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); padding:30px;'>
                            <h2 style='color:#1e88e5; margin-top:0;'>Olá, {nomeDes}!</h2>
                            <p>Recebemos uma solicitação para alteração de senha no <strong>Sistema de Exames</strong>.</p>
                            <br />
                            <p>Seu código temporário é:</p>
                            <p style='font-size:1.2em; font-weight:bold; color:#d32f2f;'>{mensagem}</p>
                            <br />
                            <p>Para prosseguir com a redefinição, clique no botão abaixo:</p>
                            <a href='{caminhoSite}' target='_blank'
                                style='
                                    display:inline-block;
                                    margin-top:20px;
                                    padding:12px 24px;
                                    background-color:#6c757d;
                                    color:#ffffff;
                                    text-decoration:none;
                                    border-radius:4px;
                                    font-weight:bold;
                                    font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;
                                    font-size:16px;
                                '>
                                Alterar Senha
                            </a>
                            <br /><br />
                            <div style='margin-top:30px; font-size:0.9em; color:#777;'>
                                <p>Se você não solicitou esta alteração, pode ignorar este e-mail.</p>
                                <p>Atenciosamente,<br />Equipe do Sistema de Exames</p>
                            </div>
                        </div>
                    </body>
                    </html>";



                }                

                if(tipo==2)
                {
                    emailAssunto = "Sistema de Exames - Alteração de E-mail";
                    emailMsg = $@"
                    <html>
                    <body style='margin:0; padding:0; background-color:#f4f4f4; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif; color:#333;'>
                        <div style='max-width:600px; margin:40px auto; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); padding:30px;'>
                            <h2 style='color:#1e88e5; margin-top:0;'>Olá, {nomeDes}!</h2>
                            <p>Recebemos uma solicitação para alteração de e-mail no <strong>Sistema de Exames</strong>.</p>
                            <br />
                            <p>Seu código temporário é:</p>
                            <p style='font-size:1.2em; font-weight:bold; color:#d32f2f;'>{mensagem}</p>
                            <br />
                            <p>Para prosseguir com a troca de e-mail, clique no botão abaixo:</p>
                            <a href='{caminhoSite}' target='_blank'
                                style='
                                    display:inline-block;
                                    margin-top:20px;
                                    padding:12px 24px;
                                    background-color:#6c757d;
                                    color:#ffffff;
                                    text-decoration:none;
                                    border-radius:4px;
                                    font-weight:bold;
                                    font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;
                                    font-size:16px;
                                '>
                                Alterar E-mail
                            </a>
                            <br /><br />
                            <div style='margin-top:30px; font-size:0.9em; color:#777;'>
                                <p>Se você não solicitou esta alteração, pode ignorar este e-mail.</p>
                                <p>Atenciosamente,<br />Equipe do Sistema de Exames</p>
                            </div>
                        </div>
                    </body>
                    </html>";



                }                     
                // Console.WriteLine(emailMsg);

                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(_config["EmailSettings:From"]));
                email.To.Add(MailboxAddress.Parse(emailDes));
                email.Subject = emailAssunto;

                email.Body = new MimeKit.TextPart("html")
                {
                    Text = emailMsg
                };

                using var smtp = new SmtpClient();
                // resolve erro ao enviar e-mail: "The remote certificate was rejected by the provided RemoteCertificateValidationCallback."
                smtp.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true;
                await smtp.ConnectAsync(
                    _config["EmailSettings:SmtpServer"],
                    int.Parse(_config["EmailSettings:Port"]),
                    SecureSocketOptions.StartTls
                );
                await smtp.AuthenticateAsync(
                    _config["EmailSettings:From"],
                    _config["EmailSettings:Password"]
                );
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
                Logger.EscreveLog("EmailService - Envio Usuário", "Email enviado com sucesso");              
                return new EmailResult { Sucesso = true, Mensagem = "E-mail enviado com sucesso." };
            }
            catch (Exception ex)
            {
                string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                Logger.EscreveLog("EmailService - Envio Usuário / Erro ", errorMessage);              
                // Aqui você pode logar o erro, lançar uma exceção customizada ou apenas repropagar
                return new EmailResult { Sucesso = false, Mensagem = $"Erro ao enviar e-mail: {ex.Message}" };
            }
        }

        // public async Task<EmailResult> EmailAgendamentoAsync(string nomePac, string emailPac, string nomeEx, DateTime? dataEx,string mensagem, int tipo = 0)
        public async Task<EmailResult> EmailAgendamentoAsync(string nomePac, string emailPac, string nomeEx, string instEx, DateTime? dataEx,string mensagem, int tipo = 0)
        {
            try
            {
                // configura formato de mensagem
                // tipo 0 = usuário criado e e-mail será de primeiro acesso
                var emailAssunto = "";
                var emailMsg = "";

                if(tipo==0)
                {
                    emailAssunto = "Sistema de Exames - Novo Agendamento de Exame";
                    emailMsg = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px; margin: 0;'>
                        <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);'>
                            <h2 style='color: #4CAF50; text-align: center;'>Olá, {nomePac}!</h2>
                            
                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                Esperamos que esteja bem! Gostaríamos de informar que o exame <strong>{nomeEx}</strong> foi agendado com sucesso.
                            </p>

                            <br />

                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                A data do exame é: <strong>{(dataEx != null ? $"{dataEx:dddd, dd 'de' MMMM 'de' yyyy 'às' HH:mm}" : "")}</strong>.<br />
                                Por favor, compareça no local com 15 minutos de antecedência.
                            </p>

                            <br />

                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                <strong>Instruções para o exame:</strong><br />
                                {instEx}
                            </p>

                            <br />

                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                Caso tenha alguma dúvida ou precise reagendar, não hesite em nos contatar.
                            </p>

                            <br />

                            <p style='font-size: 16px; text-align: center; color: #888888;'>
                                Atenciosamente,<br />
                                <strong>Equipe de Atendimento</strong>
                            </p>
                        </div>
                    </body>
                    </html>";

                }

                if(tipo==1)
                {
                    emailAssunto = "Sistema de Exames - Alteração de Agendamento";
                    emailMsg = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px; margin: 0;'>
                        <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);'>
                            <h2 style='color: #4CAF50; text-align: center;'>Olá, {nomePac}!</h2>
                            
                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                Houve alterações em seu agendamento! O exame agendado é <strong>{nomeEx}</strong>.
                            </p>

                            <br />

                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                A data do exame é: <strong>{(dataEx != null ? $"{dataEx:dddd, dd 'de' MMMM 'de' yyyy 'às' HH:mm}" : "")}</strong>.<br />
                                Por favor, compareça no local com 15 minutos de antecedência.
                            </p>

                            <br />

                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                <strong>Instruções para o exame:</strong><br />
                                {instEx}
                            </p>

                            <br />

                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                Caso tenha alguma dúvida ou precise reagendar, não hesite em nos contatar.
                            </p>

                            <br />

                            <p style='font-size: 16px; text-align: center; color: #888888;'>
                                Atenciosamente,<br />
                                <strong>Equipe de Atendimento</strong>
                            </p>
                        </div>
                    </body>
                    </html>";

                }             

                if(tipo==2)
                {
                    emailAssunto = "Sistema de Exames - Agendamento Cancelado";
                    emailMsg = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px; margin: 0;'>
                        <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);'>
                            <h2 style='color: #4CAF50; text-align: center;'>Olá, {nomePac}!</h2>

                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                O seu agendamento para o exame <strong>{nomeEx}</strong> foi <strong>cancelado</strong>.
                            </p>

                            <br />

                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                <strong>Desconsidere</strong> a data do exame de: <strong>{(dataEx != null ? $"{dataEx:dddd, dd 'de' MMMM 'de' yyyy 'às' HH:mm}" : "")}</strong>.
                            </p>

                            <br />

                            <p style='font-size: 16px; line-height: 1.5; color: #333333;'>
                                Caso tenha alguma dúvida ou precise reagendar, não hesite em nos contatar.
                            </p>

                            <br />

                            <p style='font-size: 16px; text-align: center; color: #888888;'>
                                Atenciosamente,<br />
                                <strong>Equipe de Atendimento</strong>
                            </p>
                        </div>
                    </body>
                    </html>";

                }        
                // Console.WriteLine(emailMsg);

                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(_config["EmailSettings:From"]));
                email.To.Add(MailboxAddress.Parse(emailPac));
                email.Subject = emailAssunto;

                email.Body = new MimeKit.TextPart("html")
                {
                    Text = emailMsg
                };

                using var smtp = new SmtpClient();
                // resolve erro ao enviar e-mail: "The remote certificate was rejected by the provided RemoteCertificateValidationCallback."
                smtp.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true;                
                await smtp.ConnectAsync(
                    _config["EmailSettings:SmtpServer"],
                    int.Parse(_config["EmailSettings:Port"]),
                    SecureSocketOptions.StartTls
                );
                await smtp.AuthenticateAsync(
                    _config["EmailSettings:From"],
                    _config["EmailSettings:Password"]
                );
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
                                Logger.EscreveLog("EmailService - Envio Agendamento", "Email enviado com sucesso");              
                return new EmailResult { Sucesso = true, Mensagem = "E-mail enviado com sucesso." };
                
            }
            catch (Exception ex)
            {
                string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                Logger.EscreveLog("EmailService - Envio Agendamento / Erro ", errorMessage);              
                return new EmailResult { Sucesso = false, Mensagem = $"Erro ao enviar e-mail: {ex.Message}" };
            }
        }        
    }
