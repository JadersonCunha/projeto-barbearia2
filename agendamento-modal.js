// Sistema de Agendamento Modal
class AgendamentoModal {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 6;
        this.agendamentoData = {};
        this.today = new Date();
        this.selectedDate = null;
        
        this.horariosFixos = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
            "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
            "19:00", "19:30", "20:00", "20:30"
        ];
        
        this.feriados = [
            "2025-01-01", "2025-02-25", "2025-02-26", "2025-04-18", "2025-04-21",
            "2025-05-01", "2025-06-19", "2025-09-07", "2025-10-12", "2025-11-02",
            "2025-11-15", "2025-12-25"
        ];
        
        this.meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        // Abrir modal
        document.getElementById('open-agendamento-modal').addEventListener('click', () => {
            this.openModal();
        });
        
        // Fechar modal
        document.getElementById('close-agendamento').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Navegação
        document.getElementById('btn-voltar').addEventListener('click', () => {
            this.previousStep();
        });
        
        document.getElementById('btn-proximo').addEventListener('click', () => {
            this.nextStep();
        });
        
        // Confirmar agendamento
        document.getElementById('confirmar-agendamento').addEventListener('click', () => {
            this.confirmarAgendamento();
        });
        
        // Seleção de barbeiro
        document.querySelectorAll('.barb-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectBarbeiro(card);
            });
        });
        
        // Calendário
        document.getElementById('prev-month-modal').addEventListener('click', () => {
            this.today.setMonth(this.today.getMonth() - 1);
            this.renderCalendar();
        });
        
        document.getElementById('next-month-modal').addEventListener('click', () => {
            this.today.setMonth(this.today.getMonth() + 1);
            this.renderCalendar();
        });
        
        // Serviços - checkboxes
        document.querySelectorAll('.servico-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectedServicos();
            });
        });
    }
    
    openModal() {
        document.getElementById('agendamento-modal').style.display = 'block';
        this.resetModal();
        this.showStep(1);
    }
    
    closeModal() {
        document.getElementById('agendamento-modal').style.display = 'none';
        this.resetModal();
    }
    
    resetModal() {
        this.currentStep = 1;
        this.agendamentoData = {};
        this.selectedDate = null;
        
        // Limpar seleções
        document.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Limpar checkboxes
        document.querySelectorAll('.servico-checkbox').forEach(cb => {
            cb.checked = false;
        });
        
        // Limpar inputs
        document.getElementById('nome-modal').value = '';
        document.getElementById('telefone-modal').value = '';
    }
    
    showStep(step) {
        // Esconder todas as etapas
        document.querySelectorAll('.step').forEach(s => {
            s.style.display = 'none';
        });
        
        // Mostrar etapa atual
        document.getElementById(`step-${this.getStepName(step)}`).style.display = 'block';
        
        // Controlar botões
        const btnVoltar = document.getElementById('btn-voltar');
        const btnProximo = document.getElementById('btn-proximo');
        
        btnVoltar.style.display = step > 1 ? 'block' : 'none';
        btnProximo.style.display = step < this.maxSteps ? 'block' : 'none';
        
        // Ações específicas por etapa
        if (step === 2) {
            this.renderCalendar();
        } else if (step === 3) {
            this.renderHorarios();
        } else if (step === 6) {
            this.showResumo();
        }
        
        this.currentStep = step;
    }
    
    getStepName(step) {
        const steps = ['', 'barbeiro', 'data', 'horario', 'servico', 'dados', 'resumo'];
        return steps[step];
    }
    
    nextStep() {
        if (this.validateCurrentStep()) {
            this.showStep(this.currentStep + 1);
        }
    }
    
    previousStep() {
        this.showStep(this.currentStep - 1);
    }
    
    validateCurrentStep() {
        switch(this.currentStep) {
            case 1:
                return !!this.agendamentoData.barbeiro;
            case 2:
                return !!this.agendamentoData.data;
            case 3:
                return !!this.agendamentoData.horario;
            case 4:
                return this.agendamentoData.servicos && this.agendamentoData.servicos.length > 0;
            case 5:
                const nome = document.getElementById('nome-modal').value.trim();
                const telefone = document.getElementById('telefone-modal').value.trim();
                if (nome && telefone) {
                    this.agendamentoData.nome = nome;
                    this.agendamentoData.telefone = telefone;
                    return true;
                }
                return false;
            default:
                return true;
        }
    }
    
    selectBarbeiro(card) {
        document.querySelectorAll('.barb-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        this.agendamentoData.barbeiro = {
            id: card.dataset.id,
            nome: card.dataset.name
        };
    }
    
    renderCalendar() {
        const calendarDays = document.getElementById('calendar-days-modal');
        const currentMonthYear = document.getElementById('current-month-year-modal');
        
        calendarDays.innerHTML = '';
        currentMonthYear.textContent = `${this.meses[this.today.getMonth()]} ${this.today.getFullYear()}`;
        
        const firstDay = new Date(this.today.getFullYear(), this.today.getMonth(), 1).getDay();
        const lastDay = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0).getDate();
        
        // Dias vazios
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendarDays.appendChild(emptyDay);
        }
        
        // Dias do mês
        const todayNoTime = new Date();
        todayNoTime.setHours(0, 0, 0, 0);
        
        for (let i = 1; i <= lastDay; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = i;
            
            const dayDate = new Date(this.today.getFullYear(), this.today.getMonth(), i);
            dayDate.setHours(0, 0, 0, 0);
            
            const isWeekend = dayDate.getDay() === 0;
            const isHoliday = this.feriados.includes(dayDate.toISOString().slice(0, 10));
            const isPast = dayDate < todayNoTime;
            
            if (isPast || isWeekend || isHoliday) {
                dayElement.classList.add('empty');
            } else {
                dayElement.addEventListener('click', () => {
                    document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                    dayElement.classList.add('selected');
                    this.selectedDate = dayDate.toISOString().slice(0, 10);
                    this.agendamentoData.data = this.selectedDate;
                });
            }
            
            calendarDays.appendChild(dayElement);
        }
    }
    
    renderHorarios() {
        const horariosGrid = document.getElementById('horarios-grid-modal');
        horariosGrid.innerHTML = '';
        
        if (!this.agendamentoData.barbeiro || !this.agendamentoData.data) return;
        
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        const agendamentosDoDia = agendamentos.filter(ag => 
            ag.profissional === this.agendamentoData.barbeiro.nome && 
            ag.data === this.agendamentoData.data
        );
        
        this.horariosFixos.forEach(horario => {
            const horarioElement = document.createElement('div');
            horarioElement.classList.add('horario-modal-item');
            horarioElement.textContent = horario;
            
            const isBooked = agendamentosDoDia.some(ag => ag.horario === horario);
            
            if (isBooked) {
                horarioElement.classList.add('booked');
            } else {
                horarioElement.addEventListener('click', () => {
                    document.querySelectorAll('.horario-modal-item').forEach(h => h.classList.remove('selected'));
                    horarioElement.classList.add('selected');
                    this.agendamentoData.horario = horario;
                });
            }
            
            horariosGrid.appendChild(horarioElement);
        });
    }
    
    updateSelectedServicos() {
        const checkboxes = document.querySelectorAll('.servico-checkbox:checked');
        const servicos = [];
        let precoTotal = 0;
        
        checkboxes.forEach(checkbox => {
            const item = checkbox.closest('.servico-item');
            servicos.push(item.dataset.value);
            precoTotal += parseFloat(item.dataset.price);
        });
        
        this.agendamentoData.servicos = servicos;
        this.agendamentoData.precoTotal = precoTotal.toFixed(2);
    }
    
    showResumo() {
        document.getElementById('resumo-barbeiro').textContent = this.agendamentoData.barbeiro.nome;
        document.getElementById('resumo-data').textContent = new Date(this.agendamentoData.data + 'T00:00:00').toLocaleDateString('pt-BR');
        document.getElementById('resumo-horario').textContent = this.agendamentoData.horario;
        document.getElementById('resumo-servico').textContent = `${this.agendamentoData.servicos.join(', ')} (R$ ${this.agendamentoData.precoTotal})`;
        document.getElementById('resumo-nome').textContent = this.agendamentoData.nome;
        document.getElementById('resumo-telefone').textContent = this.agendamentoData.telefone;
    }
    
    confirmarAgendamento() {
        const novoAgendamento = {
            nome: this.agendamentoData.nome,
            telefone: this.agendamentoData.telefone,
            servicos: this.agendamentoData.servicos.join(', '),
            profissional: this.agendamentoData.barbeiro.nome,
            data: this.agendamentoData.data,
            horario: this.agendamentoData.horario,
            id: Date.now()
        };
        
        let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        agendamentos.push(novoAgendamento);
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        
        // Atualizar agenda na sidebar
        this.updateAgendaBarbeiros();
        
        // Enviar para WhatsApp
        const mensagem = `Olá, gostaria de agendar um horário na Barbearia Alpha!
*Nome:* ${this.agendamentoData.nome}
*Telefone:* ${this.agendamentoData.telefone}
*Serviços:* ${this.agendamentoData.servicos.join(', ')}
*Valor Total:* R$ ${this.agendamentoData.precoTotal}
*Profissional:* ${this.agendamentoData.barbeiro.nome}
*Data:* ${new Date(this.agendamentoData.data + 'T00:00:00').toLocaleDateString('pt-BR')}
*Horário:* ${this.agendamentoData.horario}`;
        
        const telefoneWhatsapp = "5551985330121";
        const linkWhatsapp = `https://wa.me/${telefoneWhatsapp}?text=${encodeURIComponent(mensagem)}`;
        
        window.open(linkWhatsapp, '_blank');
        
        this.closeModal();
        alert('Agendamento realizado com sucesso!');
    }
    
    updateAgendaBarbeiros() {
        const agendaContent = document.getElementById('agenda-content');
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        
        if (agendamentos.length === 0) {
            agendaContent.innerHTML = '<p>Nenhum agendamento encontrado</p>';
            return;
        }
        
        // Agrupar por barbeiro e data de hoje
        const hoje = new Date().toISOString().slice(0, 10);
        const agendamentosHoje = agendamentos.filter(ag => ag.data === hoje);
        
        if (agendamentosHoje.length === 0) {
            agendaContent.innerHTML = '<p>Nenhum agendamento para hoje</p>';
            return;
        }
        
        const barbeiros = ['Carlos França', 'André Souza', 'Ricardo Silva'];
        const barbeiroImgs = {
            'Carlos França': 'assets/barb1.jfif',
            'André Souza': 'assets/barb2.jfif',
            'Ricardo Silva': 'assets/barb3.jpg'
        };
        
        let html = '';
        
        barbeiros.forEach(barbeiro => {
            const agendamentosBarbeiro = agendamentosHoje.filter(ag => ag.profissional === barbeiro);
            
            if (agendamentosBarbeiro.length > 0) {
                html += `
                    <div class="barbeiro-agenda">
                        <div class="barbeiro-info">
                            <img src="${barbeiroImgs[barbeiro]}" alt="${barbeiro}">
                            <div>
                                <h4>${barbeiro}</h4>
                                <p>${agendamentosBarbeiro.length} agendamento(s) hoje</p>
                            </div>
                        </div>
                        <div class="agendamentos-dia">
                `;
                
                agendamentosBarbeiro.forEach(ag => {
                    html += `
                        <div class="agendamento-item">
                            <strong>${ag.horario}</strong> - ${ag.servicos}
                        </div>
                    `;
                });
                
                html += '</div></div>';
            }
        });
        
        agendaContent.innerHTML = html || '<p>Nenhum agendamento para hoje</p>';
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.AgendamentoModalInstance = new AgendamentoModal();
});