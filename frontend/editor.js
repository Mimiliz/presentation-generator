// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const slidesList = document.getElementById('slidesList');
const slideEditor = document.getElementById('slideEditor');
const noSlideSelected = document.getElementById('noSlideSelected');
const slideEditForm = document.getElementById('slideEditForm');
const slideTitle = document.getElementById('slideTitle');
const slideContent = document.getElementById('slideContent');
const presentationTitle = document.getElementById('presentationTitle');
const presentationTheme = document.getElementById('presentationTheme');
const slidesCount = document.getElementById('slidesCount');

// Buttons
const addSlideBtn = document.getElementById('addSlideBtn');
const duplicateSlideBtn = document.getElementById('duplicateSlideBtn');
const deleteSlideBtn = document.getElementById('deleteSlideBtn');
const saveBtn = document.getElementById('saveBtn');
const previewBtn = document.getElementById('previewBtn');
const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const aiPrompt = document.getElementById('aiPrompt');

// Global variables
let currentPresentation = null;
let currentSlideIndex = -1;
let sortable = null;

// Event Listeners
addSlideBtn.addEventListener('click', addNewSlide);
duplicateSlideBtn.addEventListener('click', duplicateCurrentSlide);
deleteSlideBtn.addEventListener('click', deleteCurrentSlide);
saveBtn.addEventListener('click', savePresentation);
previewBtn.addEventListener('click', previewPresentation);
aiGenerateBtn.addEventListener('click', generateWithAI);
slideTitle.addEventListener('input', updateCurrentSlide);
slideContent.addEventListener('input', updateCurrentSlide);
presentationTitle.addEventListener('input', updatePresentationInfo);

// Initialize editor
function initializeEditor() {
    const storedData = localStorage.getItem('currentPresentation');
    if (storedData) {
        try {
            currentPresentation = JSON.parse(storedData);
            loadPresentation();
        } catch (error) {
            console.error('Erro ao carregar apresentação:', error);
            createNewPresentation();
        }
    } else {
        createNewPresentation();
    }
}

// Create new presentation
function createNewPresentation() {
    currentPresentation = {
        title: 'Nova Apresentação',
        theme: 'Tema Geral',
        slides: [
            {
                title: 'Título da Apresentação',
                content: ['Subtítulo ou descrição', 'Informações adicionais']
            }
        ],
        createdAt: new Date().toISOString()
    };
    loadPresentation();
}

// Load presentation
function loadPresentation() {
    if (!currentPresentation) return;
    
    // Update presentation info
    presentationTitle.value = currentPresentation.title || '';
    presentationTheme.value = currentPresentation.theme || '';
    
    // Render slides list
    renderSlidesList();
    
    // Select first slide
    if (currentPresentation.slides.length > 0) {
        selectSlide(0);
    }
    
    updateSlidesCount();
}

// Render slides list
function renderSlidesList() {
    slidesList.innerHTML = '';
    
    currentPresentation.slides.forEach((slide, index) => {
        const slideElement = createSlideElement(slide, index);
        slidesList.appendChild(slideElement);
    });
    
    // Initialize sortable
    if (sortable) {
        sortable.destroy();
    }
    
    sortable = Sortable.create(slidesList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: function(evt) {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            
            if (oldIndex !== newIndex) {
                // Move slide in array
                const movedSlide = currentPresentation.slides.splice(oldIndex, 1)[0];
                currentPresentation.slides.splice(newIndex, 0, movedSlide);
                
                // Update current slide index
                if (currentSlideIndex === oldIndex) {
                    currentSlideIndex = newIndex;
                } else if (currentSlideIndex > oldIndex && currentSlideIndex <= newIndex) {
                    currentSlideIndex--;
                } else if (currentSlideIndex < oldIndex && currentSlideIndex >= newIndex) {
                    currentSlideIndex++;
                }
                
                renderSlidesList();
                selectSlide(currentSlideIndex);
            }
        }
    });
}

// Create slide element
function createSlideElement(slide, index) {
    const div = document.createElement('div');
    div.className = `slide-preview p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        index === currentSlideIndex ? 'active' : ''
    }`;
    div.dataset.index = index;
    
    div.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-600">Slide ${index + 1}</span>
            <i class="fas fa-grip-vertical text-gray-400"></i>
        </div>
        <h4 class="font-semibold text-gray-800 mb-2 truncate">${slide.title}</h4>
        <div class="text-sm text-gray-600">
            ${Array.isArray(slide.content) ? slide.content.length : 1} ponto(s)
        </div>
    `;
    
    div.addEventListener('click', () => selectSlide(index));
    
    return div;
}

// Select slide
function selectSlide(index) {
    if (index < 0 || index >= currentPresentation.slides.length) return;
    
    currentSlideIndex = index;
    
    // Update UI
    document.querySelectorAll('.slide-preview').forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });
    
    // Show editor
    noSlideSelected.classList.add('hidden');
    slideEditForm.classList.remove('hidden');
    
    // Load slide data
    const slide = currentPresentation.slides[index];
    slideTitle.value = slide.title;
    slideContent.value = Array.isArray(slide.content) 
        ? slide.content.join('\n') 
        : slide.content;
}

// Update current slide
function updateCurrentSlide() {
    if (currentSlideIndex < 0) return;
    
    const slide = currentPresentation.slides[currentSlideIndex];
    slide.title = slideTitle.value;
    slide.content = slideContent.value.split('\n').filter(line => line.trim());
    
    // Update slides list
    renderSlidesList();
    selectSlide(currentSlideIndex);
}

// Add new slide
function addNewSlide() {
    const newSlide = {
        title: `Novo Slide ${currentPresentation.slides.length + 1}`,
        content: ['Ponto principal', 'Detalhes importantes']
    };
    
    currentPresentation.slides.push(newSlide);
    renderSlidesList();
    selectSlide(currentPresentation.slides.length - 1);
    updateSlidesCount();
}

// Duplicate current slide
function duplicateCurrentSlide() {
    if (currentSlideIndex < 0) return;
    
    const currentSlide = currentPresentation.slides[currentSlideIndex];
    const duplicatedSlide = {
        title: currentSlide.title + ' (Cópia)',
        content: [...(Array.isArray(currentSlide.content) ? currentSlide.content : [currentSlide.content])]
    };
    
    currentPresentation.slides.splice(currentSlideIndex + 1, 0, duplicatedSlide);
    renderSlidesList();
    selectSlide(currentSlideIndex + 1);
    updateSlidesCount();
}

// Delete current slide
function deleteCurrentSlide() {
    if (currentSlideIndex < 0 || currentPresentation.slides.length <= 1) {
        alert('Não é possível excluir o último slide.');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este slide?')) {
        currentPresentation.slides.splice(currentSlideIndex, 1);
        
        // Adjust current slide index
        if (currentSlideIndex >= currentPresentation.slides.length) {
            currentSlideIndex = currentPresentation.slides.length - 1;
        }
        
        renderSlidesList();
        selectSlide(currentSlideIndex);
        updateSlidesCount();
    }
}

// Update presentation info
function updatePresentationInfo() {
    currentPresentation.title = presentationTitle.value;
    updateSlidesCount();
}

// Update slides count
function updateSlidesCount() {
    slidesCount.textContent = currentPresentation.slides.length;
}

// Save presentation
function savePresentation() {
    localStorage.setItem('currentPresentation', JSON.stringify(currentPresentation));
    showNotification('Apresentação salva com sucesso!', 'success');
}

// Preview presentation
function previewPresentation() {
    savePresentation();
    window.open('presentation.html', '_blank');
}

// Generate with AI
async function generateWithAI() {
    const prompt = aiPrompt.value.trim();
    if (!prompt) {
        alert('Digite uma instrução para a IA.');
        return;
    }
    
    if (currentSlideIndex < 0) {
        alert('Selecione um slide para editar.');
        return;
    }
    
    try {
        aiGenerateBtn.disabled = true;
        aiGenerateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Gerando...';
        
        const response = await fetch(`${API_BASE_URL}/presentation/generate-slide`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: slideTitle.value,
                context: `${currentPresentation.theme}. Instrução: ${prompt}`
            })
        });
        
        if (!response.ok) {
            throw new Error('Falha na geração de conteúdo');
        }
        
        const result = await response.json();
        
        if (result.success && result.slide) {
            slideTitle.value = result.slide.title;
            slideContent.value = Array.isArray(result.slide.content) 
                ? result.slide.content.join('\n') 
                : result.slide.content;
            
            updateCurrentSlide();
            aiPrompt.value = '';
            showNotification('Conteúdo gerado com sucesso!', 'success');
        }
        
    } catch (error) {
        console.error('Erro ao gerar conteúdo:', error);
        showNotification('Erro ao gerar conteúdo. Tente novamente.', 'error');
    } finally {
        aiGenerateBtn.disabled = false;
        aiGenerateBtn.innerHTML = '<i class="fas fa-magic mr-1"></i>Gerar';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        switch(event.key) {
            case 's':
                event.preventDefault();
                savePresentation();
                break;
            case 'n':
                event.preventDefault();
                addNewSlide();
                break;
            case 'd':
                event.preventDefault();
                duplicateCurrentSlide();
                break;
        }
    }
    
    // Delete key
    if (event.key === 'Delete' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        deleteCurrentSlide();
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeEditor);

