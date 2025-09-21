document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('agendamento-form');
    const nomeInput = document.getElementById('nome');
    const telefoneInput = document.getElementById('telefone');
    const horarioInput = document.getElementById('horario');
    const dataInput = document.getElementById('data');
    const profissionalInput = document.getElementById('profissional');
    const servicoInput = document.getElementById('servico');
    const barbeirosContainer = document.querySelector('.barbeiros');
    const servicosCheckboxes = document.querySelectorAll('.servico-checkbox');
    const agendamentoMessage = document.getElementById('agendamento-message');

    let servicosSelecionados = [];
    let barbeiroSelecionado = '';
    let telefoneClienteLogado = '';

    barbeirosContainer.addEventListener('click', (event) => {
        const target = event.target.closest('.barb-img');
        if (target) {
            document.querySelectorAll('.barb-img').forEach(barb => barb.classList.remove('selected'));
            target.classList.add('selected');
            barbeiroSelecionado = target.dataset.name;
            profissionalInput.value = barbeiroSelecionado;
        }
    });

    servicosCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            servicosSelecionados = [];
            servicosCheckboxes.forEach(cb => {
                if (cb.checked) {
                    const row = cb.closest('tr');
                    servicosSelecionados.push(row.dataset.servico);
                }
            });
            servicoInput.value = servicosSelecionados.join(', ');
        });
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (nomeInput.value.trim() === '' || telefoneInput.value.trim() === '' || horarioInput.value.trim() === '' || dataInput.value.trim() === '') {
            agendamentoMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            agendamentoMessage.style.color = '#dc3545';
            return;
        }

        if (barbeiroSelecionado === '') {
            agendamentoMessage.textContent = 'Por favor, selecione um profissional.';
            agendamentoMessage.style.color = '#dc3545';
            return;
        }

        if (servicosSelecionados.length === 0) {
            agendamentoMessage.textContent = 'Por favor, selecione pelo menos um serviço.';
            agendamentoMessage.style.color = '#dc3545';
            return;
        }

        const nome = nomeInput.value;
        const telefone = telefoneInput.value;
        const data = dataInput.value;
        const horario = horarioInput.value;
        const profissional = profissionalInput.value;
        const servicos = servicoInput.value;

        // Busca agendamentos existentes
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');

        // Verifica se já existe agendamento para o mesmo barbeiro, dia e horário
        const conflito = agendamentos.find(a =>
            a.profissional === profissional &&
            a.data === data &&
            a.horario === horario
        );
        if (conflito) {
            agendamentoMessage.textContent = 'Já existe um agendamento para este barbeiro neste dia e horário!';
            agendamentoMessage.style.color = '#dc3545';
            return;
        }

        // Conta agendamentos do barbeiro no mesmo dia
        const agendamentosBarbeiroDia = agendamentos.filter(a =>
            a.profissional === profissional &&
            a.data === data
        );
        if (agendamentosBarbeiroDia.length >= 5) {
            agendamentoMessage.textContent = 'Este barbeiro já atingiu o limite de 5 agendamentos para este dia!';
            agendamentoMessage.style.color = '#dc3545';
            return;
        }

        // Verifica se é sábado e horário é após 18h
        const agendamentoDate = new Date(data + 'T' + horario);
        if (agendamentoDate.getDay() === 6 && parseInt(horario.split(':')[0]) >= 18) {
            agendamentoMessage.textContent = 'Em sábados, só é permitido agendar até as 18h!';
            agendamentoMessage.style.color = '#dc3545';
            return;
        }

        // Salvar agendamento localmente ANTES do reset
        agendamentos.push({
            telefone: telefone,
            nome: nome,
            data: data,
            horario: horario,
            profissional: profissional,
            servicos: servicos
        });
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

        // Redireciona para WhatsApp
        const mensagem = `Olá, gostaria de agendar um horário.%0A%0A*Detalhes do Agendamento:*%0A*Nome:* ${nome}%0A*Telefone:* ${telefone}%0A*Data:* ${data}%0A*Horário:* ${horario}%0A*Profissional:* ${profissional}%0A*Serviço(s):* ${servicos}`;
        const whatsappURL = `https://api.whatsapp.com/send?phone=5551985330121&text=${mensagem}`;
        window.open(whatsappURL, '_blank');

        agendamentoMessage.textContent = 'Redirecionando para o WhatsApp...';
        agendamentoMessage.style.color = '#28a745';

        form.reset();
        servicosSelecionados = [];
        barbeiroSelecionado = '';
        servicoInput.value = '';
        profissionalInput.value = '';
        document.querySelectorAll('.barb-img').forEach(barb => barb.classList.remove('selected'));
        document.querySelectorAll('.day.selected').forEach(day => day.classList.remove('selected'));
        dataInput.value = '';
    });

    form.addEventListener('reset', () => {
        setTimeout(() => {
            servicosSelecionados = [];
            barbeiroSelecionado = '';
            servicoInput.value = '';
            profissionalInput.value = '';
            agendamentoMessage.textContent = '';
            document.querySelectorAll('.barb-img').forEach(barb => barb.classList.remove('selected'));
            document.querySelectorAll('.day.selected').forEach(day => day.classList.remove('selected'));
            dataInput.value = '';
        }, 0);
    });

    const calendarDays = document.getElementById('calendar-days');
    const currentMonthEl = document.getElementById('current-month');
    let currentDate = new Date();

    function renderCalendar() {
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        currentMonthEl.textContent = `${monthNames[month]} ${year}`;
        calendarDays.innerHTML = '';
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isSaturday = dayDate.getDay() === 6;
            let isSaturdayAfter18 = false;
            if (isSaturday && dayDate >= today) {
                // Verifica se hoje é sábado e já passou das 18h
                if (
                    dayDate.getFullYear() === today.getFullYear() &&
                    dayDate.getMonth() === today.getMonth() &&
                    dayDate.getDate() === today.getDate() &&
                    today.getHours() >= 18
                ) {
                    isSaturdayAfter18 = true;
                }
            }
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = i;
            if (isPast || isSaturdayAfter18) {
                dayDiv.classList.add('empty');
                dayDiv.style.background = '#333';
                dayDiv.style.color = '#888';
                dayDiv.style.cursor = 'not-allowed';
            } else {
                dayDiv.addEventListener('click', () => selectDay(i));
            }
            calendarDays.appendChild(dayDiv);
        }
    }

    document.getElementById('prev-month').onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    };
    document.getElementById('next-month').onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    };

    renderCalendar();

    function selectDay(day) {
        // Remove seleção anterior
        document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
        // Seleciona o novo dia
        const days = document.querySelectorAll('.calendar-days .day');
        days[day - 1].classList.add('selected');
        // Atualiza o campo data do formulário
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        // Formato: YYYY-MM-DD
        dataInput.value = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    // Botão voltar ao topo
    const backToTopBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Modal área do cliente
    const clienteLink = document.getElementById('cliente-link');
    const clienteModal = document.getElementById('cliente-modal');
    const closeModal = clienteModal.querySelector('.close');
    const btnCadastrar = document.getElementById('btn-cadastrar');
    const btnEntrar = document.getElementById('btn-entrar');
    const modalCadastrar = document.getElementById('modal-cadastrar');
    const modalEntrar = document.getElementById('modal-entrar');
    const modalMsg = document.getElementById('modal-msg');

    clienteLink.onclick = () => clienteModal.style.display = 'block';
    closeModal.onclick = () => {
        clienteModal.style.display = 'none';
        modalCadastrar.style.display = 'none';
        modalEntrar.style.display = 'none';
        modalMsg.textContent = '';
    };
    window.onclick = e => { if (e.target == clienteModal) closeModal.onclick(); };

    btnCadastrar.onclick = () => {
        modalCadastrar.style.display = 'block';
        modalEntrar.style.display = 'none';
        modalMsg.textContent = '';
    };
    btnEntrar.onclick = () => {
        modalEntrar.style.display = 'block';
        modalCadastrar.style.display = 'none';
        modalMsg.textContent = '';
    };

    let clientes = JSON.parse(localStorage.getItem('clientes') || '[]');

    document.getElementById('confirm-cadastro').onclick = () => {
        const nome = document.getElementById('cad-nome').value.trim();
        const telefone = document.getElementById('cad-telefone').value.trim();
        if (!nome || !telefone) {
            modalMsg.textContent = 'Preencha todos os campos!';
            return;
        }
        if (clientes.find(c => c.telefone === telefone)) {
            modalMsg.textContent = 'Telefone já cadastrado!';
            return;
        }
        clientes.push({ nome, telefone });
        localStorage.setItem('clientes', JSON.stringify(clientes));
        modalMsg.textContent = 'Cadastro realizado!';
        document.getElementById('cad-nome').value = '';
        document.getElementById('cad-telefone').value = '';
    };

    document.getElementById('confirm-login').onclick = () => {
        const telefone = document.getElementById('login-telefone').value.trim();
        if (clientes.find(c => c.telefone === telefone)) {
            modalMsg.textContent = 'Login realizado!';
            telefoneClienteLogado = telefone; // Salva telefone logado
            mostrarAgendamentosCliente(telefone);
        } else {
            modalMsg.textContent = 'Telefone não cadastrado!';
        }
        document.getElementById('login-telefone').value = '';
    };

    function mostrarAgendamentosCliente(telefone) {
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
        const meusAgendamentos = agendamentos.filter(a => a.telefone === telefone);
        const listaDiv = document.getElementById('agendamentos-list');
        const cancelarBtn = document.getElementById('cancelar-agendamento-btn');
        listaDiv.innerHTML = '';

        if (meusAgendamentos.length === 0) {
            listaDiv.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
            cancelarBtn.style.display = 'none';
            return;
        }

        let html = '<h4>Seus agendamentos:</h4><form id="form-cancelar-agendamento"><ul style="padding-left:18px;">';
        meusAgendamentos.forEach((a, idx) => {
            // Cada serviço vira um checkbox
            const servicos = a.servicos.split(',').map(s => s.trim());
            servicos.forEach((servico, sidx) => {
                html += `<li>
                    <label>
                        <input type="checkbox" name="cancelar" value="${a.data}|${a.horario}|${a.profissional}|${servico}">
                        <strong>${a.data} às ${a.horario}</strong> com <strong>${a.profissional}</strong> — <span>${servico}</span>
                    </label>
                </li>`;
            });
        });
        html += '</ul></form>';
        listaDiv.innerHTML = html;
        cancelarBtn.style.display = 'block';
    }

    // Evento do botão cancelar
    document.getElementById('cancelar-agendamento-btn').onclick = function() {
        const telefone = telefoneClienteLogado;
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
        const checks = document.querySelectorAll('#form-cancelar-agendamento input[type="checkbox"]:checked');
        if (checks.length === 0) {
            alert('Selecione ao menos um serviço para cancelar.');
            return;
        }
        let alterado = false;
        checks.forEach(check => {
            const [data, horario, profissional, servico] = check.value.split('|');
            for (let i = agendamentos.length - 1; i >= 0; i--) {
                if (
                    agendamentos[i].telefone === telefone &&
                    agendamentos[i].data === data &&
                    agendamentos[i].horario === horario &&
                    agendamentos[i].profissional === profissional
                ) {
                    let servicosArr = agendamentos[i].servicos.split(',').map(s => s.trim());
                    servicosArr = servicosArr.filter(s => s !== servico);
                    if (servicosArr.length === 0) {
                        agendamentos.splice(i, 1);
                    } else {
                        agendamentos[i].servicos = servicosArr.join(', ');
                    }
                    alterado = true;

                    // Envia mensagem para o barbeiro via WhatsApp
                    const mensagemCancelamento = `Olá ${profissional}, o cliente ${agendamentos[i].nome} cancelou o serviço: ${servico} no dia ${data} às ${horario}.`;
                    const whatsappBarbeiro = `https://api.whatsapp.com/send?phone=5551985330121&text=${encodeURIComponent(mensagemCancelamento)}`;
                    window.open(whatsappBarbeiro, '_blank');
                }
            }
        });
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        if (alterado) {
            alert('Serviço(s) cancelado(s) com sucesso!');
            mostrarAgendamentosCliente(telefone);
        }
    };

    document.getElementById('cliente-link-menu').onclick = function(e) {
        e.preventDefault();
        document.getElementById('cliente-link').click();
    };

    const sideMenu = document.querySelector('.side-menu');
    const sideMenuHandle = document.getElementById('side-menu-handle');

    sideMenuHandle.addEventListener('click', (e) => {
        e.stopPropagation();
        sideMenu.classList.add('open');
        sideMenuHandle.style.display = 'none';
    });

    // Fecha o menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (sideMenu.classList.contains('open') && !sideMenu.contains(e.target)) {
            sideMenu.classList.remove('open');
            sideMenuHandle.style.display = 'flex';
        }
    });

    document.getElementById('horario-link').onclick = function(e) {
        e.preventDefault();
        document.getElementById('horario-modal').style.display = 'block';
    };
    document.querySelector('.close-horario').onclick = function() {
        document.getElementById('horario-modal').style.display = 'none';
    };
    window.onclick = function(event) {
        const modal = document.getElementById('horario-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});