// Script de debug para cancelamento
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar botão de debug
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'DEBUG CANCELAMENTO';
    debugBtn.style.position = 'fixed';
    debugBtn.style.top = '70px';
    debugBtn.style.right = '20px';
    debugBtn.style.zIndex = '9999';
    debugBtn.style.background = 'red';
    debugBtn.style.color = 'white';
    debugBtn.style.padding = '10px';
    debugBtn.style.border = 'none';
    debugBtn.style.borderRadius = '5px';
    debugBtn.style.cursor = 'pointer';
    document.body.appendChild(debugBtn);
    
    debugBtn.addEventListener('click', function() {
        console.log('=== DEBUG CANCELAMENTO ===');
        
        // Verificar localStorage
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        console.log('Agendamentos no localStorage:', agendamentos);
        
        // Verificar elementos DOM
        const cancelBtn = document.getElementById('cancelar-agendamento-btn');
        const checkboxes = document.querySelectorAll('.cancel-checkbox');
        const checkedBoxes = document.querySelectorAll('.cancel-checkbox:checked');
        
        console.log('Botão cancelar existe:', !!cancelBtn);
        console.log('Total de checkboxes:', checkboxes.length);
        console.log('Checkboxes marcados:', checkedBoxes.length);
        
        // Verificar IDs dos elementos li
        const listItems = document.querySelectorAll('#agendamentos-list li');
        console.log('Items na lista:', listItems.length);
        listItems.forEach((li, index) => {
            console.log(`Item ${index}: ID = ${li.dataset.id}`);
        });
        
        // Teste de cancelamento manual
        if (agendamentos.length > 0) {
            const idToRemove = agendamentos[0].id;
            console.log('Tentando remover ID:', idToRemove);
            
            const filteredAgendamentos = agendamentos.filter(ag => ag.id !== idToRemove);
            console.log('Agendamentos após filtro:', filteredAgendamentos);
            
            localStorage.setItem('agendamentos', JSON.stringify(filteredAgendamentos));
            console.log('localStorage atualizado');
            
            // Recarregar página para ver resultado
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    });
});