const PptxGenJS = require('pptxgenjs');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ExportService {
    constructor() {
        this.outputDir = path.join(__dirname, '../exports');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async exportToPPTX(presentation) {
        try {
            const pptx = new PptxGenJS();
            
            // Configure presentation properties
            pptx.author = 'Gerador Inteligente de Apresentações';
            pptx.company = 'AI Presentations';
            pptx.title = presentation.title;
            pptx.subject = presentation.theme;

            // Add slides
            presentation.slides.forEach((slide, index) => {
                const pptxSlide = pptx.addSlide();
                
                // Configure slide layout
                pptxSlide.background = { color: 'FFFFFF' };
                
                // Add title
                pptxSlide.addText(slide.title, {
                    x: 0.5,
                    y: 0.5,
                    w: 9,
                    h: 1,
                    fontSize: index === 0 ? 36 : 28,
                    bold: true,
                    color: '3B82F6',
                    align: 'center'
                });

                // Add content
                if (Array.isArray(slide.content)) {
                    const contentText = slide.content.map(item => `• ${item}`).join('\n');
                    pptxSlide.addText(contentText, {
                        x: 0.5,
                        y: 2,
                        w: 9,
                        h: 5,
                        fontSize: 18,
                        color: '333333',
                        valign: 'top'
                    });
                } else {
                    pptxSlide.addText(slide.content, {
                        x: 0.5,
                        y: 2,
                        w: 9,
                        h: 5,
                        fontSize: 18,
                        color: '333333',
                        valign: 'top'
                    });
                }

                // Add slide number
                pptxSlide.addText(`${index + 1} / ${presentation.slides.length}`, {
                    x: 8.5,
                    y: 7,
                    w: 1,
                    h: 0.3,
                    fontSize: 12,
                    color: '666666',
                    align: 'right'
                });
            });

            // Generate filename
            const filename = `${this.sanitizeFilename(presentation.title)}_${Date.now()}.pptx`;
            const filepath = path.join(this.outputDir, filename);

            // Save file
            await pptx.writeFile({ fileName: filepath });
            
            return {
                success: true,
                filename: filename,
                filepath: filepath,
                size: fs.statSync(filepath).size
            };

        } catch (error) {
            console.error('Erro ao exportar para PPTX:', error);
            throw new Error('Falha na exportação para PPTX');
        }
    }

    async exportToPDF(presentation) {
        try {
            // Generate HTML content for PDF
            const htmlContent = this.generateHTMLForPDF(presentation);
            
            // Launch Puppeteer
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            const page = await browser.newPage();
            
            // Set content
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            
            // Generate filename
            const filename = `${this.sanitizeFilename(presentation.title)}_${Date.now()}.pdf`;
            const filepath = path.join(this.outputDir, filename);
            
            // Generate PDF
            await page.pdf({
                path: filepath,
                format: 'A4',
                landscape: true,
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });
            
            await browser.close();
            
            return {
                success: true,
                filename: filename,
                filepath: filepath,
                size: fs.statSync(filepath).size
            };

        } catch (error) {
            console.error('Erro ao exportar para PDF:', error);
            throw new Error('Falha na exportação para PDF');
        }
    }

    generateHTMLForPDF(presentation) {
        const slidesHTML = presentation.slides.map((slide, index) => {
            const isFirstSlide = index === 0;
            const contentHTML = Array.isArray(slide.content) 
                ? slide.content.map(item => `<li>${item}</li>`).join('')
                : `<p>${slide.content}</p>`;

            return `
                <div class="slide ${isFirstSlide ? 'title-slide' : ''}">
                    <div class="slide-number">${index + 1} / ${presentation.slides.length}</div>
                    <h${isFirstSlide ? '1' : '2'}>${slide.title}</h${isFirstSlide ? '1' : '2'}>
                    <div class="content">
                        ${Array.isArray(slide.content) ? `<ul>${contentHTML}</ul>` : contentHTML}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${presentation.title}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    
                    .slide {
                        width: 100%;
                        height: 100vh;
                        padding: 60px;
                        page-break-after: always;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    
                    .slide:last-child {
                        page-break-after: avoid;
                    }
                    
                    .title-slide {
                        background: linear-gradient(135deg, #3B82F6, #1E40AF);
                        color: white;
                        text-align: center;
                    }
                    
                    .title-slide h1 {
                        font-size: 3em;
                        margin-bottom: 0.5em;
                        color: white;
                    }
                    
                    h1, h2 {
                        color: #3B82F6;
                        margin-bottom: 1em;
                        text-align: center;
                    }
                    
                    h2 {
                        font-size: 2.5em;
                    }
                    
                    .content {
                        font-size: 1.4em;
                        line-height: 1.8;
                    }
                    
                    ul {
                        list-style: none;
                        padding: 0;
                    }
                    
                    li {
                        margin: 1em 0;
                        padding-left: 2em;
                        position: relative;
                    }
                    
                    li:before {
                        content: "▶";
                        color: #3B82F6;
                        position: absolute;
                        left: 0;
                        font-size: 1.2em;
                    }
                    
                    .slide-number {
                        position: absolute;
                        top: 30px;
                        right: 30px;
                        background: rgba(59, 130, 246, 0.1);
                        padding: 10px 15px;
                        border-radius: 5px;
                        font-size: 0.9em;
                        color: #3B82F6;
                    }
                    
                    .title-slide .slide-number {
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                    }
                </style>
            </head>
            <body>
                ${slidesHTML}
            </body>
            </html>
        `;
    }

    sanitizeFilename(filename) {
        return filename
            .replace(/[^a-z0-9]/gi, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .toLowerCase();
    }

    async getExportedFile(filename) {
        const filepath = path.join(this.outputDir, filename);
        
        if (!fs.existsSync(filepath)) {
            throw new Error('Arquivo não encontrado');
        }
        
        return {
            filepath: filepath,
            buffer: fs.readFileSync(filepath),
            size: fs.statSync(filepath).size
        };
    }

    async cleanupOldFiles(maxAgeHours = 24) {
        try {
            const files = fs.readdirSync(this.outputDir);
            const now = Date.now();
            const maxAge = maxAgeHours * 60 * 60 * 1000;

            for (const file of files) {
                const filepath = path.join(this.outputDir, file);
                const stats = fs.statSync(filepath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filepath);
                    console.log(`Arquivo antigo removido: ${file}`);
                }
            }
        } catch (error) {
            console.error('Erro na limpeza de arquivos:', error);
        }
    }
}

module.exports = ExportService;

