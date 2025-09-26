// Sistema da Área do Cliente
document.addEventListener('DOMContentLoaded', function() {
    const clienteModal = document.getElementById('cliente-modal');
    const clienteLinkMenu = document.getElementById('cliente-link-menu');
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
        const checkboxes = document.querySelectorAll('.cancel-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('Por favor, selecione pelo menos um agendamento para cancelar.');
            return;
        }

        let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        
        // Debug: mostrar todos os agendamentos
        console.log('Todos os agendamentos:', agendamentos);
        
        const idsToCancel = Array.from(checkboxes).map(cb => {
            const li = cb.closest('li');
            const id = li ? li.dataset.id : null;
            console.log('ID encontrado:', id);
            return id ? parseInt(id) : null;
        }).filter(id => id !== null && !isNaN(id));
        
        console.log('IDs para cancelar:', idsToCancel);
        
        if (idsToCancel.length === 0) {
            alert('Erro ao identificar agendamentos. Tente novamente.');
            return;
        }

        // Buscar agendamentos que serão cancelados
        const agendamentosCancelados = agendamentos.filter(ag => {
            console.log('Comparando:', ag.id, 'com', idsToCancel);
            return idsToCancel.includes(ag.id);
        });
        
        console.log('Agendamentos encontrados para cancelar:', agendamentosCancelados);
        
        if (agendamentosCancelados.length === 0) {
            alert('Agendamentos não encontrados. Verifique o console para debug.');
            return;
        }
        
        // Verificar horários liberados
        const horariosLiberados = new Set();
        agendamentosCancelados.forEach(agCancelado => {
            const outrosAgendamentos = agendamentos.filter(ag => 
                ag.profissional === agCancelado.profissional &&
                ag.data === agCancelado.data &&
                ag.horario === agCancelado.horario &&
                !idsToCancel.includes(ag.id)
            );
            
            if (outrosAgendamentos.length === 0) {
                horariosLiberados.add(`${agCancelado.profissional}-${agCancelado.data}-${agCancelado.horario}`);
            }
        });
        
        // Remover agendamentos
        agendamentos = agendamentos.filter(ag => !idsToCancel.includes(ag.id));
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        
        // Atualizar agenda
        if (horariosLiberados.size > 0 && window.AgendamentoModalInstance) {
            window.AgendamentoModalInstance.updateAgendaBarbeiros();
        }

        // Enviar WhatsApp
        try {
            let mensagemCompleta = '🚫 CANCELAMENTO DE AGENDAMENTO - Barbearia Alpha\n\n';
            
            agendamentosCancelados.forEach((ag, index) => {
                const dataFormatada = new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR');
                
                if (index > 0) mensagemCompleta += '\n---\n\n';
                
                mensagemCompleta += `*Cliente:* ${ag.nome || 'N/A'}\n`;
                mensagemCompleta += `*Telefone:* ${ag.telefone || 'N/A'}\n`;
                mensagemCompleta += `*Profissional:* ${ag.profissional || 'N/A'}\n`;
                mensagemCompleta += `*Serviço:* ${ag.servicos || 'N/A'}\n`;
                mensagemCompleta += `*Data:* ${dataFormatada}\n`;
                mensagemCompleta += `*Horário:* ${ag.horario || 'N/A'}\n`;
            });
            
            mensagemCompleta += '\nO cliente cancelou este(s) agendamento(s).';
            
            const telefoneWhatsapp = "5551985330121";
            const linkWhatsapp = `https://wa.me/${telefoneWhatsapp}?text=${encodeURIComponent(mensagemCompleta)}`;
            
            setTimeout(() => {
                window.open(linkWhatsapp, '_blank');
            }, 100);
        } catch (error) {
            console.error('Erro ao enviar WhatsApp:', error);
        }

        alert('Agendamentos cancelados com sucesso!');

        const telefoneAtual = loginTelefoneInput.value.trim();
        displayAgendamentos(telefoneAtual);
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

        if (agendamentosCliente.length === 0) {
            agendamentosList.innerHTML = '<p>Você não possui agendamentos.</p>';
            cancelarAgendamentoBtn.style.display = 'none';
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';

        agendamentosCliente.forEach(ag => {
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