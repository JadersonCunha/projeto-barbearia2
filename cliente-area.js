// Sistema da Área do Cliente
document.addEventListener('DOMContentLoaded', function() {
    const clienteModal = document.getElementById('cliente-modal');
    const clienteLinkMenu = document.getElementById('cliente-link-menu');
    
    if (!clienteModal || !clienteLinkMenu) {
        console.error('Elementos do modal do cliente não encontrados');
        return;
    }
    
    const closeBtn = clienteModal.querySelector('.close');
    
    const modalButtons = document.getElementById('modal-buttons');
    const modalCadastrar = document.getElementById('modal-cadastrar');
    const modalEntrar = document.getElementById('modal-entrar');
    const btnCadastrar = document.getElementById('btn-cadastrar');
    const btnEntrar = document.getElementById('btn-entrar');
    const confirmCadastroBtn = document.getElementById('confirm-cadastro');
    const confirmLoginBtn = document.getElementById('confirm-login');
    const cadNomeInput = document.getElementById('cad-nome');
    const cadTelefoneInput = document.getElementById('cad-telefone');
    const loginTelefoneInput = document.getElementById('login-telefone');
    const modalMsg = document.getElementById('modal-msg');
    const agendamentosList = document.getElementById('agendamentos-list');
    const cancelarAgendamentoBtn = document.getElementById('cancelar-agendamento-btn');
    const linkCadastrar = document.getElementById('link-cadastrar');

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};

    // Abrir modal
    clienteLinkMenu.addEventListener('click', function(e) {
        e.preventDefault();
        clienteModal.style.display = 'block';
        
        // Verificar se há usuários cadastrados
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};
        if (Object.keys(usuarios).length > 0) {
            // Se há usuários, mostrar apenas o botão Entrar
            modalButtons.style.display = 'none';
            modalEntrar.style.display = 'flex';
            modalCadastrar.style.display = 'none';
            modalMsg.textContent = '';
        } else {
            // Se não há usuários, mostrar os botões normalmente
            resetClienteModal();
        }
    });

    // Fechar modal
    closeBtn.addEventListener('click', function() {
        clienteModal.style.display = 'none';
        resetClienteModal();
    });

    window.addEventListener('click', function(e) {
        if (e.target === clienteModal) {
            clienteModal.style.display = 'none';
            resetClienteModal();
        }
    });

    // Botões do modal
    btnCadastrar.addEventListener('click', function() {
        modalButtons.style.display = 'none';
        modalCadastrar.style.display = 'flex';
        modalEntrar.style.display = 'none';
        modalMsg.textContent = '';
    });

    btnEntrar.addEventListener('click', function() {
        modalButtons.style.display = 'none';
        modalCadastrar.style.display = 'none';
        modalEntrar.style.display = 'flex';
        modalMsg.textContent = '';
    });

    // Cadastro
    confirmCadastroBtn.addEventListener('click', function() {
        const nome = cadNomeInput.value.trim();
        const telefone = cadTelefoneInput.value.trim();

        if (nome === '' || telefone === '') {
            modalMsg.textContent = 'Por favor, preencha todos os campos.';
            return;
        }
        if (usuarios[telefone]) {
            modalMsg.textContent = 'Este telefone já está cadastrado.';
            return;
        }

        usuarios[telefone] = { nome: nome };
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        modalMsg.textContent = 'Cadastro realizado com sucesso!';

        modalCadastrar.style.display = 'none';
        modalEntrar.style.display = 'flex';
        modalButtons.style.display = 'none';
        loginTelefoneInput.value = telefone;
    });

    // Login
    confirmLoginBtn.addEventListener('click', function() {
        const telefone = loginTelefoneInput.value.trim();
        if (!usuarios[telefone]) {
            modalMsg.textContent = 'Telefone não encontrado.';
            // Mostrar opção de cadastro
            modalEntrar.style.display = 'none';
            modalButtons.style.display = 'flex';
            return;
        }

        modalMsg.textContent = `Bem-vindo(a), ${usuarios[telefone].nome}!`;
        modalEntrar.style.display = 'none';
        displayAgendamentos(telefone);
    });

    // Cancelar agendamentos
    cancelarAgendamentoBtn.addEventListener('click', function() {
        try {
            const checkboxes = document.querySelectorAll('.cancel-checkbox:checked');
            console.log('Checkboxes selecionados:', checkboxes.length);
            
            if (checkboxes.length === 0) {
                alert('Por favor, selecione pelo menos um agendamento para cancelar.');
                return;
            }

            if (!confirm('Tem certeza que deseja cancelar os agendamentos selecionados?')) {
                return;
            }

            // Verificar se localStorage está disponível
            if (typeof(Storage) === "undefined") {
                alert('Seu navegador não suporta localStorage. Não é possível cancelar agendamentos.');
                return;
            }

            let agendamentos;
            try {
                agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
            } catch (e) {
                console.error('Erro ao ler localStorage:', e);
                alert('Erro ao acessar dados. Tente novamente.');
                return;
            }
            
            const telefoneAtual = loginTelefoneInput.value.trim();
            console.log('Telefone atual:', telefoneAtual);
            console.log('Agendamentos antes do cancelamento:', agendamentos);
            
            // Coletar IDs dos agendamentos selecionados
            const idsToCancel = [];
            checkboxes.forEach(checkbox => {
                const li = checkbox.closest('li');
                if (li && li.dataset.id) {
                    const id = parseInt(li.dataset.id);
                    console.log('ID coletado:', id);
                    idsToCancel.push(id);
                }
            });
            
            console.log('IDs para cancelar:', idsToCancel);
            
            // Encontrar agendamentos para cancelar
            const agendamentosCancelados = agendamentos.filter(ag => {
                const match = idsToCancel.includes(ag.id);
                console.log(`Agendamento ${ag.id} será cancelado:`, match);
                return match;
            });
            
            console.log('Agendamentos que serão cancelados:', agendamentosCancelados);
            
            if (agendamentosCancelados.length === 0) {
                alert('Nenhum agendamento encontrado para cancelar. Verifique o console para detalhes.');
                return;
            }
            
            // Remover agendamentos
            const agendamentosRestantes = agendamentos.filter(ag => !idsToCancel.includes(ag.id));
            console.log('Agendamentos restantes:', agendamentosRestantes);
            
            try {
                localStorage.setItem('agendamentos', JSON.stringify(agendamentosRestantes));
                console.log('localStorage atualizado com sucesso');
            } catch (e) {
                console.error('Erro ao salvar no localStorage:', e);
                alert('Erro ao salvar dados. Tente novamente.');
                return;
            }
            
            // Atualizar agenda se disponível
            if (window.AgendamentoModalInstance) {
                try {
                    window.AgendamentoModalInstance.updateAgendaBarbeiros();
                } catch (e) {
                    console.error('Erro ao atualizar agenda:', e);
                }
            }

            // Enviar WhatsApp
            if (agendamentosCancelados.length > 0) {
                try {
                    const ag = agendamentosCancelados[0];
                    const dataFormatada = new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR');
                    
                    const mensagem = `🚫 CANCELAMENTO - Barbearia Alpha\n\n*Cliente:* ${ag.nome}\n*Telefone:* ${ag.telefone}\n*Profissional:* ${ag.profissional}\n*Serviços:* ${ag.servicos}\n*Data:* ${dataFormatada}\n*Horário:* ${ag.horario}\n\nO cliente cancelou este agendamento.`;
                    
                    const linkWhatsapp = `https://wa.me/5551985330121?text=${encodeURIComponent(mensagem)}`;
                    window.open(linkWhatsapp, '_blank');
                } catch (e) {
                    console.error('Erro ao enviar WhatsApp:', e);
                }
            }

            alert('Agendamento(s) cancelado(s) com sucesso!');
            displayAgendamentos(telefoneAtual);
            
        } catch (error) {
            console.error('Erro geral no cancelamento:', error);
            alert('Erro inesperado. Verifique o console e tente novamente.');
        }
    });

    // Link para cadastro
    linkCadastrar.addEventListener('click', function(e) {
        e.preventDefault();
        modalEntrar.style.display = 'none';
        modalCadastrar.style.display = 'flex';
        modalMsg.textContent = '';
    });

    function resetClienteModal() {
        modalButtons.style.display = 'flex';
        modalCadastrar.style.display = 'none';
        modalEntrar.style.display = 'none';
        modalMsg.textContent = '';
        agendamentosList.innerHTML = '';
        cancelarAgendamentoBtn.style.display = 'none';
        cadNomeInput.value = '';
        cadTelefoneInput.value = '';
        loginTelefoneInput.value = '';
    }

    function displayAgendamentos(telefone) {
        agendamentosList.innerHTML = '';
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        const agendamentosCliente = agendamentos.filter(ag => ag.telefone === telefone);

        console.log('Agendamentos do cliente:', agendamentosCliente);

        if (agendamentosCliente.length === 0) {
            agendamentosList.innerHTML = '<p>Você não possui agendamentos.</p>';
            cancelarAgendamentoBtn.style.display = 'none';
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';

        agendamentosCliente.forEach(ag => {
            console.log('Criando item para agendamento ID:', ag.id);
            
            const li = document.createElement('li');
            li.dataset.id = ag.id;
            li.style.background = 'var(--dark-black)';
            li.style.padding = '15px';
            li.style.borderRadius = '8px';
            li.style.marginBottom = '10px';
            li.style.border = '1px solid var(--dark-border)';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            const dataFormatada = new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR');
            
            li.innerHTML = `
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <img src="assets/${ag.profissional === 'Carlos França' ? 'barb1.jfif' : 
                                          ag.profissional === 'André Souza' ? 'barb2.jfif' : 'barb3.jpg'}" 
                             alt="${ag.profissional}" 
                             style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                        <strong style="color: var(--dark-accent);">${ag.profissional}</strong>
                    </div>
                    <div style="margin-left: 50px;">
                        <div><strong>Serviço:</strong> ${ag.servicos}</div>
                        <div><strong>Data:</strong> ${dataFormatada}</div>
                        <div><strong>Horário:</strong> ${ag.horario}</div>
                        <div style="font-size: 0.8em; color: #666;">ID: ${ag.id}</div>
                    </div>
                </div>
                <input type="checkbox" class="cancel-checkbox" style="width: 20px; height: 20px; cursor: pointer;">
            `;
            ul.appendChild(li);
        });

        agendamentosList.appendChild(ul);
        cancelarAgendamentoBtn.style.display = 'block';
    }
});