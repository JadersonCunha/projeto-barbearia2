// Fix para o menu lateral
document.addEventListener('DOMContentLoaded', function() {
    const sideMenuHandle = document.getElementById('side-menu-handle');
    const sideMenu = document.querySelector('.side-menu');
    
    if (sideMenuHandle && sideMenu) {
        sideMenuHandle.addEventListener('click', function(e) {
            e.stopPropagation();
            sideMenu.classList.add('open');
            sideMenuHandle.style.display = 'none';
        });
        
        document.addEventListener('click', function(e) {
            if (sideMenu.classList.contains('open') && 
                !sideMenu.contains(e.target) && 
                !sideMenuHandle.contains(e.target)) {
                sideMenu.classList.remove('open');
                sideMenuHandle.style.display = 'flex';
            }
        });
        
        const menuLinks = sideMenu.querySelectorAll('a');
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                sideMenu.classList.remove('open');
                sideMenuHandle.style.display = 'flex';
            });
        });
    }
});