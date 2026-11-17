
const nodemailer = require('nodemailer');
const path = require('path');

// ==================================================
// CONFIGURAÇÃO DO TRANSPORTE DE E-MAIL
// ==================================================

const transportMail = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// ==================================================
// PROTEÇÃO CONTRA HTML INDESEJADO
// ==================================================

function escaparHtml(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere]);
}

// Remetente oficial do sistema
const remetente = {
    name: 'Access Guardian',
    address: process.env.SMTP_USER
    
};

// ==================================================
// ENVIAR RECLAMAÇÃO
// ==================================================

async function enviarReclamacaoEmail({
    nome,
    email,
    reclamacao
}) {
    if (
        !nome ||
        !email ||
        !reclamacao ||
        !process.env.EMAIL_DESTINO
    ) {
        throw new Error('Dados da reclamação incompletos.');
    }

    const nomeSeguro = escaparHtml(nome);
    const emailSeguro = escaparHtml(email);
    const reclamacaoSegura = escaparHtml(reclamacao);

    const data = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
    });

    const info = await transportMail.sendMail({
        from: remetente,

        // Destinatário exclusivo das reclamações
        to: process.env.EMAIL_DESTINO,

        // Permite responder ao usuário
        replyTo: email,

        subject: 'Nova reclamação - Access Guardian',

        text: `
Nova reclamação recebida pelo Access Guardian.

Nome: ${nome}
E-mail: ${email}
Data: ${data}

Reclamação:
${reclamacao}
        `,

        html: `
        <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 25px; background: #f5f5f5; border-radius: 10px;">
            <div style="background: #174493; padding: 20px; border-radius: 8px; text-align: center;">
                <h2 style="color: white;">Access Guardian</h2>
                <p style="color: white;">Nova reclamação recebida</p>
            </div>

            <div style="background: white; padding: 20px; margin-top: 15px; border-radius: 8px;">
                <p><strong>Nome:</strong> ${nomeSeguro}</p>
                <p><strong>E-mail:</strong> ${emailSeguro}</p>
                <p><strong>Data:</strong> ${data}</p>
                <hr>
                <h3>Descrição da reclamação:</h3>
                <div style="background: #f1f3f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; overflow-wrap: anywhere;">${reclamacaoSegura}</div>
            </div>

            <p style="text-align: center; color: #777; font-size: 12px; margin-top: 20px;">
                Access Guardian — Sistema de controle de acesso escolar
            </p>
        </div>
        `
    });

    console.log('Detalhes completos do envio:', {
        messageId: info.messageId,
        envelope: info.envelope,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response
    });

    if (!info.accepted || info.accepted.length === 0) {
        throw new Error('O servidor SMTP não aceitou o destinatário.');
    }

    return info;
}

// ==================================================
// ENVIAR CÓDIGO DE RECUPERAÇÃO
// ==================================================

async function enviarCodigoEmail(email, codigo) {

    if (!email || !codigo) {
        throw new Error('E-mail ou código de recuperação inválido.');
    }

    const info = await transportMail.sendMail({
        from: remetente,

        // O código vai para o próprio usuário
        to: email,

        subject: 'Sistema de recuperação de senha - Access Guardian',

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 500px;
                margin: auto;
                padding: 25px;
                background-color: #174493;
                border-radius: 10px;
                text-align: center;
            ">
                <img
                    src="cid:logoAccessGuardian"
                    alt="Access Guardian"
                    style="width: 150px; margin-bottom: 20px;"
                >

                <h2 style="color: #f3f3f3;">
                    Recuperação de senha
                </h2>

                <p style="color: #f3f3f3; font-size: 15px;">
                    Recebemos uma solicitação para redefinir sua senha.
                    Utilize o código abaixo:
                </p>

                <div style="
                    background-color: white;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    color: #222;
                ">
                    ${escaparHtml(codigo)}
                </div>

                <p style="color: #f3f3f3; font-size: 13px;">
                    Se você não solicitou essa alteração, ignore este e-mail.
                </p>

                <hr style="border: none; border-top: 1px solid #ddd;">

                <p style="color: #f3f3f3; font-size: 12px;">
                    Access Guardian — Sistema de controle de acesso escolar
                </p>
            </div>
        `,

        attachments: [
            {
                filename: 'logo_fundo_azul.png',
                path: path.join(
                    __dirname,
                    '..',
                    'images',
                    'logos',
                    'logo_fundo_azul.png'
                ),
                cid: 'logoAccessGuardian'
            }
        ]
    });

    console.log('Código de recuperação aceito pelo SMTP:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
    });

    return info;

    
    
}

// ==================================================
// EXPORTAÇÃO
// ==================================================

module.exports = {
    enviarCodigoEmail,
    enviarReclamacaoEmail
};