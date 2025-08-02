# Gerador Inteligente de Apresentações

Um sistema web completo para geração automática de apresentações usando Inteligência Artificial. O usuário digita um tema e escolhe a quantidade de slides, e o sistema gera automaticamente o conteúdo usando a API do ChatGPT, formatando os slides em HTML com Reveal.js e oferecendo exportação para PPTX e PDF.

## 🚀 Funcionalidades

- **Geração Automática**: Crie apresentações completas apenas digitando um tema
- **IA Integrada**: Usa a API do ChatGPT para gerar conteúdo relevante e estruturado
- **Interface Moderna**: Front-end responsivo com TailwindCSS
- **Visualização Profissional**: Slides formatados com Reveal.js
- **Editor Avançado**: Edite slides individualmente com assistente IA
- **Exportação Múltipla**: Exporte para PPTX e PDF
- **Drag & Drop**: Reordene slides facilmente
- **Responsivo**: Funciona perfeitamente em desktop e mobile

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **Express.js**
- **OpenAI API** (ChatGPT)
- **PptxGenJS** (geração de PPTX)
- **Puppeteer** (geração de PDF)
- **CORS** habilitado

### Frontend
- **HTML5** + **CSS3** + **JavaScript**
- **TailwindCSS** (estilização)
- **Reveal.js** (apresentação de slides)
- **Font Awesome** (ícones)
- **SortableJS** (drag & drop)

## 📁 Estrutura do Projeto

```
presentation-generator/
├── backend/
│   ├── index.js                 # Servidor principal
│   ├── routes/
│   │   └── presentation.js      # Rotas da API
│   ├── services/
│   │   ├── openaiService.js     # Integração com OpenAI
│   │   └── exportService.js     # Exportação PPTX/PDF
│   ├── exports/                 # Arquivos exportados
│   ├── package.json
│   └── .env                     # Configurações
├── frontend/
│   ├── index.html              # Página principal
│   ├── script.js               # JavaScript principal
│   ├── editor.html             # Editor de slides
│   ├── editor.js               # JavaScript do editor
│   ├── presentation.html       # Visualizador Reveal.js
│   └── README.md
└── README.md
```

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd presentation-generator
```

### 2. Configure o Backend
```bash
cd backend
npm install
```

### 3. Configure as variáveis de ambiente
Edite o arquivo `.env` no diretório backend:
```env
OPENAI_API_KEY=sua_chave_da_openai_aqui
PORT=3000
```

### 4. Inicie o servidor backend
```bash
npm start
```

### 5. Inicie o servidor frontend
```bash
cd ../frontend
python3 -m http.server 8080
```

## 🚀 Como Usar

### 1. Geração de Apresentação
1. Acesse `http://localhost:8080`
2. Digite o tema da apresentação
3. Escolha o número de slides (3-20)
4. Clique em "Gerar Apresentação"
5. Aguarde a IA criar o conteúdo

### 2. Visualização
- Clique em "Apresentar" para ver os slides em modo apresentação
- Use as setas do teclado para navegar
- Pressione ESC para voltar ao editor

### 3. Edição
- Clique em "Editar" para abrir o editor avançado
- Edite títulos e conteúdo dos slides
- Adicione, duplique ou remova slides
- Use o assistente IA para melhorar o conteúdo
- Reordene slides com drag & drop

### 4. Exportação
- Clique em "PPTX" para baixar em formato PowerPoint
- Clique em "PDF" para baixar em formato PDF

## 🎯 API Endpoints

### POST /api/presentation/generate
Gera uma nova apresentação baseada no tema.

**Body:**
```json
{
  "theme": "Inteligência Artificial no Marketing",
  "slidesCount": 8
}
```

**Response:**
```json
{
  "success": true,
  "presentation": {
    "title": "Título da Apresentação",
    "theme": "Tema",
    "slides": [
      {
        "title": "Título do Slide",
        "content": ["Ponto 1", "Ponto 2", "Ponto 3"]
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### POST /api/presentation/generate-slide
Gera conteúdo para um slide específico.

**Body:**
```json
{
  "title": "Título do Slide",
  "context": "Contexto da apresentação"
}
```

### POST /api/presentation/export
Exporta a apresentação em PPTX ou PDF.

**Body:**
```json
{
  "presentation": { /* objeto da apresentação */ },
  "format": "pptx" // ou "pdf"
}
```

## ⌨️ Atalhos do Teclado

### Editor
- `Ctrl+S`: Salvar apresentação
- `Ctrl+N`: Adicionar novo slide
- `Ctrl+D`: Duplicar slide atual
- `Delete`: Excluir slide selecionado

### Visualizador
- `Setas`: Navegar entre slides
- `ESC`: Voltar ao editor
- `Ctrl+P`: Exportar para PDF
- `Ctrl+E`: Exportar para PPTX

## 🎨 Personalização

### Temas de Cores
Edite as cores no arquivo `script.js` ou `editor.js`:
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#3B82F6',    // Azul principal
                secondary: '#1E40AF',  // Azul secundário
                accent: '#F59E0B'      // Amarelo de destaque
            }
        }
    }
}
```

### Estilos de Slide
Modifique os estilos no arquivo `presentation.html` para personalizar a aparência dos slides.

## 🔒 Segurança

- A chave da API OpenAI deve ser mantida segura no arquivo `.env`
- Arquivos exportados são automaticamente limpos após 24 horas
- CORS está configurado para permitir acesso do frontend

## 📝 Limitações

- Máximo de 20 slides por apresentação
- Conteúdo limitado pelo token limit da API OpenAI
- Exportação PDF requer Puppeteer (pode ser pesado em alguns sistemas)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se a chave da API OpenAI está configurada corretamente
3. Verifique se as portas 3000 (backend) e 8080 (frontend) estão disponíveis
4. Consulte os logs do console para mensagens de erro

## 🔮 Próximas Funcionalidades

- [ ] Temas visuais personalizáveis
- [ ] Integração com Google Slides
- [ ] Colaboração em tempo real
- [ ] Biblioteca de templates
- [ ] Análise de apresentações com IA
- [ ] Integração com bancos de imagens
- [ ] Modo offline
- [ ] API para integração com outros sistemas

---

Desenvolvido com ❤️ e IA para facilitar a criação de apresentações profissionais.

