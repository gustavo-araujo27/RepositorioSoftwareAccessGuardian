
const pool = require('./connection.js');

// ==================================================
// REALIZAR LOGIN
// ==================================================

async function loginUser(email, senha) {

    try {

        const sql = `
            SELECT
                email_seguranca AS email,
                nome_seguranca AS nome,
                'seguranca' AS tipo
            FROM seguranca
            WHERE email_seguranca = ?
            AND senha_seguranca = ?

            UNION ALL

            SELECT
                email_gestor AS email,
                nome_gestor AS nome,
                'gestor' AS tipo
            FROM gestor
            WHERE email_gestor = ?
            AND senha_gestor = ?

            LIMIT 1;
        `;

        // Executa a consulta no banco de dados
        const [rows] = await pool.query(sql, [
            email,
            senha,
            email,
            senha
        ]);

        // Verifica se o usuário foi encontrado
        if (rows.length === 0) {

            return {
                success: false,
                user: null
            };

        }

        // Retorna os dados do usuário
        return {
            success: true,

            user: {
                email: rows[0].email,
                nome: rows[0].nome,
                tipo: rows[0].tipo
            }
        };

    } catch (erro) {

        console.error('Erro no repositório de login:', erro);

        throw erro;

    }

}

// ==================================================
// EXPORTAR FUNÇÃO
// ==================================================

module.exports = {
    loginUser
};
