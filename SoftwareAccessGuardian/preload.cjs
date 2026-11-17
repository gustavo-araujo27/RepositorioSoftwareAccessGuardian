
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('accessGuardian', {

    // ==========================================
    // COMUNICAÇÃO COM O ARDUINO
    // ==========================================

    onAcesso: (callback) => {
        ipcRenderer.on('acesso-rfid', (event, dados) => {
            callback(dados);
        });
    },

    // ==========================================
    // RECUPERAÇÃO DE SENHA
    // ==========================================

    verificarEmailGestorSeguranca: (dados) =>
        ipcRenderer.invoke('verificarEmailGestorSeguranca', dados),

    solicitarCodigoRecuperacao: (dados) =>
        ipcRenderer.invoke('verificarEmailGestorSeguranca', dados),

    validarCodigoRecuperacao: (dados) =>
        ipcRenderer.invoke('validarCodigoRecuperacao', dados),

    atualizarSenhaRecuperacao: (dados) =>
        ipcRenderer.invoke('atualizarSenhaRecuperacao', dados),

    // ==========================================
    // LOGIN
    // ==========================================

    loginUser: (email, senha) => {
        return ipcRenderer.invoke('loginUser', {
            email,
            senha
        });
    },

    // ==========================================
    // SISTEMA DE RECLAMAÇÕES
    // ==========================================

    obterSessaoAtual: () =>
        ipcRenderer.invoke('obterSessaoAtual'),

    enviarReclamacao: (reclamacao) =>
        ipcRenderer.invoke('enviarReclamacao', reclamacao)

});