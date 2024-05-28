document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const addButton = document.getElementById('addButton');
    const rankingList = document.getElementById('rankingList');
    const darkModeButton = document.getElementById('darkModeButton');
    const clearButton = document.getElementById('clearButton');
    const menuButton = document.getElementById('menuButton');
    const menuDropdown = document.getElementById('menuDropdown');
    const sortRaceButton = document.getElementById('sortRaceButton');
    const raceModal = document.getElementById('raceModal');
    const closeModals = document.querySelectorAll('.close');
    const raceList = document.getElementById('raceList');
    const confirmRemoveModal = document.getElementById('confirmRemoveModal');
    const confirmRemoveButton = document.getElementById('confirmRemoveButton');
    const cancelRemoveButton = document.getElementById('cancelRemoveButton');
    const round135Button = document.getElementById('round135Button');
    const round246Button = document.getElementById('round246Button');
    const round135Modal = document.getElementById('round135Modal');
    const round246Modal = document.getElementById('round246Modal');
    const closeRound135Modal = document.getElementById('closeRound135Modal');
    const closeRound246Modal = document.getElementById('closeRound246Modal');
    const round135List = document.getElementById('round135List');
    const round246List = document.getElementById('round246List');
    const restoreButton = document.getElementById('restoreButton'); // Adicionado botão de restaurar
    const downloadRankingButton = document.getElementById('downloadRankingButton');
    const siteButton = document.getElementById('siteButton'); // Botão para o site

    // Função para carregar uma imagem de fundo aleatória
    function setRandomBackground() {
        const images = ['imagens/fundo1.png', 'imagens/fundo2.png', 'imagens/fundo3.png', 'imagens/fundo4.jpg',]; // Adicione os nomes das suas imagens aqui
        const randomImage = images[Math.floor(Math.random() * images.length)];
        document.body.style.backgroundImage = `url(${randomImage})`;
    }

    setRandomBackground();

    downloadRankingButton.addEventListener('click', () => {
        downloadRanking();
    });
    
    // Função para salvar o ranking no localStorage
    function saveRanking() {
        const names = [];
        rankingList.querySelectorAll('li').forEach((li, index) => {
            const position = index + 1;
            li.dataset.position = position; // Convertendo para número antes de salvar
            names.push({ position: position, name: li.dataset.name });
        });
        localStorage.setItem('ranking', JSON.stringify(names));
    }
    // Função para fazer o download do ranking diretamente do localStorage
    function downloadRanking() {
        const date = new Date();
        const formattedDate = `${date.getDate()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}_${date.getHours()}${date.getMinutes()}`;
        const filename = `ranking0470_${formattedDate}.txt`;
        const rankingItems = [...rankingList.querySelectorAll('li')];
        const rankingText = rankingItems.map(item => item.dataset.name).join('\n');
        const blob = new Blob([rankingText], { type: 'text/plain' });
    
        // Cria um link temporário e inicia o download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
    
    // Função para carregar o ranking do localStorage
    function loadRanking() {
        const savedNames = JSON.parse(localStorage.getItem('ranking')) || [];
        savedNames.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.position}. ${item.name}`;
            li.dataset.position = parseInt(item.position); // Convertendo de volta para número
            li.dataset.name = item.name;
            rankingList.appendChild(li);
            addMoveUpButton(li);
            addDragAndDrop();
            // Adicionar evento de clique para remover piloto ao clicar no nome
            li.addEventListener('click', () => {
                const name = li.dataset.name;
                document.getElementById('removeName').textContent = name;
                confirmRemoveModal.style.display = 'block';
            });
        });
    }

    // Adicionar novo nome ao ranking
    addButton.addEventListener('click', addName);

    nameInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            addName();
        }
    });

    function addName() {
        const name = nameInput.value.trim();
        if (name) {
            const li = document.createElement('li');
            li.textContent = `${rankingList.childElementCount + 1}. ${name}`;
            li.dataset.position = rankingList.childElementCount + 1;
            li.dataset.name = name;
            rankingList.appendChild(li);
            nameInput.value = '';
            saveRanking();
            addMoveUpButton(li);
            addDragAndDrop();
            // Adicionar evento de clique para remover piloto ao clicar no nome
            li.addEventListener('click', () => {
                const name = li.dataset.name;
                document.getElementById('removeName').textContent = name;
                confirmRemoveModal.style.display = 'block';
            });
        }
    }

    // Adicionar botão de mover para cima
    function addMoveUpButton(li) {
        const moveUpButton = document.createElement('span');
        moveUpButton.classList.add('move-up');
        moveUpButton.textContent = '⬆';
        moveUpButton.addEventListener('click',
        (event) => {
            event.stopPropagation(); // Impede a propagação do evento para o elemento pai
            const prev = li.previousElementSibling;
            if (prev) {
                rankingList.insertBefore(li, prev);
                saveRanking();
                updatePositions();
            }
        });
        li.appendChild(moveUpButton);

        // Adicionar evento de clique para remover piloto ao clicar no nome
        li.addEventListener('click', () => {
            const name = li.dataset.name;
            document.getElementById('removeName').textContent = name;
            confirmRemoveModal.style.display = 'block';
        });
    }

    // Atualizar posições dos itens da lista
    function updatePositions() {
        rankingList.querySelectorAll('li').forEach((li, index) => {
            li.dataset.position = index + 1;
            li.textContent = `${li.dataset.position}. ${li.dataset.name}`;
            addMoveUpButton(li);
        });
    }

    // Função para habilitar arrastar e soltar
    function addDragAndDrop() {
        const draggables = rankingList.querySelectorAll('li');
        draggables.forEach(draggable => {
            draggable.setAttribute('draggable', true);
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
            });
            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
                saveRanking();
                updatePositions();
            });
        });

        rankingList.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(rankingList, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (afterElement == null) {
                rankingList.appendChild(dragging);
            } else {
                rankingList.insertBefore(dragging, afterElement);
            }
        });
    }

    // Função para obter o elemento após o qual soltar
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset)
                {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    
        // Adicionando evento de clique para o modo noturno
        darkModeButton.addEventListener('click', toggleDarkMode);
    
        // Função para alternar entre modo claro e modo noturno
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode'));
        }
    
        // Carregar o estado do modo noturno
        function loadDarkMode() {
            const darkModeEnabled = JSON.parse(localStorage.getItem('dark-mode'));
            if (darkModeEnabled) {
                document.body.classList.add('dark-mode');
            }
        }
    
        // Adicionando evento de clique para limpar ranking
        clearButton.addEventListener('click', clearRanking);
    
        // Função para limpar o ranking
        function clearRanking() {
            rankingList.innerHTML = '';
            localStorage.removeItem('ranking');
        }
    
        // Carregar ranking e modo noturno ao iniciar
        loadRanking();
        loadDarkMode();
        addDragAndDrop();
    
        // Mostrar/ocultar menu dropdown ao clicar no botão MENU
        menuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            menuDropdown.classList.toggle('show');
        });
    
        // Fechar o menu dropdown ao clicar fora dele
        document.addEventListener('click', (event) => {
            if (!menuDropdown.contains(event.target) && !menuButton.contains(event.target)) {
                menuDropdown.classList.remove('show');
            }
        });
    
        // Função para sortear corridas
        sortRaceButton.addEventListener('click', () => {
            const items = [...rankingList.querySelectorAll('li')];
            if (items.length < 2) {
                alert('Você precisa de pelo menos dois pilotos na lista para sortear corridas.');
                return;
            }
    
            // Embaralhar itens
            const shuffled = items.sort(() => 0.5 - Math.random());
    
            // Selecionar pares de pilotos
            const pairs = [];
            for (let i = 0; i < shuffled.length; i += 2) {
                if (i + 1 < shuffled.length) {
                    const pair = `${shuffled[i].dataset.name} VS ${shuffled[i + 1].dataset.name}`;
                    pairs.push(pair);
                }
            }
    
            // Atualizar lista de corridas
            raceList.innerHTML = '';
            pairs.forEach(pair => {
                const li = document.createElement('li');
                li.textContent = pair;
                li.classList.add('center-text'); // Adiciona a classe para centralizar o texto
                raceList.appendChild(li);
            });
    
            // Mostrar modal
            raceModal.style.display = 'block';
        });
    
        // Fechar modal
        closeModals.forEach(closeModal => {
            closeModal.addEventListener('click', () => {
                raceModal.style.display = 'none';
                confirmRemoveModal.style.display = 'none';
                round135Modal.style.display = 'none';
                round246Modal.style.display = 'none';
            });
        });
    
        window.addEventListener('click', (event) => {
            if (event.target == raceModal || event.target == confirmRemoveModal || event.target == round135Modal || event.target == round246Modal) {
                raceModal.style.display = 'none';
                confirmRemoveModal.style.display = 'none';
                round135Modal.style.display = 'none';
                round246Modal.style.display = 'none';
            }
        });
    
        // Confirmar remoção de piloto
        confirmRemoveButton.addEventListener('click', () => {
            const name = document.getElementById('removeName').textContent;
            const liToRemove = [...rankingList.querySelectorAll('li')].find(li => li.dataset.name === name);
            rankingList.removeChild(liToRemove);
            saveRanking();
            confirmRemoveModal.style.display = 'none';
    
            // Após a remoção, atualizar posições e adicionar novamente o evento de clique para remover piloto
            updatePositions();
            [...rankingList.querySelectorAll('li')].forEach(li => {
                li.addEventListener('click', () => {
                    const name = li.dataset.name;
                    document.getElementById('removeName').textContent = name;
                    confirmRemoveModal.style.display = 'block';
                });
            });
        });
    
        cancelRemoveButton.addEventListener('click', () => {
            confirmRemoveModal.style.display = 'none';
        });
    
        // Mostrar modal de corridas pré-definidas para rodadas 1, 3, 5
        round135Button.addEventListener('click', () => {
            showPredefinedRaces(round135List, [1, 3, 5], true);
            round135Modal.style.display = 'block';
        });
    
        // Mostrar modal de corridas pré-definidas para rodadas 2, 4, 6
        round246Button.addEventListener('click', () =>
            {
                showPredefinedRaces(round246List, [2, 4, 6], false);
                round246Modal.style.display = 'block';
            });
        
            // Função para exibir corridas pré-definidas
            function showPredefinedRaces(listElement, rounds, isOddRound) {
                listElement.innerHTML = '';
                const items = [...rankingList.querySelectorAll('li')];
                if (items.length < 2) {
                    alert('Você precisa de pelo menos dois pilotos na lista para exibir corridas.');
                    return;
                }
        
                // Ordenar itens por posição
                const sortedItems = items.sort((a, b) => parseInt(a.dataset.position) - parseInt(b.dataset.position));
        
                // Selecionar pares de pilotos
                const pairs = [];
                if (isOddRound) {
                    for (let i = 0; i < sortedItems.length; i += 2) {
                        if (i + 1 < sortedItems.length) {
                            pairs.push(`${sortedItems[i].dataset.name} VS ${sortedItems[i + 1].dataset.name}`);
                        } else {
                            pairs.push(`${sortedItems[i].dataset.name} VS não corre`);
                        }
                    }
                } else {
                    for (let i = 1; i < sortedItems.length; i += 2) {
                        if (i + 1 < sortedItems.length) {
                            pairs.push(`${sortedItems[i].dataset.name} VS ${sortedItems[i + 1].dataset.name}`);
                        } else {
                            pairs.push(`${sortedItems[i].dataset.name} VS não corre`);
                        }
                    }
                }
        
                // Exibir pares
                pairs.forEach(pair => {
                    const li = document.createElement('li');
                    li.textContent = pair;
                    li.classList.add('center-text'); // Adiciona a classe para centralizar o texto
                    listElement.appendChild(li);
                });
            }
        
            // Fechar modais das corridas pré-definidas
            closeRound135Modal.addEventListener('click', () => {
                round135Modal.style.display = 'none';
            });
        
            closeRound246Modal.addEventListener('click', () => {
                round246Modal.style.display = 'none';
            });
        
            // Adicionando evento de clique para restaurar o ranking
            restoreButton.addEventListener('click', () => {
                clearRanking();
                fetch('ranking.txt') // Carregar o arquivo ranking.txt
                    .then(response => response.text()) // Obter o texto do arquivo
                    .then(text => {
                        const names = text.trim().split('\n'); // Separar os nomes por quebra de linha
                        rankingList.innerHTML = ''; // Limpar a lista atual
                        names.forEach((name, index) => { // Adicionar os nomes à lista
                            const li = document.createElement('li');
                            li.textContent = `${index + 1}. ${name}`;
                            li.dataset.position = index + 1;
                            li.dataset.name = name;
                            rankingList.appendChild(li);
                            addMoveUpButton(li);
                            addDragAndDrop();
                            li.addEventListener('click', () => { // Adicionar evento de clique para remover piloto
                                document.getElementById('removeName').textContent = name;
                                confirmRemoveModal.style.display = 'block';
                            });
                        });
                        saveRanking(); // Salvar o ranking atualizado
                    })
                    .catch(error => console.error('Erro ao carregar arquivo:', error)); // Lidar com erros de carregamento
            });
    
            // Adicionando evento de clique para o botão do site no menu
            siteButton.addEventListener('click', () => {
                window.location.href = 'https://www.youtube.com/watch?v=jWvb60LYkcU'; // Substitua pela URL do seu site
            });
        });
    
