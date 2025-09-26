document.addEventListener('DOMContentLoaded', () => {
    // ################### Agendamento e Calendário ###################
    const agendamentoForm = document.getElementById('agendamento-form');
    const barbeiroImgs = document.querySelectorAll('.barb-img');
    const scheduleContainer = document.getElementById('barber-schedule-container');
    const dataInput = document.getElementById('data-agendamento');
    const horarioInput = document.getElementById('horario-agendamento');
    const profissionalInput = document.getElementById('profissional-agendamento');
    const submitBtn = document.querySelector('.submit-btn');
    const clearBtn = document.querySelector('.submit-btn-clear');
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const horariosGrid = document.getElementById('horarios-grid');
    const servicosCheckboxes = document.querySelectorAll('input[name="servico"]');

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    let today = new Date();
    let selectedDate = null;
    let selectedBarberId = null;

    const horariosFixos = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
        "19:00", "19:30", "20:00", "20:30"
    ];

    const feriados = [
        "2025-01-01", "2025-02-25", "2025-02-26", "2025-04-18", "2025-04-21",
        "2025-05-01", "2025-06-19", "2025-09-07", "2025-10-12", "2025-11-02",
        "2025-11-15", "2025-12-25"
    ];

    let agendamentosFicticios = JSON.parse(localStorage.getItem('agendamentosFicticios')) || [];
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};

    const updateSubmitButton = () => {
        const selectedServices = document.querySelectorAll('input[name="servico"]:checked').length > 0;
        const isFormFilled = !!document.getElementById('nome').value && !!document.getElementById('telefone').value;
        const isSelectionMade = !!selectedBarberId && !!selectedDate && !!horarioInput.value;
        submitBtn.disabled = !(selectedServices && isFormFilled && isSelectionMade);
    };

    const renderCalendar = (date) => {
        calendarDays.innerHTML = '';
        currentMonthYear.textContent = `${meses[date.getMonth()]} ${date.getFullYear()}`;

        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendarDays.appendChild(emptyDay);
        }

        const todayNoTime = new Date();
        todayNoTime.setHours(0, 0, 0, 0);

        for (let i = 1; i <= lastDayOfMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = i;
            const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
            dayDate.setHours(0, 0, 0, 0);

            const isWeekend = dayDate.getDay() === 0;
            const isHoliday = feriados.includes(dayDate.toISOString().slice(0, 10));
            const isPast = dayDate < todayNoTime;

            if (isPast || isWeekend || isHoliday) {
                dayElement.classList.add('empty');
            } else {
                dayElement.addEventListener('click', () => {
                    document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                    dayElement.classList.add('selected');
                    selectedDate = dayDate.toISOString().slice(0, 10);
                    dataInput.value = selectedDate;
                    horarioInput.value = '';
                    renderHorarios();
                    updateSubmitButton();
                });
            }

            calendarDays.appendChild(dayElement);
        }
    };

    const renderHorarios = () => {
        horariosGrid.innerHTML = '';
        if (!selectedBarberId || !selectedDate) {
            return;
        }

        const agendamentosDoDia = agendamentosFicticios.filter(agendamento =>
            agendamento.profissional === selectedBarberId && agendamento.data === selectedDate
        );

        horariosFixos.forEach(horario => {
            const horarioElement = document.createElement('div');
            horarioElement.classList.add('horario-item');
            horarioElement.textContent = horario;

            const isBooked = agendamentosDoDia.some(ag => ag.horario === horario);

            if (isBooked) {
                horarioElement.classList.add('booked');
            } else {
                horarioElement.addEventListener('click', () => {
                    document.querySelectorAll('.horario-item').forEach(h => h.classList.remove('selected'));
                    horarioElement.classList.add('selected');
                    horarioInput.value = horario;
                    updateSubmitButton();
                });
            }

            horariosGrid.appendChild(horarioElement);
        });
    };

    barbeiroImgs.forEach(barbeiro => {
        barbeiro.addEventListener('click', () => {
            barbeiroImgs.forEach(b => b.classList.remove('selected'));
            barbeiro.classList.add('selected');
            selectedBarberId = barbeiro.dataset.id;
            profissionalInput.value = barbeiro.dataset.name;

            scheduleContainer.style.display = 'block';
            today = new Date();
            renderCalendar(today);
            selectedDate = null;
            dataInput.value = '';
            horarioInput.value = '';
            horariosGrid.innerHTML = '';
            updateSubmitButton();
        });
    });

    prevMonthBtn.addEventListener('click', () => {
        today.setMonth(today.getMonth() - 1);
        renderCalendar(today);
        selectedDate = null;
        dataInput.value = '';
        horarioInput.value = '';
        horariosGrid.innerHTML = '';
        updateSubmitButton();
    });

    nextMonthBtn.addEventListener('click', () => {
        today.setMonth(today.getMonth() + 1);
        renderCalendar(today);
        selectedDate = null;
        dataInput.value = '';
        horarioInput.value = '';
        horariosGrid.innerHTML = '';
        updateSubmitButton();
    });

    servicosCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSubmitButton);
    });

    agendamentoForm.addEventListener('input', updateSubmitButton);
    agendamentoForm.addEventListener('change', updateSubmitButton);

    agendamentoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const servicos = Array.from(document.querySelectorAll('input[name="servico"]:checked'))
            .map(checkbox => checkbox.value)
            .join(', ');

        const novoAgendamento = {
            nome: nome,
            telefone: telefone,
            servicos: servicos,
            profissional: profissionalInput.value,
            data: dataInput.value,
            horario: horarioInput.value,
            id: Date.now()
        };

        agendamentosFicticios.push(novoAgendamento);
        localStorage.setItem('agendamentosFicticios', JSON.stringify(agendamentosFicticios));

        const mensagemWhatsapp = `Olá, gostaria de agendar um horário na Barbearia Alpha!
*Nome:* ${nome}
*Telefone:* ${telefone}
*Serviço(s):* ${servicos}
*Profissional:* ${profissionalInput.value}
*Data:* ${new Date(dataInput.value + 'T00:00:00').toLocaleDateString('pt-BR')}
*Horário:* ${horarioInput.value}
`;
        const telefoneWhatsapp = "5551985330121";
        const linkWhatsapp = `https://wa.me/${telefoneWhatsapp}?text=${encodeURIComponent(mensagemWhatsapp)}`;

        window.open(linkWhatsapp, '_blank');

        agendamentoForm.reset();
        barbeiroImgs.forEach(b => b.classList.remove('selected'));
        scheduleContainer.style.display = 'none';
        submitBtn.disabled = true;
        document.getElementById('agendamento-message').textContent = 'Agendamento enviado! Aguarde a confirmação.';
    });

    clearBtn.addEventListener('click', () => {
        agendamentoForm.reset();
        barbeiroImgs.forEach(b => b.classList.remove('selected'));
        scheduleContainer.style.display = 'none';
        submitBtn.disabled = true;
        document.getElementById('agendamento-message').textContent = '';
        selectedBarberId = null;
        selectedDate = null;
        horarioInput.value = '';
        dataInput.value = '';
        horariosGrid.innerHTML = '';
    });

    // ################### Botão Voltar ao Topo ###################
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ################### Menu Lateral ###################
    const sideMenuHandle = document.getElementById('side-menu-handle');
    const sideMenu = document.querySelector('.side-menu');

    if (sideMenuHandle && sideMenu) {
        sideMenuHandle.style.display = 'flex';

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

        const menuLinks = sideMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                sideMenu.classList.remove('open');
                sideMenuHandle.style.display = 'flex';
            });
        });
    }

    // ################### Modais e Área do Cliente ###################
    const clienteModal = document.getElementById('cliente-modal');
    const closeBtn = clienteModal ? clienteModal.querySelector('.close') : null;
    const clienteLinkMenu = document.getElementById('cliente-link-menu');

    const horarioLink = document.getElementById('horario-link');
    const horarioModal = document.getElementById('horario-modal');
    const closeHorarioBtn = horarioModal ? horarioModal.querySelector('.close-horario') : null;

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

    if (clienteLinkMenu && clienteModal) {
        clienteLinkMenu.addEventListener('click', (e) => {
            e.preventDefault();
            clienteModal.style.display = 'block';
            resetClienteModal();
        });
    }

    if (horarioLink && horarioModal) {
        horarioLink.addEventListener('click', (e) => {
            e.preventDefault();
            horarioModal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            clienteModal.style.display = 'none';
            resetClienteModal();
        });
    }
    
    if (closeHorarioBtn) {
        closeHorarioBtn.addEventListener('click', () => {
            horarioModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === clienteModal) {
            clienteModal.style.display = 'none';
            resetClienteModal();
        }
        if (e.target === horarioModal) {
            horarioModal.style.display = 'none';
        }
    });

    btnCadastrar.addEventListener('click', () => {
        modalButtons.style.display = 'none';
        modalCadastrar.style.display = 'flex';
        modalEntrar.style.display = 'none';
        modalMsg.textContent = '';
    });

    btnEntrar.addEventListener('click', () => {
        modalButtons.style.display = 'none';
        modalCadastrar.style.display = 'none';
        modalEntrar.style.display = 'flex';
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

    confirmCadastroBtn.addEventListener('click', () => {
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

        // Redireciona para o login após o cadastro
        modalCadastrar.style.display = 'none';
        modalEntrar.style.display = 'flex';
        loginTelefoneInput.value = telefone; // Preenche o campo de telefone para o usuário
    });

    confirmLoginBtn.addEventListener('click', () => {
        const telefone = loginTelefoneInput.value.trim();
        if (!usuarios[telefone]) {
            modalMsg.textContent = 'Telefone não encontrado. Por favor, cadastre-se.';
            return;
        }

        modalMsg.textContent = `Bem-vindo(a), ${usuarios[telefone].nome}!`;
        modalEntrar.style.display = 'none';

        displayAgendamentos(telefone);
    });

    function displayAgendamentos(telefone) {
        agendamentosList.innerHTML = '';
        const agendamentosCliente = agendamentosFicticios.filter(ag => ag.telefone === telefone);

        if (agendamentosCliente.length === 0) {
            agendamentosList.innerHTML = '<p>Você não possui agendamentos.</p>';
            cancelarAgendamentoBtn.style.display = 'none';
            return;
        }

        const ul = document.createElement('ul');
        agendamentosCliente.forEach(ag => {
            const li = document.createElement('li');
            li.dataset.id = ag.id;
            li.innerHTML = `
                <div>
                    <strong>${ag.profissional}</strong><br>
                    Serviços: ${ag.servicos}<br>
                    Data: ${new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR')} - Horário: ${ag.horario}
                </div>
                <input type="checkbox" class="cancel-checkbox">
            `;
            ul.appendChild(li);
        });
        agendamentosList.appendChild(ul);
        cancelarAgendamentoBtn.style.display = 'block';
    }

    cancelarAgendamentoBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.cancel-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('Por favor, selecione pelo menos um agendamento para cancelar.');
            return;
        }

        const idsToCancel = Array.from(checkboxes).map(cb => parseInt(cb.closest('li').dataset.id));
        agendamentosFicticios = agendamentosFicticios.filter(ag => !idsToCancel.includes(ag.id));
        localStorage.setItem('agendamentosFicticios', JSON.stringify(agendamentosFicticios));

        alert('Agendamentos cancelados com sucesso.');

        const telefoneAtual = loginTelefoneInput.value.trim();
        displayAgendamentos(telefoneAtual);
    });
});