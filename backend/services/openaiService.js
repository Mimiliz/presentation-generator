const { GoogleGenerativeAI } = require('@google/generative-ai');

class OpenAIService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    async generatePresentation(theme, slidesCount) {
        try {
            const prompt = `Crie uma apresentação profissional sobre "${theme}" com exatamente ${slidesCount} slides.

Retorne APENAS um JSON válido no seguinte formato:
{
  "title": "Título da Apresentação",
  "slides": [
    {
      "title": "Título do Slide 1",
      "content": ["Ponto 1", "Ponto 2", "Ponto 3"]
    }
  ]
}

Requisitos:
- Cada slide deve ter um título claro e conciso
- O conteúdo deve ser uma lista de 3-5 pontos principais
- Use linguagem profissional e informativa
- Mantenha os pontos concisos mas informativos
- NÃO inclua texto adicional além do JSON`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Limpar e extrair JSON da resposta
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Resposta não contém JSON válido');
            }
            
            const presentationData = JSON.parse(jsonMatch[0]);
            
            // Validar estrutura
            if (!presentationData.title || !presentationData.slides || !Array.isArray(presentationData.slides)) {
                throw new Error('Estrutura de dados inválida');
            }
            
            return presentationData;
            
        } catch (error) {
            console.error('Erro ao gerar apresentação com Gemini:', error);
            
            // Fallback: gerar apresentação básica
            return this.generateFallbackPresentation(theme, slidesCount);
        }
    }

    generateFallbackPresentation(theme, slidesCount) {
        const slides = [];
        
        // Slide de introdução
        slides.push({
            title: `Introdução: ${theme}`,
            content: [
                `Visão geral sobre ${theme}`,
                "Objetivos da apresentação",
                "Principais tópicos a serem abordados"
            ]
        });
        
        // Slides de conteúdo
        for (let i = 2; i <= slidesCount - 1; i++) {
            slides.push({
                title: `${theme} - Tópico ${i - 1}`,
                content: [
                    `Aspecto importante de ${theme}`,
                    "Detalhes e características",
                    "Impactos e considerações"
                ]
            });
        }
        
        // Slide de conclusão
        if (slidesCount > 1) {
            slides.push({
                title: "Conclusão",
                content: [
                    `Resumo dos pontos principais sobre ${theme}`,
                    "Considerações finais",
                    "Próximos passos"
                ]
            });
        }
        
        return {
            title: `Apresentação: ${theme}`,
            slides: slides.slice(0, slidesCount)
        };
    }
}

module.exports = new OpenAIService();
