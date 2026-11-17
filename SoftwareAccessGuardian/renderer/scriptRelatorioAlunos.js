function converterParaMinutos(horario) {

    let alunosDaTurma = [];

    if (horario instanceof Date) {
        return horario.getHours() * 60 +
               horario.getMinutes() +
               horario.getSeconds() / 60;
    }

    if (typeof horario === "string") {
        const [horas, minutos, segundos = 0] =
            horario.split(":").map(Number);

        return horas * 60 + minutos + segundos / 60;
    }

    console.error("Formato de horário não reconhecido:", horario);

    return null;
}

function verificarAtraso(entrada, horaCerta) {

    if (!entrada || !horaCerta) {
        return null;
    }

    const horarioRegistrado = converterParaMinutos(entrada);
    const horarioPrevisto = converterParaMinutos(horaCerta);

    const atraso = horarioRegistrado - horarioPrevisto;

    if(atraso > 0){
        return atraso;
    } else{
        return 0;
    }
}

async function carregarAlunos() {


    const alunos = await window.accessGuardian.getAlunos();

    const lista = document.getElementById("listaAlunos");

    lista.innerHTML = "";

    alunos.forEach(aluno => {

        const horario = new Date(aluno.entrada).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",

        });

        const elementoAluno = document.createElement("div");

        const atraso = verificarAtraso(
            aluno.entrada,
            aluno.horaCerta
        )
        elementoAluno.classList.add("aluno");


        elementoAluno.innerHTML = `
            <div class="texto_certo">
                <p><b>Nome:</b> ${aluno.nome_aluno}</p>
                <p><b>RM:</b> ${aluno.rm}</p>
                <p><b>Turma:</b> ${aluno.nome_turma}</p>
                <p><b>Hora da entrada:</b> ${aluno.entrada ? horario : "Não registrado"}</p>
                <p><b>Atraso:</b> ${
                    atraso === null ? "Não registrado" :
                    atraso === 0 ? "Não" :
                    `${Math.round(atraso)} minutos`
                }</p>
                
            </div>

            <button id="alunoExibir">Exibir</button>
        `;

        lista.appendChild(elementoAluno);

        const botaoExibir = elementoAluno.querySelector("#alunoExibir");

        botaoExibir.addEventListener("click", () => {

            document.getElementById("infromacoesModal").classList.add("ativo");

            document.getElementById("nomeAluno").textContent = aluno.nome_aluno;

            document.getElementById("rmAluno").textContent = aluno.rm;

            document.getElementById("turmaAluno").textContent = aluno.nome_turma;

            document.getElementById("entradaAluno").textContent = horario;

            document.getElementById("atrasoAluno").textContent =
                atraso === null ? "Não registrado" :
                atraso === 0 ? "Não" :
                `${Math.round(atraso)} minutos`;

        });

    });

    const modal = document.getElementById("infromacoesModal");
    const btnFechar = document.getElementById("btnFecharModal");

    btnFechar.addEventListener("click", () => {
        modal.classList.remove("ativo");
    });

    document.getElementById("totalAlunos").textContent =
        `Alunos totais: ${alunos.length}`;

}

let turmaSelecionada = null;


// CARREGAR TURMAS DO BANCO
async function carregarTurmas() {

    const turmas = await window.accessGuardian.getTurmas();

    const boxTurmas = document.getElementById("boxTurmas");


console.log("ELEMENTO DAS TURMAS:", boxTurmas);


    boxTurmas.innerHTML = "";

    turmas.forEach(turma => {

        const elementoTurma = document.createElement("div");

        elementoTurma.classList.add("turma");

        const imagem = document.createElement("div");
        imagem.classList.add("img");

        const img = document.createElement("img");
        img.src = "../images/imageCapelaPreta.png";

        const nome = document.createElement("h2");
        nome.textContent = turma.nometurma_curso;

        imagem.appendChild(img);
        imagem.appendChild(nome);

        elementoTurma.appendChild(imagem);

        // GUARDAR O ID REAL DA TURMA
        elementoTurma.dataset.idTurma = turma.idTurma_curso;

        elementoTurma.addEventListener("click", () => {

            turmaSelecionada = turma;

            abrirModalTurma();

        });

        boxTurmas.appendChild(elementoTurma);

    });

}


// ABRIR MODAL
function abrirModalTurma() {

    const modal = document.getElementById("modalTurma");

    document.getElementById("tituloTurma").textContent =
        turmaSelecionada.nometurma_curso;

    // Limpar informações da turma anterior
    document.getElementById("listaAlunosTurma").innerHTML = "";

    document.getElementById("informacoesHorario").innerHTML = "";

    modal.classList.add("ativo");

}


// FECHAR MODAL
document.getElementById("fecharModalTurma").addEventListener("click", () => {

    document.getElementById("modalTurma").classList.remove("ativo");

});


// EXIBIR ALUNOS DA TURMA SELECIONADA
document.getElementById("btnMostrarAlunos").addEventListener("click", async () => {

    document.getElementById("btnMostrarAlunos").addEventListener("click", async () => {

    if (!turmaSelecionada) return;

    const id = turmaSelecionada.idTurma_curso;

    alunosDaTurma = await window.accessGuardian.getAlunosPorTurma(id);

    const lista = document.getElementById("listaAlunosModal");

    lista.innerHTML = "";

    if (alunosDaTurma.length === 0) {
        lista.textContent = "Nenhum aluno cadastrado nesta turma.";
    }

    alunosDaTurma.forEach(aluno => {


        const elemento = document.createElement("div");
        elemento.classList.add("alunoModal");

        const nome = document.createElement("p");
        nome.textContent = `${aluno.nome_aluno} -  
        RM: ${aluno.rm}`;

        const botao = document.createElement("button");
        botao.textContent = "Exibir";
        botao.classList.add("botaoAluno")

        botao.addEventListener("click", () => {
            exibirInformacoesAluno(aluno);
        });

        elemento.appendChild(nome);
        elemento.appendChild(botao);

        lista.appendChild(elemento);
    });

    document.getElementById("modalAlunosTurma").classList.add("ativo");
});

document.getElementById("fecharModalAlunos").addEventListener("click", () => {
    document.getElementById("modalAlunosTurma").classList.remove("ativo");
});

});


// EXIBIR HORÁRIO DA TURMA SELECIONADA
document.getElementById("btnMostrarHorario").addEventListener("click", () => {

    if (!turmaSelecionada) return;

    const horario = document.getElementById("informacoesHorario");

    console.log("TURMA SELECIONADA:", turmaSelecionada);
    console.log("HORÁRIO:", turmaSelecionada.vai);

    horario.innerHTML = "";

    const texto = document.createElement("p");

    texto.textContent = `Horário de entrada: ${turmaSelecionada.vai}`;

    horario.appendChild(texto);

    

});

function exibirInformacoesAluno(aluno) {

    const horario = new Date(aluno.entrada).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",

        });

    const atraso = verificarAtraso(
            aluno.entrada,
            aluno.horaCerta
        )

    document.getElementById("nomeAluno").textContent = aluno.nome_aluno;
    document.getElementById("rmAluno").textContent = aluno.rm;
    document.getElementById("turmaAluno").textContent = aluno.nome_turma;
    document.getElementById("entradaAluno").textContent = aluno.entrada ? horario : "Não registrado";
    document.getElementById("atrasoAluno").textContent =
       atraso === null ? "Não registrado" :
                atraso === 0 ? "Não" :
                `${Math.round(atraso)} minutos`;

    document.getElementById("infromacoesModal").classList.add("ativo");
}


// INICIALIZAR
carregarTurmas();
carregarAlunos();
