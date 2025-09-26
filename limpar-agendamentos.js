// Script para limpar todos os agendamentos
function limparTodosAgendamentos() {
    localStorage.removeItem('agendamentos');
    localStorage.removeItem('clientes');
    console.log('Todos os agendamentos foram removidos');
    alert('Todos os agendamentos foram limpos!');
    
    // Recarregar a página para atualizar a interface
    window.location.reload();
}

// Executar automaticamente quando o script for carregado
limparTodosAgendamentos();