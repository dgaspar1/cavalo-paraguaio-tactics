const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Armazenar sessões
const sessions = {};

// Rota principal
app.get('/', (req, res) => {
  res.json({ message: 'Perfect World Tactics Server' });
});

// Rota para verificar sessões
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];
  
  if (session) {
    res.json({
      exists: true,
      players: session.players.length,
      sessionId
    });
  } else {
    res.json({
      exists: false,
      sessionId
    });
  }
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // Entrar em uma sessão
  socket.on('join-session', (data) => {
    const { sessionId, playerId } = data;
    
    // Criar sessão se não existir
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        players: [],
        drawings: [],
        layers: {}, // Armazenar dados das camadas por sessão
        messages: [] // Adicionar array de mensagens
      };
    }

    const session = sessions[sessionId];
    
    // Adicionar jogador à sessão
    const player = {
      id: playerId,
      name: `Jogador ${sessions[sessionId].players.length + 1}`,
      color: getRandomColor(),
      role: data.role || 'viewer' // Adicionar role do jogador
    };

    session.players.push(player);
    socket.join(sessionId);

    // Notificar outros jogadores
    socket.to(sessionId).emit('player-joined', player);

    // Enviar lista de jogadores para o novo jogador
    socket.emit('session-info', {
      players: session.players,
      sessionId
    });

    // Enviar mensagens existentes para o novo jogador
    socket.emit('chat-history', session.messages);

    console.log(`Jogador ${playerId} entrou na sessão ${sessionId}`);
  });

  // Receber desenhos
  socket.on('drawing', (data) => {
    const { sessionId, type, playerId, layerId } = data;
    const session = sessions[sessionId];

    if (session) {
      // Armazenar desenho na sessão com informação da camada
      session.drawings.push({
        ...data,
        timestamp: Date.now()
      });

      // Enviar para outros jogadores na mesma sessão
      socket.to(sessionId).emit('drawing-update', data);
    }
  });

  // Gerenciamento de camadas
  socket.on('layer-update', (data) => {
    const { sessionId, layerId, action, layerData } = data;
    const session = sessions[sessionId];

    if (session) {
      // Armazenar informações da camada
      if (!session.layers[layerId]) {
        session.layers[layerId] = {};
      }

      switch (action) {
        case 'create':
          session.layers[layerId] = layerData;
          break;
        case 'update':
          session.layers[layerId] = { ...session.layers[layerId], ...layerData };
          break;
        case 'delete':
          delete session.layers[layerId];
          break;
      }

      // Enviar atualização para outros jogadores
      socket.to(sessionId).emit('layer-update', data);
    }
  });

  // Handler para mensagens de chat
  socket.on('chat-message', (data) => {
    const { sessionId, message } = data;
    const session = sessions[sessionId];

    if (session) {
      // Armazenar mensagem
      session.messages.push(message);

      // Transmitir para outros jogadores
      socket.to(sessionId).emit('chat-message', { message });
    }
  });

  // Handler para atualização de nome do jogador
  socket.on('player-name', (data) => {
    const { sessionId, playerId, name } = data;
    const session = sessions[sessionId];

    if (session) {
      // Atualizar nome do jogador
      const player = session.players.find(p => p.id === playerId);
      if (player) {
        player.name = name;
      }

      // Transmitir para outros jogadores
      socket.to(sessionId).emit('player-name', { playerId, name });
    }
  });

  // Desconexão
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    
    // Remover jogador de todas as sessões
    for (const sessionId of Object.keys(sessions)) {
      const session = sessions[sessionId];
      const playerIndex = session.players.findIndex(p => p.socketId === socket.id);
      
      if (playerIndex !== -1) {
        const player = session.players[playerIndex];
        session.players.splice(playerIndex, 1);
        
        // Notificar outros jogadores
        socket.to(sessionId).emit('player-left', player.id);
        
        // Remover sessão se estiver vazia
        if (session.players.length === 0) {
          delete sessions[sessionId];
          console.log(`Sessão ${sessionId} removida (vazia)`);
        }
        
        break;
      }
    }
  });

  // Ping para manter conexão
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Função para gerar cor aleatória
function getRandomColor() {
  const colors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ffa500', '#800080', '#008000', '#ffc0cb', '#a52a2a', '#ffffff'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Limpar sessões inativas periodicamente
setInterval(() => {
  const now = Date.now();
  Object.keys(sessions).forEach(sessionId => {
    const session = sessions[sessionId];
    // Remover sessões sem atividade por mais de 1 hora
    const lastActivity = Math.max(...session.drawings.map(d => d.timestamp), 0);
    if (now - lastActivity > 3600000 && session.players.length === 0) {
      delete sessions[sessionId];
      console.log(`Sessão ${sessionId} removida por inatividade`);
    }
  });
}, 300000); // Verificar a cada 5 minutos

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Servidor Cavalo Paraguayo Tactics rodando na porta ${PORT}`);
  console.log(`📊 Sessões ativas: ${Object.keys(sessions).length}`);
}); 