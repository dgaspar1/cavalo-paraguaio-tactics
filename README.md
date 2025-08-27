# 🎮 Cavalo Paraguayo Tactics

Um app web colaborativo para planejamento de táticas no MMORPG Perfect World, similar ao WoWtastic mas focado especificamente no universo do Perfect World.

## ✨ Funcionalidades

### 🎯 Ferramentas de Desenho
- **Pincel**: Desenho livre com cores personalizáveis
- **Borracha**: Remover desenhos
- **Ícones**: Marcadores específicos do Perfect World
- **Linha Temporária**: Desenhos que desaparecem gradualmente do início ao fim
- **Controle de espessura**: Ajustar tamanho do pincel

### 🗺️ Mapa de Fundo
- **Mapa do Perfect World**: Imagem de fundo temática do jogo
- **Canvas responsivo**: Ajusta automaticamente ao tamanho da tela
- **Fundo integrado**: Desenhos sobrepostos ao mapa

### 📑 Sistema de Camadas Profissional
- **Painel lateral**: Interface similar a ferramentas profissionais (Photoshop, Figma)
- **Uma camada por padrão**: "Camada Principal" criada automaticamente
- **Botão flutuante**: Botão circular 📑 para mostrar painel quando oculto
- **Múltiplas camadas**: Organizar desenhos em camadas separadas
- **Criar camadas**: Adicionar novas camadas conforme necessário
- **Deletar camadas**: Remover camadas não utilizadas
- **Renomear camadas**: Duplo clique para editar nomes
- **Ocultar camadas**: Toggle de visibilidade com ícones intuitivos
- **Bloquear camadas**: Proteger camadas contra edição acidental
- **Controle de opacidade**: Slider para ajustar transparência (0-100%)
- **Reordenação**: Drag & drop para reorganizar camadas
- **Camada ativa**: Indicador visual da camada selecionada
- **Painel colapsável**: Ocultar/mostrar painel de camadas

### 🔧 Redimensionamento Dinâmico
- **Toolbar redimensionável**: Ajustar largura da barra de ferramentas (200-500px)
- **Painel de camadas redimensionável**: Ajustar largura do painel (250-600px)
- **Handles visuais**: Barras de redimensionamento com feedback visual
- **Limites responsivos**: Tamanhos mínimos e máximos para cada painel
- **Transições suaves**: Animações durante o redimensionamento
- **Responsividade automática**: Adaptação a diferentes tamanhos de tela

### 🔍 Sistema de Zoom e Pan
- **Controles de zoom**: Botões no canto inferior esquerdo do canvas
- **Zoom in/out**: Aumentar/diminuir zoom com botões ➕/➖
- **Reset zoom**: Botão 🎯 para voltar ao zoom 100%
- **Indicador de zoom**: Mostra porcentagem atual do zoom
- **Pan com Ctrl+clique**: Segurar Ctrl e arrastar para mover o canvas
- **Limites de zoom**: 10% (mínimo) a 500% (máximo)
- **Transformações suaves**: Zoom e pan aplicados em tempo real
- **Sincronização**: Zoom e pan sincronizados entre jogadores

### 💬 Sistema de Chat
- **Chat em tempo real**: Comunicação instantânea entre jogadores
- **Painel colapsável**: Chat no canto inferior direito (colapsável)
- **Nomes personalizados**: Cada jogador define seu nome
- **Cores individuais**: Mensagens com cores dos jogadores
- **Histórico de mensagens**: Mensagens anteriores carregadas ao entrar
- **Timestamps**: Horário de cada mensagem
- **Auto-scroll**: Chat rola automaticamente para novas mensagens
- **Responsivo**: Interface adaptada para mobile e desktop

### 🔐 Sistema de Permissões
- **Dois tipos de acesso**: Editor e Visualizador
- **Links específicos**: Cada link tem sua permissão definida
- **Controle de edição**: Apenas editores podem desenhar e modificar
- **Visualização livre**: Visualizadores podem ver tudo mas não editar
- **Indicadores visuais**: Badge mostrando o tipo de permissão
- **Interface adaptativa**: Elementos desabilitados para visualizadores
- **Compartilhamento inteligente**: Modal para escolher tipo de link
- **Segurança**: Permissões verificadas no cliente e servidor

### 💾 Sistema de Exportação/Importação
- **Exportação completa**: Salva toda a sessão em arquivo JSON
- **Importação flexível**: Carrega sessões via arquivo ou colagem de dados
- **Dados preservados**: Camadas, desenhos, chat, zoom, pan e metadados
- **Formato portável**: Arquivos JSON podem ser compartilhados
- **Validação**: Verifica integridade dos dados importados
- **Interface intuitiva**: Modais claros para exportar e importar
- **Feedback visual**: Confirmação de operações bem-sucedidas
- **Responsivo**: Funciona em desktop e mobile

### ⚡ Linhas Temporárias com Fade Progressivo
- **Desvanecimento gradual**: Linhas desaparecem do início ao fim
- **Segmentos individuais**: Cada parte da linha tem seu próprio tempo de vida
- **Efeito visual**: Cria um efeito de "rastro que se desfaz"
- **Comunicação visual**: Ideal para apontar elementos durante discussões
- **Sincronização**: Todos os jogadores veem as linhas temporárias
- **Duração configurável**: 3 segundos de duração por segmento
- **Ferramenta dedicada**: Botão ⚡ para ativar modo de linha temporária

### 🎨 Ícones Temáticos do Perfect World
- 👹 **Mob**: Criaturas inimigas
- 👤 **NPC**: Personagens não-jogáveis
- 💎 **Recurso**: Materiais e recursos
- 👺 **Boss**: Chefes e inimigos especiais
- 🌀 **Portal**: Teleportes e entradas
- ❓ **Quest**: Missões e objetivos

### 👥 Colaboração em Tempo Real
- **Sessões privadas**: Links únicos para cada sessão
- **Sincronização**: Desenhos aparecem instantaneamente para todos
- **Lista de jogadores**: Visualizar quem está na sessão
- **Cores individuais**: Cada jogador tem sua cor identificadora
- **Sincronização de camadas**: Mudanças nas camadas sincronizadas entre jogadores
- **Interação visual**: Linhas temporárias para comunicação rápida

### 🎨 Interface Temática
- Design inspirado no Perfect World
- Paleta de cores dourada e azul
- Interface responsiva e moderna
- Efeitos visuais e animações
- Painel de camadas profissional
- Redimensionamento dinâmico

## 🚀 Como Usar

### Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd perfect-world-tactics
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor backend**
```bash
npm run server
```

4. **Em outro terminal, inicie o frontend**
```bash
npm run dev
```

5. **Acesse o app**
```
http://localhost:3000
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