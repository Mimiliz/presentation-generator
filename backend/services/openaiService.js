const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generatePresentation(theme, slidesCount) {
        try {
            const prompt = this.createPrompt(theme, slidesCount);
            
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Você é um especialista em criação de apresentações profissionais. Crie apresentações estruturadas, informativas e envolventes."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 3000
            });

            const content = completion.choices[0].message.content;
            return this.parseResponse(content, theme);
            
        } catch (error) {
            console.error('Erro ao gerar apresentação:', error);
            throw new Error('Falha ao gerar apresentação com OpenAI');
        }
    }

    createPrompt(theme, slidesCount) {
        return `
Crie uma apresentação profissional sobre "${theme}" com exatamente ${slidesCount} slides.

Estruture a resposta no seguinte formato JSON:
{
    "title": "Título da Apresentação",
    "slides": [
        {
            "title": "Título do Slide",
            "content": ["Ponto 1", "Ponto 2", "Ponto 3"]
        }
    ]
}

Diretrizes:
1. O primeiro slide deve ser uma introdução/título
2. O último slide deve ser uma conclusão
3. Cada slide deve ter 2-4 pontos principais
4. Use linguagem clara e profissional
5. Mantenha o conteúdo relevante e informativo
6. Inclua dados e insights quando apropriado

Tema: ${theme}
Número de slides: ${slidesCount}

Responda APENAS com o JSON válido, sem texto adicional.
        `;
    }

    parseResponse(content, theme) {
        try {
            // Remove possíveis caracteres extras e tenta fazer parse do JSON
            const cleanContent = content.trim().replace(/```json\n?|\n?```/g, '');
            const parsed = JSON.parse(cleanContent);
            
            // Validação básica
            if (!parsed.slides || !Array.isArray(parsed.slides)) {
                throw new Error('Formato de resposta inválido');
            }

            return {
                title: parsed.title || theme,
                theme: theme,
                slides: parsed.slides,
                createdAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Erro ao fazer parse da resposta:', error);
            // Fallback: criar uma apresentação básica
            return this.createFallbackPresentation(theme, 5);
        }
    }

    createFallbackPresentation(theme, slidesCount) {
        const slides = [
            {
                title: theme,
                content: ["Apresentação sobre " + theme, "Gerado automaticamente", "Vamos explorar este tópico"]
            }
        ];

        // Adicionar slides de conteúdo
        for (let i = 1; i < slidesCount - 1; i++) {
            slides.push({
                title: `Tópico ${i}`,
                content: [
                    `Ponto importante sobre ${theme}`,
                    "Detalhes relevantes",
                    "Informações adicionais"
                ]
            });
        }

        // Slide de conclusão
        slides.push({
            title: "Conclusão",
            content: [
                "Resumo dos pontos principais",
                "Considerações finais",
                "Obrigado pela atenção!"
            ]
        });

        return {
            title: theme,
            theme: theme,
            slides: slides,
            createdAt: new Date().toISOString()
        };
    }

    async generateSlideContent(title, context) {
        try {
            const prompt = `
Crie conteúdo detalhado para um slide com o título "${title}" no contexto de "${context}".

Retorne um JSON com o formato:
{
    "title": "${title}",
    "content": ["Ponto 1", "Ponto 2", "Ponto 3", "Ponto 4"]
}

O conteúdo deve ser:
- Informativo e relevante
- Bem estruturado
- Profissional
- Entre 3-5 pontos principais

Responda APENAS com o JSON válido.
            `;

            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Você é um especialista em criação de conteúdo para apresentações."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const content = completion.choices[0].message.content;
            const cleanContent = content.trim().replace(/```json\n?|\n?```/g, '');
            return JSON.parse(cleanContent);
            
        } catch (error) {
            console.error('Erro ao gerar conteúdo do slide:', error);
            return {
                title: title,
                content: [
                    "Conteúdo sobre " + title,
                    "Informações relevantes",
                    "Detalhes importantes"
                ]
            };
        }
    }
}

module.exports = OpenAIService;

