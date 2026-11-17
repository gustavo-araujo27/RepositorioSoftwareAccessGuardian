
const formLogin = document.querySelector('.form-login-content-page');

formLogin.addEventListener('submit', async (event) => {

    event.preventDefault();

    const email = document.getElementById('emailUser').value;
    const senha = document.getElementById('senhaUser').value;
    const funcao = document.getElementById('funcao2').value;

    try {

        // Solicita a autenticação ao processo principal
        const result = await window.accessGuardian.loginUser(email, senha);

        console.log('Resultado do SQL:', result);
        console.log('Função selecionada:', funcao);
        console.log('Tipo encontrado:', result?.user?.tipo);

        // Verifica se o login foi realizado
        if (!result || !result.success || !result.user) {

            alert('Email ou senha incorretos.');
            return;

        }

        // Recupera o tipo de usuário
        const tipoUsuario = result.user.tipo;

        // Compara a função selecionada com o cadastro
        if (tipoUsuario.trim() !== funcao.trim()) {

            alert('A função selecionada não corresponde ao cadastro do usuário.');
            return;

        }

        // Login realizado
        alert(`Login realizado! Bem-vindo, ${result.user.nome}`);

        // Redirecionamento conforme o tipo de usuário
        if (tipoUsuario === 'seguranca') {

            window.location.href = '../pages/tela_do_seguranca.html';

        } else if (tipoUsuario === 'gestor') {

            window.location.href = '../pages/gestor.html';

        }

    } catch (error) {

        console.error('Erro no login:', error);

        alert('Erro ao realizar login.');

    }

});
