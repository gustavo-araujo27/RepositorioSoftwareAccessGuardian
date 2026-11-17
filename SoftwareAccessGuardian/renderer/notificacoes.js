const notificacoes = document.querySelectorAll(".notificacao");

notificacoes.forEach(notificacao => {
    const botao = notificacao.querySelector(".notificacao-cabecalho");
    const conteudo = notificacao.querySelector(".notificacao-conteudo");
    const seta = notificacao.querySelector(".seta");

    botao.addEventListener("click", () => {
        const estaAberta = notificacao.classList.contains("aberta");

        notificacao.classList.toggle("aberta", !estaAberta);
        conteudo.hidden = estaAberta;

        botao.setAttribute("aria-expanded", String(!estaAberta));
        seta.textContent = estaAberta ? "+" : "−";
    });
});