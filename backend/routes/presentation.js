const express = require('express');
const router = express.Router();
const OpenAIService = require('../services/openaiService');
const ExportService = require('../services/exportService');

const openaiService = new OpenAIService();
const exportService = new ExportService();

router.post('/generate', async (req, res) => {
    try {
        const { theme, slidesCount } = req.body;
        
        // Validação
        if (!theme || !slidesCount) {
            return res.status(400).json({ 
                error: 'Tema e número de slides são obrigatórios' 
            });
        }

        if (slidesCount < 3 || slidesCount > 20) {
            return res.status(400).json({ 
                error: 'Número de slides deve estar entre 3 e 20' 
            });
        }

        // Gerar apresentação
        const presentation = await openaiService.generatePresentation(theme, slidesCount);
        
        res.json({
            success: true,
            presentation: presentation
        });
        
    } catch (error) {
        console.error('Erro na rota /generate:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            message: error.message 
        });
    }
});

router.post('/generate-slide', async (req, res) => {
    try {
        const { title, context } = req.body;
        
        if (!title) {
            return res.status(400).json({ 
                error: 'Título do slide é obrigatório' 
            });
        }

        const slide = await openaiService.generateSlideContent(title, context);
        
        res.json({
            success: true,
            slide: slide
        });
        
    } catch (error) {
        console.error('Erro na rota /generate-slide:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            message: error.message 
        });
    }
});

router.post('/export', async (req, res) => {
    try {
        const { presentation, format } = req.body;
        
        if (!presentation || !format) {
            return res.status(400).json({ 
                error: 'Apresentação e formato são obrigatórios' 
            });
        }

        if (!['pptx', 'pdf'].includes(format.toLowerCase())) {
            return res.status(400).json({ 
                error: 'Formato deve ser pptx ou pdf' 
            });
        }

        let result;
        if (format.toLowerCase() === 'pptx') {
            result = await exportService.exportToPPTX(presentation);
        } else {
            result = await exportService.exportToPDF(presentation);
        }

        if (result.success) {
            // Send file
            const fileData = await exportService.getExportedFile(result.filename);
            
            res.setHeader('Content-Type', 
                format.toLowerCase() === 'pptx' 
                    ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                    : 'application/pdf'
            );
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.setHeader('Content-Length', fileData.size);
            
            res.send(fileData.buffer);
        } else {
            res.status(500).json({ error: 'Falha na exportação' });
        }
        
    } catch (error) {
        console.error('Erro na rota /export:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            message: error.message 
        });
    }
});

// Cleanup old files periodically
setInterval(() => {
    exportService.cleanupOldFiles(24);
}, 60 * 60 * 1000); // Run every hour

module.exports = router;


