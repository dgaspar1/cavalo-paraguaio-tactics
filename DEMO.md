# 🎮 Demonstração - Cavalo Paraguayo Tactics

## 🚀 Como Testar o Sistema de Camadas Profissional, Linhas Temporárias com Fade Progressivo e Redimensionamento Dinâmico

### 1. Iniciar o Projeto
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

### 2. Abrir Múltiplas Abas
- Abra `http://localhost:3000` em várias abas do navegador
- Cada aba simula um jogador diferente
- Compartilhe o link da sessão entre as abas

### 3. Testar Redimensionamento Dinâmico

#### 🔧 Redimensionar Toolbar
1. **Localizar o handle**: Procure a barra dourada na borda direita da toolbar
2. **Iniciar redimensionamento**: Clique e segure o handle
3. **Arrastar**: Mova o mouse para a esquerda ou direita
4. **Limites**: Toolbar pode ter entre 200px e 500px de largura
5. **Feedback visual**: Handle muda de cor durante o arraste

#### 🔧 Redimensionar Painel de Camadas
1. **Localizar o handle**: Procure a barra dourada na borda esquerda do painel de camadas
2. **Iniciar redimensionamento**: Clique e segure o handle
3. **Arrastar**: Mova o mouse para a esquerda ou direita
4. **Limites**: Painel pode ter entre 250px e 600px de largura
5. **Feedback visual**: Handle muda de cor durante o arraste

#### 📱 Testar Responsividade
1. **Redimensionar janela**: Mude o tamanho da janela do navegador
2. **Limites automáticos**: Observe que os painéis se ajustam automaticamente
3. **Canvas responsivo**: Verifique se o canvas se adapta ao novo espaço
4. **Diferentes telas**: Teste em desktop, tablet e mobile

### 5. Testar Sistema de Zoom e Pan

#### 🔍 Controles de Zoom
1. **Localizar controles**: Procure os botões no canto inferior esquerdo do canvas
2. **Zoom In**: Clique no botão ➕ para aumentar o zoom
3. **Zoom Out**: Clique no botão ➖ para diminuir o zoom
4. **Reset Zoom**: Clique no botão 🎯 para voltar ao zoom 100%
5. **Indicador**: Observe a porcentagem de zoom atual
6. **Limites**: Teste os limites de 10% (mínimo) e 500% (máximo)

#### 🖱️ Pan (Movimento)
1. **Ativar pan**: Segure Ctrl (ou Cmd no Mac) e clique no canvas
2. **Mover canvas**: Arraste o mouse para mover o canvas
3. **Desativar pan**: Solte o mouse ou a tecla Ctrl
4. **Combinação**: Use zoom e pan juntos para navegar
5. **Sincronização**: Teste com múltiplos jogadores

#### 🎯 Cenários de Uso
1. **Visão geral**: Use zoom baixo para ver todo o mapa
2. **Detalhes**: Use zoom alto para trabalhar em áreas específicas
3. **Navegação**: Use pan para mover entre diferentes áreas
4. **Precisão**: Combine zoom alto com pan para trabalhar com precisão
5. **Colaboração**: Todos os jogadores veem o mesmo zoom e pan

### 6. Testar Sistema de Chat

#### 💬 Configuração Inicial
1. **Localizar chat**: Procure o painel no canto inferior direito
2. **Digite seu nome**: Campo de texto aparece automaticamente
3. **Confirmar nome**: Pressione Enter ou clique em OK
4. **Chat ativo**: Painel de mensagens aparece após definir nome

#### 📝 Enviar Mensagens
1. **Campo de texto**: Digite sua mensagem no campo inferior
2. **Enviar**: Pressione Enter ou clique no botão ➤
3. **Limite**: Teste o limite de 200 caracteres
4. **Validação**: Tente enviar mensagem vazia (não deve funcionar)

#### 🎨 Interface do Chat
1. **Painel colapsável**: Clique no botão ◀/▶ para ocultar/mostrar
2. **Mensagens próprias**: Observe que suas mensagens têm destaque
3. **Timestamps**: Verifique o horário de cada mensagem
4. **Auto-scroll**: Envie mensagens e observe o scroll automático
5. **Scroll manual**: Role para ver mensagens anteriores

#### 👥 Teste de Colaboração
1. **Múltiplas abas**: Abra várias abas do navegador
2. **Nomes diferentes**: Cada aba define um nome diferente
3. **Mensagens**: Envie mensagens de diferentes abas
4. **Sincronização**: Verifique se todas as mensagens aparecem em todas as abas
5. **Cores**: Observe que cada jogador tem sua cor nas mensagens

#### 📱 Responsividade
1. **Redimensionar janela**: Mude o tamanho da janela
2. **Mobile**: Teste em diferentes tamanhos de tela
3. **Adaptação**: Verifique se o chat se adapta ao espaço disponível
4. **Usabilidade**: Confirme que o chat permanece funcional

### 7. Testar Sistema de Permissões

#### 🔐 Tipos de Acesso
1. **Editor**: Pode desenhar, modificar camadas, usar todas as ferramentas
2. **Visualizador**: Pode ver tudo, usar zoom/pan, chat, mas não editar

#### 📋 Compartilhamento de Links
1. **Abrir modal**: Clique em "Compartilhar Link" no cabeçalho
2. **Escolher permissão**: Selecione "Editor" ou "Visualizador"
3. **Link copiado**: Confirme que o link foi copiado
4. **Testar link**: Abra o link em nova aba para verificar permissões

#### 🎯 Teste de Permissões
1. **Link de Editor**: Teste todas as funcionalidades de edição
2. **Link de Visualizador**: Verifique que elementos estão desabilitados
3. **Indicadores visuais**: Observe o badge de permissão no cabeçalho
4. **Interface adaptativa**: Confirme que elementos corretos estão desabilitados

#### 🔒 Elementos Desabilitados para Visualizadores
1. **Ferramentas**: Todas as ferramentas de desenho desabilitadas
2. **Camadas**: Controles de camada desabilitados
3. **Ações**: Botão de limpar desabilitado
4. **Zoom/Pan**: Funcionalidades de navegação permanecem ativas
5. **Chat**: Sistema de chat permanece funcional

#### 🎨 Indicadores Visuais
1. **Badge de permissão**: Verde para editor, azul para visualizador
2. **Elementos desabilitados**: Opacidade reduzida e cursor alterado
3. **Modal de compartilhamento**: Interface clara para escolher permissão
4. **Feedback de cópia**: Confirmação do tipo de link copiado

### 8. Testar Sistema de Exportação/Importação

#### 💾 Exportar Sessão
1. **Criar conteúdo**: Desenhe, adicione camadas, use chat
2. **Abrir modal**: Clique no botão 💾 no cabeçalho
3. **Verificar dados**: Confirme que todos os itens estão listados
4. **Exportar**: Clique em "Exportar Sessão"
5. **Download**: Verifique se o arquivo foi baixado
6. **Verificar arquivo**: Abra o arquivo JSON para ver os dados

#### 📂 Importar Sessão
1. **Método arquivo**: Clique em "Escolher arquivo" e selecione um .json
2. **Método colagem**: Cole os dados JSON no campo de texto
3. **Validar dados**: Verifique se os dados são reconhecidos
4. **Importar**: Clique em "Importar Sessão"
5. **Verificar restauração**: Confirme que tudo foi carregado corretamente

#### 📊 Dados Preservados
1. **Camadas**: Verifique se todas as camadas foram restauradas
2. **Desenhos**: Confirme que os desenhos estão visíveis
3. **Chat**: Verifique se o histórico de mensagens foi carregado
4. **Zoom/Pan**: Confirme se a posição do canvas foi restaurada
5. **Metadados**: Verifique as informações da sessão

#### 🎯 Teste de Integridade
1. **Exportar sessão complexa**: Crie uma sessão com muitos elementos
2. **Importar em nova aba**: Abra nova aba e importe a sessão
3. **Comparar resultados**: Verifique se tudo foi preservado
4. **Teste de erro**: Tente importar arquivo inválido
5. **Validação**: Confirme que erros são tratados adequadamente

### 9. Testar o Painel de Camadas Profissional

#### 📑 Acessar o Painel
1. O painel de camadas está localizado no lado direito da tela
2. Use o botão ◀/▶ para ocultar/mostrar o painel
3. **Botão flutuante**: Se o painel estiver oculto, clique no botão circular 📑
4. O painel é similar ao do Photoshop/Figma
5. **Camada padrão**: "Camada Principal" é criada automaticamente

#### 🔘 Botão Flutuante de Camadas
1. **Localização**: Botão circular 📑 no lado direito da tela
2. **Aparece quando**: O painel de camadas está oculto
3. **Funcionalidade**: Clique para mostrar o painel de camadas
4. **Posicionamento**: Centralizado verticalmente na tela
5. **Responsividade**: Se adapta a diferentes tamanhos de tela

#### ➕ Criar Camadas
1. Clique no botão ➕ no cabeçalho do painel
2. Observe que a nova camada é automaticamente selecionada
3. As camadas são criadas com nomes padrão "Layer X"
4. **Camada inicial**: "Camada Principal" já existe por padrão

#### ✏️ Renomear Camadas
1. Dê duplo clique no nome de uma camada
2. Digite um novo nome (ex: "Posições dos Jogadores")
3. Pressione Enter para salvar ou clique fora para cancelar

#### 👁️ Ocultar/Mostrar Camadas
1. Clique no ícone 👁️/🙈 ao lado de uma camada
2. Observe que os desenhos da camada desaparecem/reaparecem
3. Teste em múltiplas abas para ver a sincronização

#### 🔒 Bloquear Camadas
1. Clique no ícone 🔓/🔒 para bloquear uma camada
2. Tente desenhar na camada bloqueada - não funcionará
3. Camadas bloqueadas ficam com visual diferente

#### 🎚️ Controle de Opacidade
1. Use o slider abaixo do nome da camada
2. Ajuste de 0% (transparente) a 100% (opaco)
3. Observe a mudança em tempo real

#### 🔄 Reordenação por Drag & Drop
1. Clique e arraste uma camada para cima ou para baixo
2. Observe que a ordem das camadas muda
3. Camadas superiores aparecem por cima das inferiores

#### 🗑️ Deletar Camadas
1. Clique no ícone 🗑️ para deletar uma camada
2. Confirme que pelo menos uma camada permanece
3. Observe que a camada ativa muda automaticamente

### 11. Cenários de Teste Avançados

#### 🎯 Cenário 1: Planejamento de Raid com Interface Personalizada
1. **Redimensionar painéis**: Ajuste as larguras conforme sua preferência
2. **Background**: Mapa base (já carregado)
3. **Terrain**: "Posições Iniciais"
   - Desenhe círculos para posições dos jogadores
   - Use cores diferentes para cada classe
4. **Objects**: "Movimentos do Boss"
   - Desenhe setas para movimentos do boss
   - Use ícones de boss nos pontos importantes
5. **Nova Camada**: "Áreas de Perigo"
   - Marque áreas vermelhas de perigo
   - Use ícones de portal para pontos de fuga
6. **Linhas Temporárias**: Durante a execução
   - Use para apontar posições específicas com rastro visual
   - Coordenar movimentos em tempo real
   - **Fade progressivo**: Observe como as linhas se desfazem gradualmente

#### 🏰 Cenário 2: PvP Guild vs Guild com Layout Otimizado
1. **Ajustar interface**: Redimensione os painéis para melhor visualização
2. **Background**: Mapa base
3. **Terrain**: "Nossa Formação"
   - Desenhe a formação da sua guild
   - Use ícones de NPC para líderes
4. **Objects**: "Inimigos"
   - Marque posições inimigas
   - Use ícones de mob para diferentes tipos
5. **Nova Camada**: "Estratégia"
   - Desenhe setas de movimento
   - Marque pontos de encontro
6. **Linhas Temporárias**: Coordenação
   - Apontar alvos específicos com rastro visual
   - Mostrar direções de ataque
   - **Efeito de rastro**: Linhas que se desfazem criam sensação de movimento

#### 🗺️ Cenário 3: Exploração de Dungeon com Responsividade
1. **Testar responsividade**: Redimensione a janela durante o uso
2. **Background**: Mapa do dungeon
3. **Terrain**: "Rota Principal"
   - Desenhe o caminho principal
   - Use cores diferentes para diferentes seções
4. **Objects**: "Pontos de Interesse"
   - Marque baús e recursos
   - Use ícones de recurso e quest
5. **Nova Camada**: "Inimigos e Obstáculos"
   - Marque posições de inimigos
   - Use ícones de boss para chefes
6. **Linhas Temporárias**: Navegação
   - Indicar caminhos alternativos com rastro visual
   - Marcar perigos momentâneos
   - **Fade progressivo**: Linhas que se desfazem mostram direção de movimento

### 12. Testes de Colaboração Avançados

#### 👥 Múltiplos Jogadores com Interface Personalizada
1. Abra 3-4 abas do navegador
2. Cada jogador personaliza sua interface (redimensiona painéis)
3. Cada jogador trabalha em uma camada diferente
4. Teste a sincronização de mudanças nas camadas
5. Observe que reordenação, opacidade e visibilidade sincronizam

#### ⚡ Linhas Temporárias em Grupo com Fade Progressivo
1. Múltiplos jogadores usando linhas temporárias
2. Observe que cada jogador tem sua cor
3. Teste a comunicação visual em tempo real
4. **Fade sincronizado**: Todos veem o mesmo efeito de desvanecimento
5. **Efeito de rastro**: Linhas que se desfazem criam comunicação visual rica

#### 🔄 Sincronização Completa
1. Um jogador desenha em uma camada
2. Outros jogadores veem o desenho instantaneamente
3. Teste mudanças de visibilidade e bloqueio
4. Verifique se linhas temporárias sincronizam com fade progressivo
5. Teste redimensionamento em diferentes dispositivos

#### 📱 Responsividade Avançada
1. Redimensione a janela do navegador
2. Teste em diferentes tamanhos de tela
3. Verifique se o canvas e painel de camadas se adaptam
4. Teste os limites de redimensionamento
5. Verifique se os handles permanecem funcionais

### 13. Dicas de Uso Avançadas

#### 🎨 Organização de Cores
- **Vermelho**: Perigo/Inimigos
- **Verde**: Seguro/Recursos
- **Azul**: Água/Portais
- **Amarelo**: Pontos importantes
- **Roxo**: Áreas especiais

#### 🎯 Uso dos Ícones
- 👹 **Mob**: Inimigos comuns
- 👺 **Boss**: Chefes e inimigos especiais
- 👤 **NPC**: Personagens importantes
- 💎 **Recurso**: Materiais valiosos
- 🌀 **Portal**: Teleportes e entradas
- ❓ **Quest**: Objetivos de missão

#### 📑 Estratégias de Camadas
- **Background**: Sempre para o mapa base
- **Terrain**: Para posições básicas e terreno
- **Objects**: Para elementos móveis e dinâmicos
- **Camadas adicionais**: Para situações específicas
- **Opacidade**: Use para destacar ou suavizar camadas

#### ⚡ Uso Eficiente das Linhas Temporárias com Fade Progressivo
- **Comunicação rápida**: Para apontar elementos específicos com rastro visual
- **Coordenação**: Durante execução de estratégias
- **Feedback visual**: Para mostrar movimentos ou direções com efeito de rastro
- **Tempo limitado**: Aproveite os 3 segundos de duração por segmento
- **Desenho contínuo**: Agora funciona como uma linha contínua
- **Fade progressivo**: Linhas que se desfazem do início ao fim

#### 🔍 Uso Eficiente do Zoom e Pan
- **Zoom estratégico**: Use zoom alto para detalhes e baixo para visão geral
- **Pan eficiente**: Combine zoom e pan para navegar rapidamente
- **Precisão**: Use zoom alto para desenhar com precisão
- **Colaboração**: Todos os jogadores veem o mesmo zoom e pan
- **Reset rápido**: Use o botão 🎯 para voltar ao estado inicial
- **Atalhos**: Ctrl+clique para pan, botões para zoom

#### 💬 Uso Eficiente do Chat
- **Comunicação estratégica**: Use chat para coordenar ações
- **Nomes descritivos**: Use nomes que identifiquem sua função
- **Mensagens claras**: Seja objetivo nas comunicações
- **Histórico**: Use o scroll para revisar mensagens anteriores
- **Colapsar quando necessário**: Oculte o chat para mais espaço de trabalho
- **Atalhos**: Enter para enviar, Tab para navegar

#### 🔐 Uso Eficiente das Permissões
- **Compartilhamento estratégico**: Use links de visualizador para apresentações
- **Colaboração controlada**: Use links de editor apenas para colaboradores
- **Segurança**: Sempre verifique o tipo de link antes de compartilhar
- **Indicadores visuais**: Observe o badge de permissão para confirmar acesso
- **Interface adaptativa**: Aproveite a interface simplificada para visualizadores
- **Comunicação clara**: Informe aos usuários sobre suas permissões

#### 💾 Uso Eficiente da Exportação/Importação
- **Backup regular**: Exporte sessões importantes regularmente
- **Compartilhamento**: Use arquivos JSON para compartilhar estratégias
- **Organização**: Mantenha arquivos com nomes descritivos
- **Validação**: Sempre verifique se a importação foi bem-sucedida
- **Backup antes de importar**: Exporte sessão atual antes de importar nova
- **Arquivos portáveis**: JSON pode ser aberto em qualquer editor de texto

#### 🔧 Otimização da Interface
- **Toolbar**: Ajuste para 250-300px para melhor visualização
- **Painel de camadas**: Use 300-400px para gerenciamento confortável
- **Canvas**: Deixe espaço suficiente para desenhar
- **Responsividade**: Teste em diferentes dispositivos

### 14. Solução de Problemas

#### ❌ Problemas Comuns
1. **Desenhos não aparecem**
   - Verifique se a camada está visível
   - Confirme se a camada não está bloqueada
   - Verifique se a opacidade não está em 0%

2. **Sincronização não funciona**
   - Recarregue a página
   - Verifique a conexão de internet
   - Confirme se o servidor está rodando

3. **Mapa não carrega**
   - Verifique se `public/mapa-tw.png` existe
   - Confirme se o arquivo não está corrompido

4. **Camadas não funcionam**
   - Verifique se a camada não está bloqueada
   - Confirme se a camada está visível
   - Selecione uma camada ativa

5. **Linhas temporárias não aparecem**
   - Verifique se a ferramenta ⚡ está selecionada
   - Confirme se a conexão está ativa
   - Aguarde 3 segundos para ver se aparecem

6. **Painel de camadas não responde**
   - Verifique se o painel está aberto (botão ▶)
   - Confirme se não há erros no console
   - Tente recarregar a página

7. **Redimensionamento não funciona**
   - Verifique se os handles estão visíveis (barras douradas)
   - Confirme se não há conflitos de CSS
   - Tente recarregar a página
   - Verifique se não há outros elementos sobrepondo

8. **Interface não se adapta**
   - Verifique se o CSS está carregado corretamente
   - Teste em diferentes navegadores
   - Confirme se não há cache antigo

9. **Fade progressivo não funciona**
   - Verifique se os segmentos estão sendo criados corretamente
   - Confirme se o sistema de tempo está funcionando
   - Teste a sincronização entre jogadores
   - Verifique se as linhas estão sendo desenhadas continuamente

10. **Zoom não funciona**
    - Verifique se os botões de zoom estão visíveis
    - Confirme se o canvas está carregado corretamente
    - Teste os limites de zoom (10% a 500%)
    - Verifique se as transformações estão sendo aplicadas

11. **Pan não funciona**
    - Verifique se está segurando Ctrl (ou Cmd no Mac)
    - Confirme se o mouse está sobre o canvas
    - Teste se o evento de mouse está sendo capturado
    - Verifique se as coordenadas estão sendo calculadas corretamente

12. **Chat não aparece**
    - Verifique se o painel de chat está visível no canto inferior direito
    - Confirme se o nome foi definido corretamente
    - Teste se a conexão com o servidor está ativa
    - Verifique se não há erros no console

13. **Mensagens não sincronizam**
    - Verifique se a conexão de internet está estável
    - Confirme se todos os jogadores estão na mesma sessão
    - Teste se o servidor está rodando corretamente
    - Verifique se as mensagens estão sendo enviadas

14. **Nome não aparece**
    - Verifique se o nome foi definido corretamente
    - Confirme se não há caracteres especiais problemáticos
    - Teste se o evento de nome foi enviado ao servidor
    - Verifique se outros jogadores receberam a atualização

15. **Permissões não funcionam**
    - Verifique se o link contém o parâmetro `role`
    - Confirme se a role está definida como 'editor' ou 'viewer'
    - Teste se a interface está adaptada à permissão
    - Verifique se os elementos corretos estão desabilitados

16. **Modal de permissão não aparece**
    - Verifique se o botão "Compartilhar Link" está funcionando
    - Confirme se não há erros no console
    - Teste se o modal está sendo renderizado corretamente
    - Verifique se os estilos CSS estão carregados

17. **Links de permissão não funcionam**
    - Verifique se o link foi copiado corretamente
    - Confirme se o parâmetro `role` está presente na URL
    - Teste se a sessão existe e está ativa
    - Verifique se o servidor está processando as roles corretamente

18. **Exportação não funciona**
    - Verifique se há dados para exportar
    - Confirme se o navegador permite downloads
    - Teste se o arquivo foi criado corretamente
    - Verifique se não há erros no console

19. **Importação não funciona**
    - Verifique se o arquivo JSON é válido
    - Confirme se a estrutura do arquivo está correta
    - Teste se os dados foram carregados completamente
    - Verifique se não há erros de parsing

20. **Dados não são preservados**
    - Verifique se todos os dados foram incluídos na exportação
    - Confirme se a importação carregou todos os elementos
    - Teste se as camadas foram restauradas corretamente
    - Verifique se o chat e desenhos foram preservados

#### 🔧 Debug
- Abra o console do navegador (F12)
- Verifique mensagens de erro
- Teste a conexão WebSocket
- Verifique se todas as dependências estão instaladas
- Teste os handles de redimensionamento
- Verifique se as linhas temporárias estão sendo criadas
- Teste o sistema de segmentos das linhas temporárias

### 15. Recursos Avançados

#### 🎨 Personalização
- **Cores**: Edite as variáveis CSS em `src/index.css`
- **Ícones**: Modifique o objeto `icons` em `src/App.tsx`
- **Duração das linhas**: Altere o valor em `src/App.tsx`
- **Tamanho do canvas**: Ajuste em `src/App.tsx`
- **Limites de redimensionamento**: Modifique em `src/App.tsx`

#### 🔧 Configuração
- **Porta do servidor**: Modifique em `server/index.js`