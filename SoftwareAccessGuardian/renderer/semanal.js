const grade = document.getElementById("grade-semanal");
const periodoAtual = document.getElementById("periodo-atual");

const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

const horas = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00"
];

let semanaReferencia = new Date();

let horarios = [
    {
        id: 1,
        dia: 0,
        hora: "07:00",
        nome: "Matemática",
        inicio: "07:00",
        fim: "08:00",
        turma: "2º DS",
        tipo: "aula"
    },
    {
        id: 2,
        dia: 1,
        hora: "09:00",
        nome: "Desenvolvimento de Sistemas",
        inicio: "09:00",
        fim: "10:00",
        turma: "2º DS",
        tipo: "aula"
    },
    {
        id: 3,
        dia: 2,
        hora: "13:00",
        nome: "Trabalho em grupo",
        inicio: "13:00",
        fim: "14:00",
        turma: "2º DS",
        tipo: "atividade"
    },
    {
        id: 4,
        dia: 3,
        hora: "10:00",
        nome: "Banco de Dados",
        inicio: "10:00",
        fim: "11:00",
        turma: "2º DS",
        tipo: "aula"
    },
    {
        id: 5,
        dia: 4,
        hora: "14:00",
        nome: "Revisão",
        inicio: "14:00",
        fim: "15:00",
        turma: "2º DS",
        tipo: "atividade"
    }
];

function obterInicioSemana(data) {
    const inicio = new Date(data);
    const dia = inicio.getDay();

    inicio.setDate(inicio.getDate() - (dia === 0 ? 6 : dia - 1));
    inicio.setHours(0, 0, 0, 0);

    return inicio;
}

function formatarData(data) {
    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit"
    });
}

function atualizarPeriodo() {
    const inicio = obterInicioSemana(semanaReferencia);
    const fim = new Date(inicio);

    fim.setDate(fim.getDate() + 4);

    periodoAtual.textContent =
        `${formatarData(inicio)} até ${formatarData(fim)}`;
}

function renderizarGrade() {
    grade.innerHTML = "";

    const celulaHora = document.createElement("div");
    celulaHora.className = "celula cabecalho-hora";
    celulaHora.textContent = "Horário";
    grade.appendChild(celulaHora);

    dias.forEach(dia => {
        const celula = document.createElement("div");
        celula.className = "celula cabecalho-dia";
        celula.textContent = dia;
        grade.appendChild(celula);
    });

    horas.forEach(hora => {
        const label = document.createElement("div");
        label.className = "celula horario-label";
        label.textContent = hora;
        grade.appendChild(label);

        dias.forEach((dia, indice) => {
            const celula = document.createElement("div");
            celula.className = "celula celula-vazia";

            const eventos = horarios.filter(item =>
                item.dia === indice && item.hora === hora
            );

            eventos.forEach(evento => {
                const elemento = document.createElement("div");
                elemento.className = `evento ${evento.tipo}`;

                const nome = document.createElement("strong");
                nome.textContent = evento.nome;

                const horario = document.createElement("small");
                horario.textContent =
                    `${evento.inicio} - ${evento.fim} | ${evento.turma}`;

                const acoes = document.createElement("div");
                acoes.className = "evento-acoes";

                const alterar = document.createElement("button");
                alterar.textContent = "Alterar";
                alterar.addEventListener("click", () => alterarHorario(evento.id));

                const excluir = document.createElement("button");
                excluir.textContent = "Excluir";
                excluir.addEventListener("click", () => excluirHorario(evento.id));

                acoes.append(alterar, excluir);
                elemento.append(nome, horario, acoes);
                celula.appendChild(elemento);
            });

            grade.appendChild(celula);
        });
    });

    atualizarPeriodo();
}

function alterarHorario(id) {
    const evento = horarios.find(item => item.id === id);

    if (!evento) return;

    const novoNome = prompt("Nome do horário:", evento.nome);

    if (novoNome === null || novoNome.trim() === "") return;

    const novoInicio = prompt("Horário de início:", evento.inicio);

    if (novoInicio === null || !/^\d{2}:\d{2}$/.test(novoInicio)) return;

    const novoFim = prompt("Horário de término:", evento.fim);

    if (novoFim === null || !/^\d{2}:\d{2}$/.test(novoFim)) return;

    const novaTurma = prompt("Turma:", evento.turma);

    if (novaTurma === null || novaTurma.trim() === "") return;

    const novoDia = prompt(
        "Dia da semana (1 a 5):",
        String(evento.dia + 1)
    );

    if (novoDia === null || !/^[1-5]$/.test(novoDia)) return;

    evento.nome = novoNome.trim();
    evento.inicio = novoInicio;
    evento.fim = novoFim;
    evento.hora = novoInicio;
    evento.turma = novaTurma.trim();
    evento.dia = Number(novoDia) - 1;

    renderizarGrade();
}

function excluirHorario(id) {
    const confirmar = confirm("Deseja excluir este horário?");

    if (!confirmar) return;

    horarios = horarios.filter(item => item.id !== id);

    renderizarGrade();
}

document.getElementById("semana-anterior").addEventListener("click", () => {
    semanaReferencia.setDate(semanaReferencia.getDate() - 7);
    atualizarPeriodo();
});

document.getElementById("proxima-semana").addEventListener("click", () => {
    semanaReferencia.setDate(semanaReferencia.getDate() + 7);
    atualizarPeriodo();
});

renderizarGrade();