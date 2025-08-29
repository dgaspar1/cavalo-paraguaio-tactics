# 🎮 Cavalo Paraguayo Tactics

Um app web colaborativo para planejamento de táticas no MMORPG Perfect World, similar ao WoWtastic mas focado especificamente no universo do Perfect World.

## ✨ Funcionalidades

### 🎨 **Canvas Colaborativo**
- **Desenho em Tempo Real**: Múltiplos jogadores podem desenhar simultaneamente
- **Mapa de Fundo**: Imagem de fundo do Perfect World integrada ao canvas
- **Sistema de Camadas**: Organize desenhos em camadas separadas com controles profissionais
- **Ferramentas Diversas**: Pincel, borracha, texto, ícones temáticos e unidades do jogo
- **Linhas Temporárias**: Linhas que desaparecem gradualmente para comunicação rápida
- **Zoom e Pan**: Navegue pelo mapa com controles intuitivos

### 📹 **Sistema de Links de Vídeo**
- **Referência Visual**: Adicione links de vídeos para referência durante o planejamento
- **Plataformas Suportadas**: YouTube, Twitch, Vimeo, Dailymotion, Bilibili, TikTok, Instagram
- **Colaboração**: Todos os jogadores podem ver e acessar os vídeos compartilhados
- **Organização**: Título, descrição e metadados para cada link
- **Histórico**: Links são salvos na sessão e podem ser exportados/importados

### 💬 **Chat em Tempo Real**
- **Comunicação**: Chat integrado para discussões durante o planejamento
- **Identificação**: Cada jogador tem cor única e nome personalizável
- **Histórico**: Mensagens são salvas na sessão
- **Sincronização**: Chat sincronizado entre todos os participantes

### 🔐 **Sistema de Permissões**
- **Editor**: Pode desenhar, gerenciar camadas e adicionar/remover vídeos
- **Visualizador**: Apenas visualiza o conteúdo (modo somente leitura)
- **Links Personalizados**: Cada permissão gera um link específico
- **Controle de Acesso**: Gerencie quem pode editar a sessão

### 💾 **Persistência de Sessão**
- **Exportação**: Salve toda a sessão em um arquivo JSON
- **Importação**: Carregue sessões salvas anteriormente
- **Dados Completos**: Inclui desenhos, chat, vídeos, camadas e configurações
- **Sem Banco de Dados**: Sistema baseado em arquivos para simplicidade

### 🎛️ **Interface Profissional**
- **Sistema de Abas**: Alternância entre canvas e gerenciamento de vídeos
- **Painéis Redimensionáveis**: Ajuste o tamanho das colunas laterais
- **Gerenciamento de Camadas**: Interface similar ao Photoshop/Figma
- **Responsividade**: Adapta-se a diferentes tamanhos de tela

## 🚀 Como Usar

### Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd cavalo-paraguayo-tatics
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o ambiente de desenvolvimento (Recomendado)**
```bash
# Linux/Mac
./dev.sh

# Windows
dev.bat

# Ou manualmente
npm run dev:all
```

4. **Ou inicie separadamente**
```bash
# Terminal 1 - Backend com live reload
npm run server:dev

# Terminal 2 - Frontend
npm run dev
```

5. **Acesse o app**
```
Frontend: http://localhost:3000
Backend: http://localhost:3001
```

### Scripts Disponíveis

#### 🚀 **Desenvolvimento**
```bash
npm run dev:all          # Inicia backend + frontend simultaneamente
npm run server:dev       # Backend com live reload (nodemon)
npm run dev              # Frontend com hot reload (vite)
```

#### 🔧 **Produção**
```bash
npm run build            # Build do frontend
npm run preview          # Preview do build
npm run start            # Inicia backend + preview simultaneamente
```

#### 📦 **Utilitários**
```bash
npm run server           # Backend sem live reload
npm run lint             # Verificação de código
npm install              # Instala dependências
```

#### 🐚 **Scripts de Sistema**
```bash
./dev.sh                 # Script bash para Linux/Mac
dev.bat                  # Script batch para Windows
```

### Uso Básico

1. **Criar uma sessão**: O app gera automaticamente um link único
2. **Compartilhar**: Clique em "Compartilhar Link" para copiar o URL
3. **Convidar jogadores**: Envie o link para seus companheiros de guild
4. **Gerenciar camadas**: Use o painel lateral para organizar seus desenhos
5. **Mostrar painel**: Se oculto, clique no botão flutuante 📑 para mostrar
6. **Desenhar**: Use as ferramentas para criar estratégias no mapa
7. **Interagir**: Use linhas temporárias para comunicação rápida
8. **Colaborar**: Todos veem as mudanças em tempo real

### Gerenciamento de Camadas

#### Painel de Camadas
- **Localização**: Painel lateral direito (colapsável)
- **Visibilidade**: Botão ◀/▶ para ocultar/mostrar
- **Botão flutuante**: Se oculto, clique no botão circular 📑 para mostrar
- **Nova camada**: Botão ➕ para criar camadas
- **Camada padrão**: "Camada Principal" criada automaticamente

#### Controles de Camada
- **👁️/🙈**: Toggle de visibilidade
- **🔒/🔓**: Toggle de bloqueio
- **✏️**: Renomear camada
- **🗑️**: Deletar camada
- **Slider**: Controle de opacidade (0-100%)

#### Reordenação
- **Drag & Drop**: Arraste camadas para reorganizar
- **Ordem visual**: Camadas superiores aparecem por cima

#### Renomear Camadas
- **Duplo clique**: No nome da camada para editar
- **Enter**: Salvar alterações
- **Clique fora**: Cancelar edição

### Redimensionamento Dinâmico

#### 🔧 Redimensionar Toolbar
- **Handle**: Barra dourada na borda direita da toolbar
- **Limites**: 200px (mínimo) a 500px (máximo)
- **Uso**: Clique e arraste para redimensionar
- **Feedback**: Handle muda de cor durante o arraste

#### 🔧 Redimensionar Painel de Camadas
- **Handle**: Barra dourada na borda esquerda do painel
- **Limites**: 250px (mínimo) a 600px (máximo)
- **Uso**: Clique e arraste para redimensionar
- **Feedback**: Handle muda de cor durante o arraste

#### 📱 Responsividade
- **Desktop**: Larguras máximas permitidas
- **Tablet**: Limites reduzidos automaticamente
- **Mobile**: Layout otimizado para telas pequenas
- **Adaptação**: Canvas se ajusta automaticamente

### Zoom e Pan

#### 🔍 Controles de Zoom
- **Localização**: Canto inferior esquerdo do canvas
- **Zoom In**: Botão ➕ para aumentar zoom (máximo 500%)
- **Zoom Out**: Botão ➖ para diminuir zoom (mínimo 10%)
- **Reset**: Botão 🎯 para voltar ao zoom 100%
- **Indicador**: Mostra porcentagem atual do zoom

#### 🖱️ Pan (Movimento)
- **Ativar**: Segurar Ctrl (ou Cmd no Mac) e clicar
- **Mover**: Arrastar o mouse para mover o canvas
- **Desativar**: Soltar o mouse ou Ctrl
- **Sincronização**: Movimento sincronizado entre jogadores

#### 🎯 Como Usar
1. **Zoom**: Use os botões ➕/➖ para ajustar o zoom
2. **Pan**: Segure Ctrl e arraste para mover o canvas
3. **Reset**: Clique em 🎯 para voltar ao estado inicial
4. **Combinação**: Use zoom e pan juntos para navegar no mapa
5. **Precisão**: Zoom alto para detalhes, zoom baixo para visão geral

### Chat em Tempo Real

#### 💬 Configuração Inicial
- **Nome do jogador**: Digite seu nome ao entrar na sessão
- **Confirmação**: Pressione Enter ou clique em OK
- **Personalização**: Nome aparece em todas as suas mensagens

#### 📝 Enviar Mensagens
- **Input de texto**: Campo de texto na parte inferior do chat
- **Enviar**: Pressione Enter ou clique no botão ➤
- **Limite**: Máximo 200 caracteres por mensagem
- **Validação**: Mensagens vazias não são enviadas

#### 🎨 Interface do Chat
- **Painel colapsável**: Botão ◀/▶ para ocultar/mostrar
- **Mensagens próprias**: Destacadas com cor diferente
- **Timestamps**: Horário de cada mensagem
- **Auto-scroll**: Chat rola automaticamente para novas mensagens
- **Scroll manual**: Role para ver mensagens anteriores

#### 👥 Funcionalidades
- **Tempo real**: Mensagens aparecem instantaneamente
- **Histórico**: Mensagens anteriores carregadas ao entrar
- **Cores**: Cada jogador tem sua cor nas mensagens
- **Sincronização**: Todos os jogadores veem as mesmas mensagens
- **Responsivo**: Interface adaptada para diferentes telas

### Sistema de Permissões

#### 🔐 Tipos de Acesso
- **Editor**: Pode desenhar, modificar camadas, usar todas as ferramentas
- **Visualizador**: Pode ver tudo, usar zoom/pan, chat, mas não editar

#### 📋 Compartilhamento de Links
- **Modal de permissão**: Clique em "Compartilhar Link" para abrir
- **Link de Editor**: Permite edição completa da sessão
- **Link de Visualizador**: Permite apenas visualização
- **Cópia automática**: Link é copiado automaticamente para a área de transferência
- **Feedback visual**: Confirmação do tipo de link copiado

#### 🎯 Como Funciona
1. **Criador da sessão**: Sempre é editor por padrão
2. **Compartilhamento**: Escolha entre editor ou visualizador
3. **Links específicos**: Cada link tem sua permissão embutida
4. **Verificação**: Permissões verificadas automaticamente
5. **Interface adaptativa**: Elementos desabilitados conforme permissão

#### 🔒 Segurança
- **Verificação dupla**: Cliente e servidor verificam permissões
- **URL segura**: Permissões definidas na URL
- **Sem bypass**: Interface bloqueia ações não autorizadas
- **Indicadores claros**: Badge mostra tipo de permissão atual

### Exportação e Importação de Sessões

#### 💾 Exportar Sessão
- **Localização**: Botão 💾 no cabeçalho da aplicação
- **Dados exportados**: Todas as camadas, desenhos, chat, zoom, pan
- **Formato**: Arquivo JSON com metadados completos
- **Nome do arquivo**: `cavalo-paraguayo-tatics-session-{ID}.json`
- **Download automático**: Arquivo baixado automaticamente

#### 📂 Importar Sessão
- **Localização**: Botão 📂 no cabeçalho da aplicação
- **Dois métodos**: Carregar arquivo ou colar dados JSON
- **Validação**: Verifica integridade dos dados importados
- **Restauração completa**: Recria toda a sessão original
- **Feedback**: Confirmação de sucesso ou erro

#### 📊 Dados Preservados
- **Camadas**: Estrutura, visibilidade, bloqueio, opacidade
- **Desenhos**: Todo o conteúdo visual das camadas
- **Chat**: Histórico completo de mensagens
- **Linhas temporárias**: Estado atual das linhas
- **Zoom e Pan**: Posição e zoom do canvas
- **Metadados**: Informações da sessão e exportação

#### 🎯 Casos de Uso
- **Backup**: Salvar trabalho importante
- **Compartilhamento**: Enviar sessões para outros usuários
- **Continuação**: Retomar trabalho em outro momento
- **Apresentação**: Carregar sessões para demonstrações
- **Colaboração**: Compartilhar estratégias salvas

### Linhas Temporárias com Fade Progressivo

#### Como Usar
1. **Selecionar ferramenta**: Clique no botão ⚡
2. **Desenhar**: Clique e arraste para criar linhas
3. **Fade progressivo**: Linhas desaparecem gradualmente do início ao fim
4. **Sincronização**: Todos os jogadores veem as linhas

#### Efeito Visual
- **Desvanecimento gradual**: Cada segmento da linha desaparece individualmente
- **Rastro que se desfaz**: Cria um efeito visual de linha que se dissolve
- **Tempo por segmento**: 3 segundos de duração para cada parte da linha
- **Sincronização perfeita**: Todos os jogadores veem o mesmo efeito

#### Casos de Uso
- **Apontar elementos**: Indicar posições específicas com rastro visual
- **Comunicação rápida**: Durante discussões em tempo real
- **Feedback visual**: Mostrar movimentos ou direções com efeito de rastro
- **Coordenação**: Sincronizar ações entre jogadores

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18**: Framework principal
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server
- **Socket.io Client**: Comunicação em tempo real
- **Canvas API**: Sistema de desenho com múltiplas camadas
- **Drag & Drop API**: Reordenação de camadas
- **Mouse Events**: Redimensionamento dinâmico

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **Socket.io**: WebSockets para tempo real
- **CORS**: Cross-origin resource sharing

## 📁 Estrutura do Projeto

```
cavalo-paraguayo-tatics/
├── src/
│   ├── App.tsx          # Componente principal com redimensionamento dinâmico
│   ├── App.css          # Estilos do app
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── server/
│   └── index.js         # Servidor backend com suporte a camadas e linhas temporárias
├── public/
│   └── mapa-tw.png      # Mapa de fundo do Perfect World
├── package.json         # Dependências
├── vite.config.ts       # Configuração Vite
├── tsconfig.json        # Configuração TypeScript
├── README.md           # Documentação
├── DEMO.md             # Guia de demonstração
└── .gitignore          # Arquivos ignorados
```

## 🎯 Casos de Uso

### Para Guilds
- **Planejamento de Raids**: 
  - Background: Mapa base
  - Terrain: Posições dos jogadores
  - Objects: Movimentos do boss e estratégias
  - Linhas temporárias: Comunicação durante execução com fade progressivo
- **PvP**: Organizar ataques e defesas por camadas
- **Farming**: Marcar rotas de farm e recursos
- **Eventos**: Coordenar participação em eventos

### Para Grupos
- **Dungeons**: 
  - Background: Mapa do dungeon
  - Terrain: Rota principal
  - Objects: Pontos de interesse e inimigos
  - Linhas temporárias: Coordenação em tempo real com rastro visual
- **Questing**: Marcar objetivos e NPCs
- **Exploração**: Mapear áreas desconhecidas
- **Treinamento**: Ensinar novos jogadores

## 🔧 Configuração Avançada

### Variáveis de Ambiente
```bash
PORT=3001          # Porta do servidor backend
NODE_ENV=development
```

### Personalização
- **Cores**: Edite as variáveis CSS em `src/index.css`
- **Ícones**: Modifique o objeto `icons` em `src/App.tsx`
- **Tamanho do canvas**: Ajuste em `src/App.tsx`
- **Mapa de fundo**: Substitua `public/mapa-tw.png` por outro mapa
- **Duração das linhas temporárias**: Modifique o valor em `src/App.tsx`
- **Limites de redimensionamento**: Ajuste em `src/App.tsx`

### Estrutura de Camadas
```typescript
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  canvas: HTMLCanvasElement;
}

interface TempLine {
  id: string;
  playerId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  timestamp: number;
  segments: Array<{
    x: number;
    y: number;
    timestamp: number;
  }>;
}
```

### Configuração de Redimensionamento
```typescript
// Limites de redimensionamento
const TOOLBAR_MIN_WIDTH = 200;
const TOOLBAR_MAX_WIDTH = 500;
const LAYERS_MIN_WIDTH = 250;
const LAYERS_MAX_WIDTH = 600;
```

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Erro de conexão com servidor**
   - Verifique se o servidor está rodando na porta 3001
   - Confirme se não há firewall bloqueando

2. **Desenhos não sincronizam**
   - Verifique a conexão de internet
   - Recarregue a página

3. **Canvas não responde**
   - Verifique se o JavaScript está habilitado
   - Limpe o cache do navegador

4. **Camadas não funcionam**
   - Verifique se a camada não está bloqueada
   - Confirme se a camada está visível
   - Selecione uma camada ativa

5. **Mapa não carrega**
   - Verifique se o arquivo `public/mapa-tw.png` existe
   - Confirme se o arquivo não está corrompido

6. **Linhas temporárias não aparecem**
   - Verifique se a ferramenta ⚡ está selecionada
   - Confirme se a conexão está ativa

7. **Redimensionamento não funciona**
   - Verifique se os handles estão visíveis
   - Confirme se não há conflitos de CSS
   - Tente recarregar a página

8. **Fade progressivo não funciona**
   - Verifique se os segmentos estão sendo criados corretamente
   - Confirme se o sistema de tempo está funcionando
   - Teste a sincronização entre jogadores

#### 🔧 Debug
- Abra o console do navegador (F12)
- Verifique mensagens de erro
- Teste a conexão WebSocket
- Verifique se todas as dependências estão instaladas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- Inspirado no WoWtastic
- Comunidade Perfect World
- Contribuidores do projeto

---

**Desenvolvido com ❤️ para a comunidade Cavalo Paraguayo** 