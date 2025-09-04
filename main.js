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
        document.querySelectorAll('.barb-img').forEach(barb => barbeiro.classList.remove('selected'));
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

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendarDays.appendChild(emptyDay);
        }

        for (let day = 1; day <= lastDayOfMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day');
            dayEl.textContent = day;
            dayEl.dataset.day = day;

            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayEl.classList.add('today');
            }

            if (selectedDate && year === selectedDate.getFullYear() && month === selectedDate.getMonth() && day === selectedDate.getDate()) {
                dayEl.classList.add('selected');
            }

            dayEl.addEventListener('click', () => {
                document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                dayEl.classList.add('selected');
                selectedDate = new Date(year, month, day);
                const formattedDate = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
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