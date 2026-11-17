
// Chamamos o arquivo de conexão com o banco de dados
const pool = require("./connection.js");

async function loginUser(email, senha) {

  const sql = `
        SELECT
            email_seguranca AS email,
            nome_seguranca AS nome,
            'seguranca' AS tipo
        FROM seguranca
        WHERE email_seguranca = ? AND senha_seguranca = ?

        UNION ALL

        SELECT
            email_gestor AS email,
            nome_gestor AS nome,
            'gestor' AS tipo
        FROM gestor
        WHERE email_gestor = ? AND senha_gestor = ?

        LIMIT 1;
    `;

  // Passamos os quatro parâmetros na ordem correta
  const [rows] = await pool.query(sql, [
    email,
    senha,
    email,
    senha
  ]);

  // Verificamos se algum usuário foi encontrado
  if (rows.length === 0) {
    return {
      success: false
    };
  }

  // Retornamos os dados do usuário encontrado
  return {
    success: true,
    user: rows[0],
    tipo: rows[0].tipo
  }
}

module.exports = {
  loginUser
};
