const calendario = document.getElementById("calendario");
const mesAtual = document.getElementById("mes-atual");

let referencia = new Date();

let horarios = [
    {
        id: 1,
        data: criarData(5),
        nome: "Matemática",
        inicio: "07:00",
        fim: "08:00",
        turma: "2º DS",
        tipo: "aula"
    },
    {
        id: 2,
        data: criarData(9),
        nome: "Desenvolvimento de Sistemas",
        inicio: "09:00",
        fim: "10:00",
        turma: "2º DS",
        tipo: "aula"
    },
    {
        id: 3,
        data: criarData(14),
        nome: "Trabalho em grupo",
        inicio: "13:00",
        fim: "14:00",
        turma: "2º DS",
        tipo: "atividade"
    },
    {
        id: 4,
        data: criarData(19),
        nome: "Banco de Dados",
        inicio: "10:00",
        fim: "11:00",
        turma: "2º DS",
        tipo: "aula"
    },
    {
        id: 5,
        data: criarData(23),
        nome: "Revisão",
        inicio: "14:00",
        fim: "15:00",
        turma: "2º DS",
        tipo: "atividade"
    }
];

function criarData(dia) {
    const data = new Date();
    data.setDate(1);
    data.setDate(dia);
    return formatarISO(data);
}

function formatarISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function renderizarCalendario() {
    calendario.innerHTML = "";

    const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    nomesDias.forEach(nome => {
        const elemento = document.createElement("div");
        elemento.className = "dia-semana";
        elemento.textContent = nome;
        calendario.appendChild(elemento);
    });

    const ano = referencia.getFullYear();
    const mes = referencia.getMonth();

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    const totalCelulas = Math.ceil((primeiroDia + ultimoDia) / 7) * 7;

    for (let i = 0; i < totalCelulas; i++) {
        const diaNumero = i - primeiroDia + 1;

        const celula = document.createElement("div");
        celula.className = "dia";

        if (diaNumero < 1 || diaNumero > ultimoDia) {
            celula.classList.add("fora-mes");
            calendario.appendChild(celula);
            continue;
        }

        const numero = document.createElement("span");
        numero.className = "numero-dia";
        numero.textContent = diaNumero;
        celula.appendChild(numero);

        const dataCelula = formatarISO(new Date(ano, mes, diaNumero));

        const eventosDoDia = horarios.filter(item => item.data === dataCelula);

        eventosDoDia.forEach(evento => {
            const elemento = document.createElement("div");
            elemento.className = `evento ${evento.tipo}`;

            const nome = document.createElement("strong");
            nome.textContent = evento.nome;

            const horario = document.createElement("span");
            horario.textContent = `${evento.inicio} - ${evento.fim}`;

            const turma = document.createElement("span");
            turma.textContent = evento.turma;

            const acoes = document.createElement("div");
            acoes.className = "evento-acoes";

            const alterar = document.createElement("button");
            alterar.textContent = "Alterar";
            alterar.addEventListener("click", () => alterarHorario(evento.id));

            const excluir = document.createElement("button");
            excluir.textContent = "Excluir";
            excluir.addEventListener("click", () => excluirHorario(evento.id));

            acoes.append(alterar, excluir);
            elemento.append(nome, horario, turma, acoes);
            celula.appendChild(elemento);
        });

        calendario.appendChild(celula);
    }

    mesAtual.textContent = referencia.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });
}

function alterarHorario(id) {
    const evento = horarios.find(item => item.id === id);

    if (!evento) return;

    const novoNome = prompt("Nome do horário:", evento.nome);
    if (novoNome === null || novoNome.trim() === "") return;

    const novaData = prompt("Data (AAAA-MM-DD):", evento.data);
    if (novaData === null || !/^\d{4}-\d{2}-\d{2}$/.test(novaData)) return;

    const novoInicio = prompt("Horário de início:", evento.inicio);
    if (novoInicio === null || !/^\d{2}:\d{2}$/.test(novoInicio)) return;

    const novoFim = prompt("Horário de término:", evento.fim);
    if (novoFim === null || !/^\d{2}:\d{2}$/.test(novoFim)) return;

    const novaTurma = prompt("Turma:", evento.turma);
    if (novaTurma === null || novaTurma.trim() === "") return;

    evento.nome = novoNome.trim();
    evento.data = novaData;
    evento.inicio = novoInicio;
    evento.fim = novoFim;
    evento.turma = novaTurma.trim();

    renderizarCalendario();
}

function excluirHorario(id) {
    if (!confirm("Deseja excluir este horário?")) return;

    horarios = horarios.filter(item => item.id !== id);

    renderizarCalendario();
}

document.getElementById("mes-anterior").addEventListener("click", () => {
    referencia.setMonth(referencia.getMonth() - 1);
    renderizarCalendario();
});

document.getElementById("proximo-mes").addEventListener("click", () => {
    referencia.setMonth(referencia.getMonth() + 1);
    renderizarCalendario();
});

renderizarCalendario();