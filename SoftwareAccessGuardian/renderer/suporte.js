
document.addEventListener('DOMContentLoaded', async () => {

    // Elementos do formulário
    const formReclamacao = document.getElementById('formReclamacao');
    const campoReclamacao = document.getElementById('campoReclamacao');
    const avisoLogin = document.getElementById('avisoLoginSuporte');
    const statusReclamacao = document.getElementById('statusReclamacao');
    const btnEnviar = document.getElementById('btnEnviarReclamacao');
    const btnSuporte = document.getElementById('btnSuporte');


    // Verifica se os elementos existem
    if (
        !formReclamacao ||
        !campoReclamacao ||
        !avisoLogin ||
        !statusReclamacao ||
        !btnEnviar
    ) {
        console.error('Elementos do formulário de suporte não encontrados.');
        return;
    }

    let sessaoAtual = null;

    // Verifica a sessão do usuário
    async function verificarSessao() {

        try {

            sessaoAtual = await window.accessGuardian.obterSessaoAtual();

            if (sessaoAtual && sessaoAtual.autenticado === true) {
                formReclamacao.hidden = false;
                avisoLogin.hidden = true;
            } else {
                formReclamacao.hidden = true;
                avisoLogin.hidden = false;
            }

        } catch (erro) {

            console.error('Erro ao verificar sessão:', erro);

            sessaoAtual = null;
            formReclamacao.hidden = true;
            avisoLogin.hidden = false;
        }
    }

    // Verifica a sessão ao carregar a tela
    await verificarSessao();

    // Envia a reclamação
    formReclamacao.addEventListener('submit', async (event) => {

        event.preventDefault();

        const reclamacao = campoReclamacao.value.trim();

        // Atualiza a sessão antes de enviar
        await verificarSessao();

        if (!sessaoAtual || sessaoAtual.autenticado !== true) {
            statusReclamacao.textContent =
                'Sua sessão expirou. Faça login novamente para enviar uma reclamação.';
            return;
        }

        if (reclamacao.length < 5) {
            statusReclamacao.textContent =
                'Digite uma reclamação com pelo menos 5 caracteres.';
            return;
        }

        if (reclamacao.length > 5000) {
            statusReclamacao.textContent =
                'A reclamação deve ter no máximo 5000 caracteres.';
            return;
        }

        try {

            btnEnviar.disabled = true;
            btnEnviar.textContent = 'Enviando...';

            statusReclamacao.textContent = '';

            const resultado = await window.accessGuardian.enviarReclamacao(reclamacao);

            if (!resultado || resultado.sucesso !== true) {
                throw new Error(
                    resultado?.mensagem || 'Não foi possível enviar a reclamação.'
                );
            }

            statusReclamacao.textContent =
                'Reclamação enviada com sucesso!';

            campoReclamacao.value = '';

        } catch (erro) {

            console.error('Erro ao enviar reclamação:', erro);

            statusReclamacao.textContent =
                erro.message || 'Erro ao enviar reclamação.';

        } finally {

            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar';

        }

    });
    if (btnSuporte) {
    btnSuporte.addEventListener('click', () => {
            setTimeout(() => {
                verificarSessao();
            }, 100);
        });
    }
});