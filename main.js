document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica do Formulário de Agendamento ---
    const form = document.getElementById('agendamento-form');
    const nomeInput = document.getElementById('nome');
    const telefoneInput = document.getElementById('telefone');
    const emailInput = document.getElementById('email');
    const horarioInput = document.getElementById('horario');
    const dataInput = document.getElementById('data');
    const profissionalInput = document.getElementById('profissional');
    const servicoInput = document.getElementById('servico');
    const barbeirosContainer = document.querySelector('.barbeiros');
    const servicosCheckboxes = document.querySelectorAll('.servico-checkbox');
    const agendamentoMessage = document.getElementById('agendamento-message');

    let servicosSelecionados = [];
    let barbeiroSelecionado = '';

    // Lógica para selecionar o barbeiro
    barbeirosContainer.addEventListener('click', (event) => {
        const target = event.target.closest('.barb-img');
        if (target) {
            // Remove a classe 'selected' de todos os barbeiros
            document.querySelectorAll('.barb-img').forEach(barb => barb.classList.remove('selected'));
            // Adiciona a classe 'selected' ao barbeiro clicado
            target.classList.add('selected');
            barbeiroSelecionado = target.dataset.name;
            profissionalInput.value = barbeiroSelecionado;
        }
    });

    // Lógica para selecionar os serviços
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

    // Lógica para agendar (botão de submit)
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Validação básica do formulário
        if (nomeInput.value.trim() === '' || telefoneInput.value.trim() === '' || emailInput.value.trim() === '') {
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
        
        if (dataInput.value.trim() === '') {
            agendamentoMessage.textContent = 'Por favor, selecione uma data no calendário.';
            agendamentoMessage.style.color = '#dc3545';
            return;
        }

        // Simulação de agendamento bem-sucedido
        agendamentoMessage.textContent = 'Agendamento realizado com sucesso! Em breve entraremos em contato.';
        agendamentoMessage.style.color = '#28a745';

        // Limpa o formulário após o envio
        form.reset();
        servicosSelecionados = [];
        barbeiroSelecionado = '';
        servicoInput.value = '';
        profissionalInput.value = '';
        document.querySelectorAll('.barb-img').forEach(barb => barb.classList.remove('selected'));
        // Limpa a seleção do calendário
        document.querySelectorAll('.day.selected').forEach(day => day.classList.remove('selected'));
        dataInput.value = '';
    });

    // Lógica do botão Limpar
    form.addEventListener('reset', () => {
        setTimeout(() => {
            servicosSelecionados = [];
            barbeiroSelecionado = '';
            servicoInput.value = '';
            profissionalInput.value = '';
            agendamentoMessage.textContent = '';
            document.querySelectorAll('.barb-img').forEach(barb => barb.classList.remove('selected'));
            // Limpa a seleção do calendário
            document.querySelectorAll('.day.selected').forEach(day => day.classList.remove('selected'));
            dataInput.value = '';
        }, 0);
    });

    // --- Lógica do Calendário ---
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthEl = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let currentDate = new Date();
    let selectedDate = null;

    function renderCalendar() {
        calendarDays.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonthEl.textContent = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

        // Adiciona dias vazios para preencher a primeira semana
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendarDays.appendChild(emptyDay);
        }

        // Adiciona os dias do mês
        for (let day = 1; day <= lastDayOfMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day');
            dayEl.textContent = day;
            dayEl.dataset.day = day;

            // Marca o dia de hoje
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayEl.classList.add('today');
            }

            // Marca o dia selecionado
            if (selectedDate && year === selectedDate.getFullYear() && month === selectedDate.getMonth() && day === selectedDate.getDate()) {
                dayEl.classList.add('selected');
            }

            dayEl.addEventListener('click', () => {
                // Remove a seleção anterior
                document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                // Adiciona a nova seleção
                dayEl.classList.add('selected');
                // Salva a data selecionada
                selectedDate = new Date(year, month, day);
                // Formata a data para o input (AAAA-MM-DD)
                const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dataInput.value = formattedDate;
            });

            calendarDays.appendChild(dayEl);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();

});
