// Хранилище всех виджетов на холсте
let widgets = [];
let selectedWidget = null;
let widgetCounter = 0;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initializeDragAndDrop();
    setupEventListeners();
    loadWidgetsFromStorage();
});

// Настройка drag and drop для виджетов из панели
function initializeDragAndDrop() {
    const widgetItems = document.querySelectorAll('.widget-item');
    
    widgetItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.type);
            e.dataTransfer.effectAllowed = 'copy';
        });
        
        item.setAttribute('draggable', 'true');
    });
    
    const canvas = document.getElementById('designCanvas');
    
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });
    
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const widgetType = e.dataTransfer.getData('text/plain');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        createWidget(widgetType, x, y);
    });
}

// Создание нового виджета
function createWidget(type, x, y) {
    const id = `widget_${widgetCounter++}`;
    const defaultProperties = getDefaultProperties(type);
    
    const widget = {
        id: id,
        type: type,
        properties: {
            ...defaultProperties,
            x: Math.max(10, x),
            y: Math.max(10, y),
            width: defaultProperties.width || 100,
            height: defaultProperties.height || 30
        }
    };
    
    widgets.push(widget);
    renderWidget(widget);
    saveWidgetsToStorage();
}

// Получение свойств по умолчанию для каждого типа виджета
function getDefaultProperties(type) {
    const defaults = {
        Button: { text: 'Button', bg: '#f0f0f0', fg: '#000000', font: 'Arial', font_size: 10, width: 100, height: 30 },
        Label: { text: 'Label', bg: '#ffffff', fg: '#000000', font: 'Arial', font_size: 10, width: 100, height: 25 },
        Entry: { bg: '#ffffff', fg: '#000000', width: 120, height: 25 },
        Frame: { bg: '#f8f9fa', width: 150, height: 100 },
        Canvas: { bg: '#ffffff', width: 200, height: 150 },
        Listbox: { width: 120, height: 100 },
        Checkbutton: { text: 'Checkbox', bg: '#ffffff', width: 100, height: 25 },
        Radiobutton: { text: 'Radio', bg: '#ffffff', width: 100, height: 25 }
    };
    
    return defaults[type] || { text: type, width: 100, height: 30 };
}

// Отрисовка виджета на холсте
function renderWidget(widget) {
    const canvas = document.getElementById('designCanvas');
    let widgetElement = document.getElementById(widget.id);
    
    if (!widgetElement) {
        widgetElement = document.createElement('div');
        widgetElement.id = widget.id;
        widgetElement.className = 'canvas-widget';
        canvas.appendChild(widgetElement);
        
        // Добавляем обработчики для выделения
        widgetElement.addEventListener('click', (e) => {
            e.stopPropagation();
            selectWidget(widget.id);
        });
        
        // Добавляем обработчик для изменения размера
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        widgetElement.appendChild(resizeHandle);
        
        // Инициализируем drag для перемещения
        initDragWidget(widgetElement, widget);
        initResizeWidget(resizeHandle, widgetElement, widget);
    }
    
    updateWidgetElement(widgetElement, widget);
}

// Обновление внешнего вида виджета
function updateWidgetElement(element, widget) {
    const props = widget.properties;
    
    element.style.left = `${props.x}px`;
    element.style.top = `${props.y}px`;
    element.style.width = `${props.width}px`;
    element.style.height = `${props.height}px`;
    
    // Стилизация в зависимости от типа
    switch(widget.type) {
        case 'Button':
            element.style.background = props.bg || '#f0f0f0';
            element.style.color = props.fg || '#000000';
            element.style.fontFamily = props.font || 'Arial';
            element.style.fontSize = `${props.font_size || 10}px`;
            element.style.border = '1px solid #ccc';
            element.style.borderRadius = '3px';
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
            element.textContent = props.text || 'Button';
            break;
            
        case 'Label':
            element.style.background = props.bg || '#ffffff';
            element.style.color = props.fg || '#000000';
            element.style.fontFamily = props.font || 'Arial';
            element.style.fontSize = `${props.font_size || 10}px`;
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.textContent = props.text || 'Label';
            break;
            
        case 'Entry':
            element.style.background = props.bg || '#ffffff';
            element.style.color = props.fg || '#000000';
            element.style.border = '1px solid #ccc';
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.innerHTML = '<input type="text" style="width:100%; border:none; background:transparent;" placeholder="Enter text">';
            break;
            
        case 'Frame':
            element.style.background = props.bg || '#f8f9fa';
            element.style.border = '1px solid #ddd';
            element.style.display = 'block';
            element.textContent = '';
            break;
            
        case 'Canvas':
            element.style.background = props.bg || '#ffffff';
            element.style.border = '1px solid #ccc';
            element.style.display = 'block';
            element.textContent = '';
            break;
            
        case 'Listbox':
            element.style.background = '#ffffff';
            element.style.border = '1px solid #ccc';
            element.style.overflow = 'auto';
            element.innerHTML = '<div>Item 1</div><div>Item 2</div><div>Item 3</div>';
            break;
            
        case 'Checkbutton':
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.innerHTML = `<input type="checkbox" style="margin-right:5px;"> ${props.text || 'Checkbox'}`;
            break;
            
        case 'Radiobutton':
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.innerHTML = `<input type="radio" name="radio_group" style="margin-right:5px;"> ${props.text || 'Radio'}`;
            break;
    }
}

// Инициализация перемещения виджета
function initDragWidget(element, widget) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    element.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = widget.properties.x;
        initialTop = widget.properties.y;
        
        element.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        widget.properties.x = initialLeft + dx;
        widget.properties.y = initialTop + dy;
        
        element.style.left = `${widget.properties.x}px`;
        element.style.top = `${widget.properties.y}px`;
        
        if (selectedWidget && selectedWidget.id === widget.id) {
            updatePropertiesPanel();
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'move';
            saveWidgetsToStorage();
        }
    });
}

// Инициализация изменения размера
function initResizeWidget(handle, element, widget) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    
    handle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = widget.properties.width;
        startHeight = widget.properties.height;
        
        e.stopPropagation();
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        widget.properties.width = Math.max(30, startWidth + dx);
        widget.properties.height = Math.max(20, startHeight + dy);
        
        element.style.width = `${widget.properties.width}px`;
        element.style.height = `${widget.properties.height}px`;
        
        if (selectedWidget && selectedWidget.id === widget.id) {
            updatePropertiesPanel();
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            saveWidgetsToStorage();
        }
    });
}

// Выбор виджета
function selectWidget(widgetId) {
    // Убираем выделение с предыдущего
    if (selectedWidget) {
        const prevElement = document.getElementById(selectedWidget.id);
        if (prevElement) prevElement.classList.remove('selected');
    }
    
    selectedWidget = widgets.find(w => w.id === widgetId);
    
    if (selectedWidget) {
        const element = document.getElementById(selectedWidget.id);
        if (element) element.classList.add('selected');
        updatePropertiesPanel();
    }
}

// Обновление панели свойств
function updatePropertiesPanel() {
    const panel = document.getElementById('propertiesPanel');
    
    if (!selectedWidget) {
        panel.innerHTML = '<p class="no-selection">Выберите виджет для редактирования</p>';
        return;
    }
    
    const props = selectedWidget.properties;
    let html = '';
    
    // Общие свойства
    html += '<div class="property-group">';
    html += '<label>Координата X:</label>';
    html += `<input type="number" id="prop_x" value="${props.x}" step="1">`;
    html += '</div>';
    
    html += '<div class="property-group">';
    html += '<label>Координата Y:</label>';
    html += `<input type="number" id="prop_y" value="${props.y}" step="1">`;
    html += '</div>';
    
    html += '<div class="property-group">';
    html += '<label>Ширина:</label>';
    html += `<input type="number" id="prop_width" value="${props.width}" step="1">`;
    html += '</div>';
    
    html += '<div class="property-group">';
    html += '<label>Высота:</label>';
    html += `<input type="number" id="prop_height" value="${props.height}" step="1">`;
    html += '</div>';
    
    // Свойства для текстовых виджетов
    if (['Button', 'Label', 'Checkbutton', 'Radiobutton'].includes(selectedWidget.type)) {
        html += '<div class="property-group">';
        html += '<label>Текст:</label>';
        html += `<input type="text" id="prop_text" value="${props.text || ''}">`;
        html += '</div>';
    }
    
    // Цвет фона
    html += '<div class="property-group">';
    html += '<label>Цвет фона:</label>';
    html += `<input type="color" id="prop_bg" value="${props.bg || '#ffffff'}">`;
    html += '</div>';
    
    // Цвет текста
    if (['Button', 'Label', 'Entry'].includes(selectedWidget.type)) {
        html += '<div class="property-group">';
        html += '<label>Цвет текста:</label>';
        html += `<input type="color" id="prop_fg" value="${props.fg || '#000000'}">`;
        html += '</div>';
    }
    
    // Шрифт
    if (['Button', 'Label'].includes(selectedWidget.type)) {
        html += '<div class="property-group">';
        html += '<label>Шрифт:</label>';
        html += `<select id="prop_font">
            <option value="Arial" ${props.font === 'Arial' ? 'selected' : ''}>Arial</option>
            <option value="Times New Roman" ${props.font === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
            <option value="Courier New" ${props.font === 'Courier New' ? 'selected' : ''}>Courier New</option>
        </select>`;
        html += '</div>';
        
        html += '<div class="property-group">';
        html += '<label>Размер шрифта:</label>';
        html += `<input type="number" id="prop_font_size" value="${props.font_size || 10}" min="8" max="72">`;
        html += '</div>';
    }
    
    panel.innerHTML = html;
    
    // Добавляем обработчики изменений
    document.getElementById('prop_x')?.addEventListener('change', (e) => {
        props.x = parseInt(e.target.value);
        updateWidgetDisplay();
    });
    
    document.getElementById('prop_y')?.addEventListener('change', (e) => {
        props.y = parseInt(e.target.value);
        updateWidgetDisplay();
    });
    
    document.getElementById('prop_width')?.addEventListener('change', (e) => {
        props.width = parseInt(e.target.value);
        updateWidgetDisplay();
    });
    
    document.getElementById('prop_height')?.addEventListener('change', (e) => {
        props.height = parseInt(e.target.value);
        updateWidgetDisplay();
    });
    
    document.getElementById('prop_text')?.addEventListener('change', (e) => {
        props.text = e.target.value;
        updateWidgetDisplay();
    });
    
    document.getElementById('prop_bg')?.addEventListener('change', (e) => {
        props.bg = e.target.value;
        updateWidgetDisplay();
    });
    
    document.getElementById('prop_fg')?.addEventListener('change', (e) => {
        props.fg = e.target.value;
        updateWidgetDisplay();
    });
    
    document.getElementById('prop_font')?.addEventListener('change', (e) => {
        props.font = e.target.value;
        updateWidgetDisplay();
    });
    
    document.getElementById('prop_font_size')?.addEventListener('change', (e) => {
        props.font_size = parseInt(e.target.value);
        updateWidgetDisplay();
    });
}

// Обновление отображения виджета
function updateWidgetDisplay() {
    if (selectedWidget) {
        const element = document.getElementById(selectedWidget.id);
        if (element) {
            updateWidgetElement(element, selectedWidget);
        }
        saveWidgetsToStorage();
    }
}

// Сохранение в localStorage
function saveWidgetsToStorage() {
    localStorage.setItem('tkinter_widgets', JSON.stringify(widgets));
}

// Загрузка из localStorage
function loadWidgetsFromStorage() {
    const saved = localStorage.getItem('tkinter_widgets');
    if (saved) {
        widgets = JSON.parse(saved);
        widgetCounter = widgets.length;
        widgets.forEach(widget => renderWidget(widget));
    }
}

// Очистка холста
function clearCanvas() {
    if (confirm('Вы уверены, что хотите очистить весь дизайн?')) {
        widgets = [];
        const canvas = document.getElementById('designCanvas');
        canvas.innerHTML = '';
        selectedWidget = null;
        saveWidgetsToStorage();
        updatePropertiesPanel();
    }
}

// Генерация кода
async function generateCode() {
    try {
        const response = await fetch('/generate_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ widgets: widgets })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const codeOutput = document.getElementById('codeOutput');
            const generatedCode = document.getElementById('generatedCode');
            generatedCode.textContent = data.code;
            codeOutput.classList.remove('hidden');
            
            // Прокручиваем к коду
            codeOutput.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else {
            alert('Ошибка при генерации кода: ' + data.error);
        }
    } catch (error) {
        alert('Ошибка при отправке запроса: ' + error.message);
    }
}

// Копирование кода в буфер обмена
function copyCode() {
    const code = document.getElementById('generatedCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Код скопирован в буфер обмена!');
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    document.getElementById('generateCode').addEventListener('click', generateCode);
    document.getElementById('copyCode')?.addEventListener('click', copyCode);
    document.getElementById('closeCode')?.addEventListener('click', () => {
        document.getElementById('codeOutput').classList.add('hidden');
    });
    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
    
    // Снимаем выделение при клике на холст
    document.getElementById('designCanvas').addEventListener('click', (e) => {
        if (e.target === document.getElementById('designCanvas')) {
            if (selectedWidget) {
                const element = document.getElementById(selectedWidget.id);
                if (element) element.classList.remove('selected');
                selectedWidget = null;
                updatePropertiesPanel();
            }
        }
    });
}
