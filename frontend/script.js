// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const presentationForm = document.getElementById('presentationForm');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const slidesPreview = document.getElementById('slidesPreview');
const generateBtn = document.getElementById('generateBtn');
const editBtn = document.getElementById('editBtn');
const exportPptxBtn = document.getElementById('exportPptxBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');

// Global variables
let currentPresentation = null;

// Event Listeners
presentationForm.addEventListener('submit', handleFormSubmit);
editBtn.addEventListener('click', toggleEditMode);
exportPptxBtn.addEventListener('click', () => exportPresentation('pptx'));
exportPdfBtn.addEventListener('click', () => exportPresentation('pdf'));

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(presentationForm);
    const theme = formData.get('theme');
    const slidesCount = parseInt(formData.get('slidesCount'));
    
    if (!theme.trim()) {
        alert('Por favor, digite um tema para a apresentação.');
        return;
    }
    
    try {
        showLoading();
        const presentation = await generatePresentation(theme, slidesCount);
        showResults(presentation);
    } catch (error) {
        console.error('Erro ao gerar apresentação:', error);
        alert('Erro ao gerar apresentação. Tente novamente.');
        hideLoading();
    }
}

// Generate presentation via API
async function generatePresentation(theme, slidesCount) {
    const response = await fetch(`${API_BASE_URL}/presentation/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme, slidesCount })
    });
    
    if (!response.ok) {
        throw new Error('Falha na geração da apresentação');
    }
    
    return await response.json();
}

// Show loading state
function showLoading() {
    presentationForm.parentElement.style.display = 'none';
    loadingSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
    presentationForm.parentElement.style.display = 'block';
    loadingSection.classList.add('hidden');
}

// Show results
function showResults(presentation) {
    currentPresentation = presentation.presentation || presentation;
    hideLoading();
    resultsSection.classList.remove('hidden');
    renderSlidesPreview(currentPresentation.slides);
    
    // Store presentation data for Reveal.js page
    localStorage.setItem('currentPresentation', JSON.stringify(currentPresentation));
    
    // Add view presentation button
    addViewPresentationButton();
}

// Add view presentation button
function addViewPresentationButton() {
    const existingBtn = document.getElementById('viewPresentationBtn');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    const buttonContainer = document.querySelector('#resultsSection .flex.space-x-3');
    const viewBtn = document.createElement('button');
    viewBtn.id = 'viewPresentationBtn';
    viewBtn.className = 'bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors';
    viewBtn.innerHTML = '<i class="fas fa-play mr-2"></i>Apresentar';
    viewBtn.addEventListener('click', viewPresentation);
    
    buttonContainer.insertBefore(viewBtn, buttonContainer.firstChild);
}

// View presentation in Reveal.js
function viewPresentation() {
    if (!currentPresentation) {
        alert('Nenhuma apresentação para visualizar.');
        return;
    }
    
    // Open presentation page
    window.open('presentation.html', '_blank');
}

// Render slides preview
function renderSlidesPreview(slides) {
    if (!slides || slides.length === 0) {
        slidesPreview.innerHTML = '<p class="text-gray-500">Nenhum slide gerado.</p>';
        return;
    }
    
    const slidesHTML = slides.map((slide, index) => `
        <div class="slide-preview bg-white border rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-3">
                <h4 class="text-lg font-semibold text-gray-800">
                    <span class="bg-primary text-white px-2 py-1 rounded text-sm mr-2">${index + 1}</span>
                    ${slide.title}
                </h4>
                <button class="edit-slide-btn text-gray-500 hover:text-primary" data-slide-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="slide-content text-gray-600" data-slide-index="${index}">
                ${formatSlideContent(slide.content)}
            </div>
        </div>
    `).join('');
    
    slidesPreview.innerHTML = slidesHTML;
    
    // Add event listeners for individual slide editing
    document.querySelectorAll('.edit-slide-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const slideIndex = parseInt(e.target.closest('.edit-slide-btn').dataset.slideIndex);
            editSlide(slideIndex);
        });
    });
}

// Format slide content for display
function formatSlideContent(content) {
    if (Array.isArray(content)) {
        return content.map(item => `<p class="mb-2">• ${item}</p>`).join('');
    }
    return `<p>${content}</p>`;
}

// Toggle edit mode
function toggleEditMode() {
    if (!currentPresentation) {
        alert('Nenhuma apresentação para editar.');
        return;
    }
    
    // Save current presentation and open editor
    localStorage.setItem('currentPresentation', JSON.stringify(currentPresentation));
    window.open('editor.html', '_blank');
}

// Enable edit mode
function enableEditMode() {
    document.querySelectorAll('.slide-content').forEach(content => {
        const slideIndex = content.dataset.slideIndex;
        const slide = currentPresentation.slides[slideIndex];
        
        content.innerHTML = `
            <textarea class="w-full p-3 border rounded-lg resize-none" rows="4" data-slide-index="${slideIndex}">
                ${Array.isArray(slide.content) ? slide.content.join('\n') : slide.content}
            </textarea>
        `;
    });
}

// Save edits
function saveEdits() {
    document.querySelectorAll('textarea[data-slide-index]').forEach(textarea => {
        const slideIndex = parseInt(textarea.dataset.slideIndex);
        const newContent = textarea.value.trim().split('\n').filter(line => line.trim());
        currentPresentation.slides[slideIndex].content = newContent;
    });
    
    renderSlidesPreview(currentPresentation.slides);
}

// Edit individual slide
function editSlide(slideIndex) {
    const slide = currentPresentation.slides[slideIndex];
    const newTitle = prompt('Título do slide:', slide.title);
    const newContent = prompt('Conteúdo do slide (separe itens com quebras de linha):', 
        Array.isArray(slide.content) ? slide.content.join('\n') : slide.content);
    
    if (newTitle !== null) {
        slide.title = newTitle;
    }
    
    if (newContent !== null) {
        slide.content = newContent.split('\n').filter(line => line.trim());
    }
    
    renderSlidesPreview(currentPresentation.slides);
}

// Export presentation
async function exportPresentation(format) {
    if (!currentPresentation) {
        alert('Nenhuma apresentação para exportar.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/presentation/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                presentation: currentPresentation,
                format: format
            })
        });
        
        if (!response.ok) {
            throw new Error('Falha na exportação');
        }
        
        // Download the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `apresentacao.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
    } catch (error) {
        console.error('Erro na exportação:', error);
        alert('Erro ao exportar apresentação. Tente novamente.');
    }
}

// Initialize Reveal.js presentation
function initializeRevealPresentation(slides) {
    const revealContainer = document.createElement('div');
    revealContainer.className = 'reveal';
    revealContainer.innerHTML = `
        <div class="slides">
            ${slides.map(slide => `
                <section>
                    <h2>${slide.title}</h2>
                    <div class="slide-content">
                        ${formatSlideContent(slide.content)}
                    </div>
                </section>
            `).join('')}
        </div>
    `;
    
    return revealContainer;
}

// Utility function to show notifications
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

