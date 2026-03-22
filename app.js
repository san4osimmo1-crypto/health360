document.addEventListener('DOMContentLoaded', () => {
    
    // --- ДАННЫЕ СИСТЕМ (ОРГАНОВ) ---
    // Координаты (x, y) в ПРОЦЕНТАХ от левого верхнего угла картинки
    const organsData = {
        brain: { 
            id: 'brain', x: 168, y: 180, 
            name: 'Мозг / Нервная система', 
            icon: 'M -8,5 C -10,0 -8,-7 0,-10 C 8,-7 10,0 8,5 C 6,10 -6,10 -8,5 Z', // Вектор мозга
            tests: 'Мелатонин, Серотонин, Витамин B12', 
            links: 'Нервная система → влияет на → Сон → связано с → ЖКТ и Надпочечники', 
            pattern: 'Стресс → Снижение фокуса → Выгорание', 
            connectsTo: ['gut', 'adrenals'] 
        },
        thyroid: { 
            id: 'thyroid', x: 160, y: 200, 
            name: 'Щитовидная железа', 
            icon: 'M -7,-4 C -4,-6 0,-4 0,-2 C 0,0 -3,2 -7,0 Z M 7,-4 C 4,-6 0,-4 0,-2 C 0,0 3,2 7,0 Z', // Вектор щитовидки
            tests: 'ТТГ, Т3 св., Т4 св., Антитела', 
            links: 'Щитовидная железа → влияет на → Энергия → связано с → Надпочечники', 
            pattern: 'Скрытый гипотиреоз → Туман в голове → Набор веса', 
            connectsTo: ['heart', 'brain', 'adrenals'] 
        },
        heart: { 
            id: 'heart', x: 180, y: 240, 
            name: 'Сердечно-сосудистая', 
            icon: 'M 0,-6 C 2,-6 5,-4 5,0 C 5,5 1,8 0,10 C -1,8 -5,5 -5,0 C -5,-4 -2,-6 0,-6 Z', // Вектор сердца
            tests: 'Гомоцистеин, Липидограмма, СРБ', 
            links: 'Сердце → влияет на → Кровообращение → связано с → Мозг', 
            pattern: 'Скрытое воспаление → Риск тромбоза', 
            connectsTo: ['brain'] 
        },
        adrenals: { 
            id: 'adrenals', x: 135, y: 300, 
            name: 'Надпочечники', 
            icon: 'M -8,0 C -10,0 -12,-2 -12,-4 L -8,-6 Z M 8,0 C 10,0 12,-2 12,-4 L 8,-6 Z', // Вектор надпочечников
            tests: 'Кортизол (в слюне), ДГЭА-с', 
            links: 'Надпочечники → влияют на → Стресс → связано с → ЖКТ и Щитовидка', 
            pattern: 'Высокий кортизол → Инсулинорезистентность', 
            connectsTo: ['thyroid', 'gut'] 
        },
        gut: { 
            id: 'gut', x: 160, y: 320, 
            name: 'ЖКТ и Микробиом', 
            icon: 'M -12,0 L 12,0 C 14,0 14,4 12,4 L -12,4 C -14,4 -14,8 -12,8 L 12,8', // Вектор кишечника
            tests: 'ХМС по Осипову, Копрограмма', 
            links: 'Кишечник → влияет на → Иммунитет → связано с → Мозг', 
            pattern: 'Дисбиоз → Дефицит витаминов → Усталость', 
            connectsTo: ['brain', 'thyroid'] 
        }
    };

    let isAfterMode = false;
    
    const nodesContainer = document.getElementById('nodes-container');
    const linesLayer = document.getElementById('lines-layer');
    const tooltip = document.getElementById('organ-tooltip');
    
    // Перемещаем тултип в body, если его там еще нет
    if(tooltip.parentElement !== document.body) {
        document.body.appendChild(tooltip); 
    }

    const ttTitle = document.getElementById('tt-title');
    const ttTests = document.getElementById('tt-tests');
    const ttLinksWrapper = document.getElementById('tt-links-wrapper');
    const ttLinks = document.getElementById('tt-links');
    const ttPatternWrapper = document.getElementById('tt-pattern-wrapper');
    const ttPattern = document.getElementById('tt-pattern');

    // Очищаем контейнер перед отрисовкой (на случай двойного вызова)
    nodesContainer.innerHTML = '';

    // --- ОТРИСОВКА ОРГАНОВ ВМЕСТО ТОЧЕК ---
    Object.values(organsData).forEach(organ => {
        // Создаем контейнер-обертку для позиционирования
        const wrapper = document.createElement('div');
        wrapper.className = 'absolute transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer organ-wrapper';
        wrapper.style.left = `${organ.x}%`;
        wrapper.style.top = `${organ.y}%`;
        wrapper.dataset.id = organ.id;

        // Создаем SVG с иконкой органа
        wrapper.innerHTML = `
            <svg width="40" height="40" viewBox="-20 -20 40 40" class="overflow-visible">
                <circle cx="0" cy="0" r="20" fill="transparent" />
                <path d="${organ.icon}" fill="#94a3b8" class="organ-icon transition-all duration-300" />
            </svg>
        `;

        wrapper.addEventListener('mouseenter', (e) => handleMouseEnter(e, organ));
        wrapper.addEventListener('mouseleave', handleMouseLeave);
        
        nodesContainer.appendChild(wrapper);
    });

    function handleMouseEnter(e, organ) {
        const wrapper = e.currentTarget;
        const icon = wrapper.querySelector('.organ-icon');
        const rect = wrapper.getBoundingClientRect();

        // Показываем тултип
        tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
        tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
        tooltip.style.opacity = '1';
        
        ttTitle.textContent = organ.name;
        ttTests.textContent = organ.tests;
        
        if (isAfterMode) {
            // Подсветка органа белым при наведении в режиме ПОСЛЕ
            icon.setAttribute('fill', '#ffffff');
            icon.style.filter = 'drop-shadow(0 0 8px #ffffff)';
            
            ttLinksWrapper.classList.remove('hidden');
            ttPatternWrapper.classList.remove('hidden');
            ttLinks.textContent = organ.links;
            ttPattern.textContent = organ.pattern;
            
            drawConnections(organ);
        } else {
            // В режиме ДО орган чуть светлеет при наведении
            icon.setAttribute('fill', '#cbd5e1');
            ttLinksWrapper.classList.add('hidden');
            ttPatternWrapper.classList.add('hidden');
        }
    }

    function handleMouseLeave(e) {
        tooltip.style.opacity = '0'; 
        linesLayer.innerHTML = '';   
        
        const wrapper = e.currentTarget;
        const icon = wrapper.querySelector('.organ-icon');
        
        // Возвращаем цвет
        if (isAfterMode) {
            icon.setAttribute('fill', '#22d3ee'); // Возвращаем бирюзовый
            icon.style.filter = ''; // Анимация пульсации вернется из CSS
        } else {
            icon.setAttribute('fill', '#94a3b8'); // Возвращаем серый
        }
    }

    function drawConnections(sourceOrgan) {
        linesLayer.innerHTML = ''; 
        
        sourceOrgan.connectsTo.forEach(targetId => {
            const targetOrgan = organsData[targetId];
            if (!targetOrgan) return;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            
            // Координаты в процентах для линий
            line.setAttribute('x1', `${sourceOrgan.x}`);
            line.setAttribute('y1', `${sourceOrgan.y}`);
            line.setAttribute('x2', `${targetOrgan.x}`);
            line.setAttribute('y2', `${targetOrgan.y}`);
            
            line.setAttribute('stroke', '#00C897'); 
            line.setAttribute('stroke-width', '0.5'); 
            line.setAttribute('stroke-dasharray', '1 1'); 
            
            linesLayer.appendChild(line);
        });
    }

    const btnBefore = document.getElementById('btn-before');
    const btnAfter = document.getElementById('btn-after');
    const infoTitle = document.getElementById('info-title');
    const infoList = document.getElementById('info-list');

    function updatePanelText() {
        if (isAfterMode) {
            infoTitle.innerHTML = '<span class="w-3 h-3 rounded-full bg-accent inline-block mr-2 shadow-[0_0_8px_#00C897]"></span>Система Health 360';
            infoList.innerHTML = `
                <li class="flex items-start"><span class="text-accent mr-2 font-bold">✓</span> Все показатели связаны в единую сеть</li>
                <li class="flex items-start"><span class="text-accent mr-2 font-bold">✓</span> Видны причинно-следственные связи</li>
                <li class="flex items-start"><span class="text-accent mr-2 font-bold">✓</span> Персональные рекомендации</li>
            `;
        } else {
            infoTitle.innerHTML = '<span class="w-3 h-3 rounded-full bg-slate-500 inline-block mr-2"></span>Традиционный подход';
            infoList.innerHTML = `
                <li class="flex items-start"><span class="text-slate-500 mr-2 font-bold">✕</span> Разрозненные анализы</li>
                <li class="flex items-start"><span class="text-slate-500 mr-2 font-bold">✕</span> Никаких связей</li>
                <li class="flex items-start"><span class="text-slate-500 mr-2 font-bold">✕</span> Общие рекомендации</li>
            `;
        }
    }

    function toggleMode(mode) {
        const icons = document.querySelectorAll('.organ-icon');

        if (mode === 'after') {
            isAfterMode = true;
            btnAfter.classList.replace('text-slate-400', 'text-white');
            btnAfter.classList.replace('bg-transparent', 'bg-primary');
            btnBefore.classList.replace('bg-slate-700', 'bg-transparent');
            btnBefore.classList.replace('text-white', 'text-slate-400');

            // Оживляем иконки
            icons.forEach(icon => {
                icon.setAttribute('fill', '#22d3ee');
                // Добавляем класс для пульсации (нужно добавить его в HTML CSS)
                icon.classList.add('dot-active'); 
            });
        } else {
            isAfterMode = false;
            btnBefore.classList.replace('text-slate-400', 'text-white');
            btnBefore.classList.replace('bg-transparent', 'bg-slate-700');
            btnAfter.classList.replace('bg-primary', 'bg-transparent');
            btnAfter.classList.replace('text-white', 'text-slate-400');

            // Усыпляем иконки
            icons.forEach(icon => {
                icon.setAttribute('fill', '#94a3b8');
                icon.classList.remove('dot-active');
            });
            linesLayer.innerHTML = ''; 
        }
        updatePanelText();
    }

    updatePanelText();
    btnBefore.addEventListener('click', () => toggleMode('before'));
    btnAfter.addEventListener('click', () => toggleMode('after'));


    // --- ИНСТРУМЕНТ ДЛЯ ПОИСКА КООРДИНАТ В ПРОЦЕНТАХ ---
    // (Удали этот блок после того, как расставишь все органы)
    const container = document.getElementById('body-container');
    if(container) {
        container.addEventListener('click', function(e) {
            const rect = container.getBoundingClientRect();
            // Вычисляем проценты
            let xPercent = ((e.clientX - rect.left) / rect.width) * 100;
            let yPercent = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Округляем до 1 знака после запятой для точности
            xPercent = xPercent.toFixed(1);
            yPercent = yPercent.toFixed(1);
            
            alert(`Координаты для app.js:\nx: ${xPercent},\ny: ${yPercent}`);
            console.log(`x: ${xPercent}, y: ${yPercent}`);
        });
    }
});