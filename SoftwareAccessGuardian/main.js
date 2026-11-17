
require('dotenv').config();

const {
    ipcMain,
    app,
    BrowserWindow,
    nativeTheme,
    screen
} = require('electron');

const { randomInt } = require('node:crypto');
const path = require('node:path');

// Repositório de login
const { loginUser } = require('./database/loginRepository.js');

// Repositório de recuperação de senha
const {
    verificarEmailGestorSeguranca,
    salvarCodigoRecuperacao,
    validarCodigoRecuperacao,
    atualizarSenhaRecuperacao
} = require('./database/recuperacaoSenha');

// Serviço de envio de e-mail
const { enviarCodigoEmail, enviarReclamacaoEmail } = require('./services/emailService');

// Armazena as sessões dos usuários autenticados
const sessoesAutenticadas = new Map();

let janelaSeguranca;

// ==================================================
// CRIAÇÃO DA JANELA PRINCIPAL
// ==================================================

function janelaInicio() {
    const { width, height } =
        screen.getPrimaryDisplay().workAreaSize;

    janelaSeguranca = new BrowserWindow({
        width,
        height,
        autoHideMenuBar: true,

        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    janelaSeguranca.on('closed', () => {
        sessoesAutenticadas.delete(janelaSeguranca.webContents.id);
        janelaSeguranca = null;
    });

    janelaSeguranca.webContents.openDevTools({
        mode: 'detach'
    });

    janelaSeguranca.loadFile('pages/inicio.html');


    return janelaSeguranca;
}

// ==================================================
// INICIALIZAÇÃO DO ELECTRON E DO ARDUINO
// ==================================================

app.whenReady().then(() => {
    nativeTheme.themeSource = 'light';

    const janela = janelaInicio();

    require('./arduino/arduino.js')
        .iniciarArduino(janela);
});

// ==================================================
// LOGIN
// ==================================================

ipcMain.handle('loginUser', async (event, dados) => {
    try {
        const user = await loginUser(
            dados.email,
            dados.senha
        );

        if (!user) {
            sessoesAutenticadas.delete(event.sender.id);

            return {
                success: false,
                user: null
            };
        }

        // Registra os dados corretos do usuário autenticado
        sessoesAutenticadas.set(event.sender.id, {
            nome: user.nome_seguranca,
            email: user.email_seguranca
        });

        console.log('Sessão autenticada:', {
            possuiNome: Boolean(user.nome_seguranca),
            possuiEmail: Boolean(user.email_seguranca)
        });

        return {
            success: true,
            user: user
        };

    } catch (erro) {
        console.error('Erro ao realizar login:', erro);

        return {
            success: false,
            error: 'Erro ao realizar login.'
        };
    }
});

// ==================================================
// VERIFICAR SESSÃO AUTENTICADA
// ==================================================

ipcMain.handle('obterSessaoAtual', (event) => {
    const usuario = sessoesAutenticadas.get(event.sender.id);

    if (!usuario) {
        return {
            autenticado: false
        };
    }

    return {
        autenticado: true,
        usuario: {
            nome: usuario.nome,
            email: usuario.email
        }
    };
});


// ==================================================
// ENVIAR RECLAMAÇÃO
// ==================================================

ipcMain.handle(
    'enviarReclamacao',
    async (event, reclamacao) => {

        try {
            // Verifica se existe uma sessão autenticada
            const usuario = sessoesAutenticadas.get(event.sender.id);

            if (!usuario) {
                return {
                    sucesso: false,
                    mensagem: 'Faça login para enviar uma reclamação.'
                };
            }

            // Valida o conteúdo
            if (typeof reclamacao !== 'string') {
                return {
                    sucesso: false,
                    mensagem: 'Reclamação inválida.'
                };
            }

            const texto = reclamacao.trim();

            if (texto.length < 5 || texto.length > 5000) {
                return {
                    sucesso: false,
                    mensagem: 'A reclamação deve possuir entre 5 e 5000 caracteres.'
                };
            }
            console.log('Verificação dos dados da reclamação:', {
                possuiNome: Boolean(usuario.nome),
                possuiEmail: Boolean(usuario.email),
                possuiReclamacao: Boolean(texto)
            });

            // Envia utilizando os dados da sessão
            await enviarReclamacaoEmail({
                nome: usuario.nome,
                email: usuario.email,
                reclamacao: texto
            });

            return {
                sucesso: true,
                mensagem: 'Reclamação enviada com sucesso!'
            };

        } catch (erro) {
            console.error('Erro ao enviar reclamação:', erro);

            return {
                sucesso: false,
                mensagem: 'Não foi possível enviar a reclamação.'
            };
        }
    }
);



// ==================================================
// SOLICITAR CÓDIGO DE RECUPERAÇÃO
// ==================================================

ipcMain.handle(
    'verificarEmailGestorSeguranca',
    async (_event, { email, tipoUser }) => {

        // Identifica em qual etapa ocorreu a falha
        let etapa = 'validar o e-mail';

        try {
            if (
                typeof email !== 'string' ||
                !email.trim() ||
                !['gestor', 'seguranca'].includes(tipoUser)
            ) {
                return {
                    sucesso: false,
                    mensagem: 'Informe um e-mail válido e selecione sua função.'
                };
            }

            email = email.trim();

            // 1. Verifica se o e-mail existe
            const situacao =
                await verificarEmailGestorSeguranca(email, tipoUser);

            if (!situacao) {
                return {
                    sucesso: false,
                    mensagem: 'E-mail não encontrado.'
                };
            }

            // 2. Gera o código de seis dígitos
            etapa = 'gerar o código';

            const codigo = randomInt(100000, 1000000).toString();

            // 3. Salva o código e sua validade no banco
            etapa = 'salvar o código no banco de dados';

            const salvo = await salvarCodigoRecuperacao(
                email,
                tipoUser,
                codigo
            );

            if (!salvo) {
                return {
                    sucesso: false,
                    mensagem: 'Não foi possível salvar o código de recuperação.'
                };
            }

            // 4. Envia o código por e-mail
            etapa = 'enviar o e-mail';

            await enviarCodigoEmail(email, codigo);

            console.log(
                'Código de recuperação enviado com sucesso.'
            );

            return {
                sucesso: true,
                mensagem: 'Código enviado com sucesso.'
            };

        } catch (erro) {
            console.error(
                `Erro ao ${etapa}:`,
                erro
            );

            return {
                sucesso: false,
                mensagem: `Falha ao ${etapa}. Consulte o terminal do Electron.`
            };
        }
    }
);

// ==================================================
// VALIDAR CÓDIGO DE RECUPERAÇÃO
// ==================================================

ipcMain.handle(
    'validarCodigoRecuperacao',
    async (_event, { email, tipoUser, codigo }) => {

        try {
            if (
                typeof email !== 'string' ||
                typeof codigo !== 'string' ||
                !['gestor', 'seguranca'].includes(tipoUser)
            ) {
                return {
                    sucesso: false,
                    mensagem: 'Dados de recuperação inválidos.'
                };
            }

            const valido = await validarCodigoRecuperacao(
                email.trim(),
                tipoUser,
                codigo.trim()
            );

            return {
                sucesso: valido,
                mensagem: valido
                    ? 'Código válido.'
                    : 'Código inválido ou expirado.'
            };

        } catch (erro) {
            console.error(
                'Erro na validação do código de recuperação:',
                erro
            );

            return {
                sucesso: false,
                mensagem: 'Erro ao validar o código. Consulte o terminal.'
            };
        }
    }
);

// ==================================================
// ATUALIZAR SENHA
// ==================================================

ipcMain.handle(
    'atualizarSenhaRecuperacao',
    async (_event, { email, tipoUser, codigo, novaSenha }) => {

        try {
            if (
                typeof email !== 'string' ||
                typeof codigo !== 'string' ||
                typeof novaSenha !== 'string' ||
                !['gestor', 'seguranca'].includes(tipoUser)
            ) {
                return {
                    sucesso: false,
                    mensagem: 'Dados de recuperação inválidos.'
                };
            }

            if (novaSenha.length < 8) {
                return {
                    sucesso: false,
                    mensagem: 'A senha deve ter pelo menos 8 caracteres.'
                };
            }

            const atualizado = await atualizarSenhaRecuperacao(
                email.trim(),
                tipoUser,
                codigo.trim(),
                novaSenha
            );

            return {
                sucesso: atualizado,
                mensagem: atualizado
                    ? 'Senha atualizada com sucesso.'
                    : 'Código inválido ou expirado. Solicite outro.'
            };

        } catch (erro) {
            console.error(
                'Erro na atualização da senha:',
                erro
            );

            return {
                sucesso: false,
                mensagem: 'Erro ao atualizar a senha. Consulte o terminal.'
            };
        }
    }
);