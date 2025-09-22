document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('agendamento-form');
    const nomeInput = document.getElementById('nome');
    const telefoneInput = document.getElementById('telefone');
    const servicoSelect = document.getElementById('servico');
    const barbeiros = document.querySelectorAll('.barb-img');
    const agendamentoMessage = document.getElementById('agendamento-message');
    const agendarBtn = document.querySelector('.submit-btn');
    const limparBtn = document.querySelector('.submit-btn-clear');
    const scheduleContainer = document.getElementById('barber-schedule-container');

    let barbeiroSelecionado = null;
    let dataSelecionada = null;
    let horarioSelecionado = null;

    // Horários de trabalho comuns para todos
    const horariosTrabalho = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
        '19:00', '19:30', '20:00', '20:30'
    ];

    // Dados de exemplo para agendamentos por barbeiro
    let agendamentosPorBarbeiro = JSON.parse(localStorage.getItem('agendamentosPorBarbeiro')) || {
        'barb1': {
            '2025-09-22': ['10:00', '15:30'],
            '2025-09-23': ['09:30', '14:00', '18:30']
        },
        'barb2': {
            '2025-09-22': ['11:00', '16:00'],
            '2025-09-24': ['13:30']
        },
        'barb3': {
            '2025-09-22': ['09:00', '13:00', '17:00'],
            '2025-09-25': ['10:30', '15:00']
        }
    };

    let currentCalendarDate = new Date();

    function renderCalendar() {
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const feriados = ['2025-01-01', '2025-04-21', '2025-05-01'];

        const month = currentCalendarDate.getMonth();
        const year = currentCalendarDate.getFullYear();

        document.getElementById('current-month-year').textContent = `${monthNames[month]} ${year}`;
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('day', 'empty');
            calendarDays.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = i;
            const dayDate = new Date(year, month, i);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isSunday = dayDate.getDay() === 0;
            const isFeriado = feriados.includes(dateStr);

            if (isPast || isSunday || isFeriado) {
                dayDiv.classList.add('empty');
            } else {
                dayDiv.addEventListener('click', () => {
                    selectDay(dayDiv, dateStr);
                });
                if (dataSelecionada === dateStr) {
                    dayDiv.classList.add('selected');
                }
            }
            calendarDays.appendChild(dayDiv);
        }
    }

    function selectDay(element, dateStr) {
        document.querySelectorAll('#calendar-days .day').forEach(d => d.classList.remove('selected'));
        element.classList.add('selected');
        dataSelecionada = dateStr;
        document.getElementById('data-agendamento').value = dateStr;

        const agendamentosDoDia = agendamentosPorBarbeiro[barbeiroSelecionado.dataset.id][dateStr] || [];
        const horariosLivres = horariosTrabalho.filter(h => !agendamentosDoDia.includes(h));
        renderHorarios(horariosLivres);
        checkFormValidity();
    }

    function renderHorarios(horarios) {
        const horariosGrid = document.getElementById('horarios-grid');
        horariosGrid.innerHTML = '';
        horarioSelecionado = null;
        document.getElementById('horario-agendamento').value = '';

        if (horarios.length === 0) {
            horariosGrid.innerHTML = '<p class="no-times-available">Nenhum horário disponível neste dia.</p>';
            return;
        }

        horarios.forEach(horario => {
            const horarioItem = document.createElement('div');
            horarioItem.classList.add('horario-item');
            horarioItem.textContent = horario;
            horarioItem.addEventListener('click', () => {
                selectHorario(horarioItem, horario);
            });
            horariosGrid.appendChild(horarioItem);
        });
        checkFormValidity();
    }

    function selectHorario(element, horario) {
        document.querySelectorAll('#horarios-grid .horario-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        horarioSelecionado = horario;
        document.getElementById('horario-agendamento').value = horario;
        checkFormValidity();
    }

    function resetForm() {
        form.reset();
        agendarBtn.disabled = true;
        barbeiros.forEach(b => b.classList.remove('selected'));
        scheduleContainer.style.display = 'none';
        barbeiroSelecionado = null;
        dataSelecionada = null;
        horarioSelecionado = null;
        agendamentoMessage.textContent = '';
    }

    barbeiros.forEach(barbeiro => {
        barbeiro.addEventListener('click', () => {
            const barberId = barbeiro.dataset.id;
            barbeiros.forEach(b => b.classList.remove('selected'));
            barbeiro.classList.add('selected');

            barbeiroSelecionado = barbeiro;
            document.getElementById('profissional-agendamento').value = barbeiro.dataset.name;

            dataSelecionada = null;
            horarioSelecionado = null;
            document.getElementById('data-agendamento').value = '';
            document.getElementById('horario-agendamento').value = '';

            scheduleContainer.style.display = 'flex';
            currentCalendarDate = new Date();
            renderCalendar();
            renderHorarios([]);
            checkFormValidity();
        });
    });

    document.getElementById('prev-month').onclick = () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
        renderHorarios([]);
    };
    document.getElementById('next-month').onclick = () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
        renderHorarios([]);
    };

    function checkFormValidity() {
        const nome = nomeInput.value.trim();
        const telefone = telefoneInput.value.trim();
        const servico = servicoSelect.value;

        if (nome && telefone && servico && barbeiroSelecionado && dataSelecionada && horarioSelecionado) {
            agendarBtn.disabled = false;
        } else {
            agendarBtn.disabled = true;
        }
    }

    form.addEventListener('input', checkFormValidity);

    agendarBtn.addEventListener('click', function(event) {
        event.preventDefault();

        if (agendarBtn.disabled) {
            return;
        }

        const nome = nomeInput.value;
        const telefone = telefoneInput.value;
        const servico = servicoSelect.value;
        const profissionalNome = barbeiroSelecionado.dataset.name;
        const data = dataSelecionada;
        const horario = horarioSelecionado;

        // Adiciona o novo agendamento ao objeto e salva no localStorage
        const barberId = barbeiroSelecionado.dataset.id;
        if (!agendamentosPorBarbeiro[barberId][data]) {
            agendamentosPorBarbeiro[barberId][data] = [];
        }
        agendamentosPorBarbeiro[barberId][data].push(horario);
        localStorage.setItem('agendamentosPorBarbeiro', JSON.stringify(agendamentosPorBarbeiro));

        // Adiciona o agendamento à lista do cliente
        let clienteAgendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
        clienteAgendamentos.push({
            nome,
            telefone,
            servico,
            profissional: profissionalNome,
            data,
            horario
        });
        localStorage.setItem('agendamentos', JSON.stringify(clienteAgendamentos));
        
        const mensagem = `Olá, gostaria de agendar um horário!
Nome: ${nome}
Telefone: ${telefone}
Serviço: ${servico}
Profissional: ${profissionalNome}
Data: ${data}
Horário: ${horario}`;

        const url = `https://wa.me/5551985330121?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');

        agendamentoMessage.textContent = 'Agendamento enviado com sucesso! Aguarde a confirmação.';
        agendamentoMessage.style.color = '#28a745';
        
        resetForm();
        renderCalendar(); // Renderiza o calendário novamente para atualizar os horários
    });

    limparBtn.addEventListener('click', function(event) {
        event.preventDefault();
        resetForm();
    });
    
    // Configuração inicial do formulário
    agendarBtn.disabled = true;
    scheduleContainer.style.display = 'none';

    // Código existente para o menu lateral, modais, etc.
    const backToTopButton = document.getElementById("back-to-top");
    window.addEventListener("scroll", () => {
        backToTopButton.style.display = window.scrollY > 300 ? "flex" : "none";
    });

    backToTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    
    const sideMenuHandle = document.getElementById('side-menu-handle');
    const sideMenu = document.querySelector('.side-menu');

    sideMenuHandle.addEventListener('click', (e) => {
        e.stopPropagation();
        sideMenu.classList.add('open');
        sideMenuHandle.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
        if (sideMenu.classList.contains('open') && !sideMenu.contains(e.target) && !sideMenuHandle.contains(e.target)) {
            sideMenu.classList.remove('open');
            sideMenuHandle.style.display = 'flex';
        }
    });

    // Modais
    const horarioModal = document.getElementById("horario-modal");
    const horarioLink = document.getElementById("horario-link");
    const closeHorarioBtn = document.querySelector(".close-horario");

    horarioLink.onclick = function() { horarioModal.style.display = "block"; };
    closeHorarioBtn.onclick = function() { horarioModal.style.display = "none"; };
    window.onclick = function(event) { if (event.target == horarioModal) horarioModal.style.display = "none"; };
    
    const clienteLink = document.getElementById('cliente-link');
    const clienteModal = document.getElementById('cliente-modal');
    const closeModal = clienteModal.querySelector('.close');
    const btnCadastrar = document.getElementById('btn-cadastrar');
    const btnEntrar = document.getElementById('btn-entrar');
    const modalCadastrar = document.getElementById('modal-cadastrar');
    const modalEntrar = document.getElementById('modal-entrar');
    const modalMsg = document.getElementById('modal-msg');
    const agendamentosList = document.getElementById('agendamentos-list');
    const cancelarBtn = document.getElementById('cancelar-agendamento-btn');
    const clienteLinkMenu = document.getElementById('cliente-link-menu');

    let clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    let telefoneClienteLogado = '';
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');

    clienteLink.onclick = () => {
        clienteModal.style.display = 'block';
        modalCadastrar.style.display = 'none';
        modalEntrar.style.display = 'none';
        agendamentosList.innerHTML = '';
        cancelarBtn.style.display = 'none';
        modalMsg.textContent = '';
    };

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
        agendamentosList.innerHTML = '';
        cancelarBtn.style.display = 'none';
    };

    btnEntrar.onclick = () => {
        modalEntrar.style.display = 'block';
        modalCadastrar.style.display = 'none';
        modalMsg.textContent = '';
        agendamentosList.innerHTML = '';
        cancelarBtn.style.display = 'none';
    };

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
        const cliente = clientes.find(c => c.telefone === telefone);
        if (cliente) {
            modalMsg.textContent = 'Login realizado!';
            telefoneClienteLogado = telefone;
            mostrarAgendamentosCliente(telefone);
        } else {
            modalMsg.textContent = 'Telefone não cadastrado!';
        }
        document.getElementById('login-telefone').value = '';
    };
    
    function mostrarAgendamentosCliente(telefone) {
        const meusAgendamentos = agendamentos.filter(a => a.telefone === telefone);
        
        agendamentosList.innerHTML = '';
        if (meusAgendamentos.length === 0) {
            agendamentosList.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
            cancelarBtn.style.display = 'none';
            return;
        }
        
        let html = '<h4>Seus agendamentos:</h4><form id="form-cancelar-agendamento"><ul style="padding-left:18px;">';
        meusAgendamentos.forEach((a, index) => {
            html += `<li>
                <label>
                    <input type="checkbox" name="cancelar" value="${a.data}|${a.horario}|${a.profissional}|${a.servico}|${index}">
                    <strong>${a.data} às ${a.horario}</strong> com <strong>${a.profissional}</strong> — <span>${a.servico}</span>
                </label>
            </li>`;
        });
        html += '</ul></form>';
        agendamentosList.innerHTML = html;
        cancelarBtn.style.display = 'block';
    }

    document.getElementById('cancelar-agendamento-btn').onclick = function() {
        const telefone = telefoneClienteLogado;
        const checks = document.querySelectorAll('#form-cancelar-agendamento input[type="checkbox"]:checked');
        
        if (checks.length === 0) {
            alert('Selecione ao menos um serviço para cancelar.');
            return;
        }
        
        const indicesParaRemover = Array.from(checks).map(check => parseInt(check.value.split('|')[4]));
        agendamentos = agendamentos.filter((_, index) => !indicesParaRemover.includes(index));

        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        
        // Atualiza a lista de agendamentos por barbeiro para que o horário cancelado volte a ficar disponível
        checks.forEach(check => {
            const [data, horario, profissional] = check.value.split('|');
            const barbeiroId = Object.keys(agendamentosPorBarbeiro).find(id => agendamentosPorBarbeiro[id][data]?.includes(horario) && barbeiros.find(b => b.dataset.id === id).dataset.name === profissional);
            if (barbeiroId && agendamentosPorBarbeiro[barbeiroId][data]) {
                const index = agendamentosPorBarbeiro[barbeiroId][data].indexOf(horario);
                if (index > -1) {
                    agendamentosPorBarbeiro[barbeiroId][data].splice(index, 1);
                }
            }
        });
        localStorage.setItem('agendamentosPorBarbeiro', JSON.stringify(agendamentosPorBarbeiro));
        
        alert('Agendamento(s) cancelado(s) com sucesso!');
        mostrarAgendamentosCliente(telefone);
    };

    clienteLinkMenu.onclick = function(e) {
        e.preventDefault();
        document.getElementById('cliente-link').click();
    };
});