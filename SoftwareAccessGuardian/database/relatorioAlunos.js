const pool = require("./connection.js");

async function getAlunos() {
    

    const sql = `
        SELECT
            aluno.rm,
            aluno.nome_aluno,
            aluno.email_aluno,
            aluno.id_turma,
            turma_curso.nometurma_curso AS nome_turma,
            registroacesso.horaentrada AS entrada,
            turma_curso.horarioEntrada AS horaCerta
        FROM aluno
        INNER JOIN turma_curso
        ON  aluno.id_turma = turma_curso.idTurma_curso

        LEFT JOIN registroAcesso 
        ON aluno.rm = registroacesso.aluno_rm
    `;

    const [rows] = await pool.query(sql);
    

    console.log("ALUNOS ENCONTRADOS NO BANCO:", rows);


    return rows;
}

async function getTurmas() {

    const sql = `
        SELECT
            idTurma_curso,
            nometurma_curso, 
            horarioentrada AS vai
        FROM turma_curso
    `;

    const [rows] = await pool.query(sql);

    console.log("TURMAS ENCONTRADAS:", rows);

    return rows;
}

async function getAlunosPorTurma(idTurma) {

    const sql = `
        SELECT
            aluno.rm,
            aluno.nome_aluno,
            aluno.email_aluno,
            aluno.id_turma,
            turma_curso.nometurma_curso AS nome_turma,
            registroacesso.horaentrada AS entrada,
            turma_curso.horarioEntrada AS horaCerta

        FROM aluno

        INNER JOIN turma_curso
        ON aluno.id_turma = turma_curso.idTurma_curso

        LEFT JOIN registroAcesso
        ON aluno.rm = registroAcesso.aluno_rm

        WHERE aluno.id_turma = ?
    `;

    const [rows] = await pool.query(sql, [idTurma]);

    return rows;
}


module.exports = {
  getAlunos, getTurmas, getAlunosPorTurma
}