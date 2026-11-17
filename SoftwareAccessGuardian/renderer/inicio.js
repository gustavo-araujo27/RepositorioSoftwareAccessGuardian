const formLogin = document.querySelector('.form-login-content-page');

formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('emailUser').value;
    const senha = document.getElementById('senhaUser').value;
    const funcao = document.getElementById('funcao2').value;

    try {
        const result = await window.accessGuardian.loginUser(email, senha);

        console.log('Resultado do SQL:', result);
        console.log('Função selecionada:', funcao);
        console.log('Tipo encontrado:', result?.tipo);

        if (!result || !result.success) {
            alert('Email ou senha incorretos.');
            return;
        }

        if (result.tipo.trim() !== funcao.trim()) {
            alert('A função selecionada não corresponde ao cadastro do usuário.');
            return;
        }

        alert(`Login realizado! Bem-vindo, ${result.user.nome}`);

        if (result.tipo === 'seguranca') {
            window.location.href = '../pages/tela_do_seguranca.html';
        } 
        else if (result.tipo === 'gestor') {
            window.location.href = '../pages/tela_do_gestor.html';
        }

    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao realizar login.');
    }
});