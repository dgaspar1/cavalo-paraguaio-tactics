import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

interface Player {
    id: string;
    name: string;
    color: string;
    role: 'editor' | 'viewer';
}

interface DrawingData {
    type: 'draw' | 'clear' | 'icon' | 'unit' | 'temp-line';
    data: any;
    playerId: string;
    layerId: string;
}

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

type Tool = 'brush' | 'eraser' | 'text' | 'icon' | 'temp-line' | 'unit';
type IconType = 'mob' | 'npc' | 'resource' | 'boss' | 'portal' | 'quest';

const App: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [sessionId, setSessionId] = useState<string>('');
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentTool, setCurrentTool] = useState<Tool>('brush');
    const [currentColor, setCurrentColor] = useState<string>('#ff0000');
    const [brushSize, setBrushSize] = useState<number>(5);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [selectedIcon, setSelectedIcon] = useState<IconType>('mob');
    const [selectedUnitType, setSelectedUnitType] = useState('tank');
    const [layers, setLayers] = useState<Layer[]>([]);
    const [activeLayerId, setActiveLayerId] = useState<string>('');
    const [showLayerManager, setShowLayerManager] = useState<boolean>(true);
    const [editingLayerId, setEditingLayerId] = useState<string>('');
    const [editingLayerName, setEditingLayerName] = useState<string>('');
    const [tempLines, setTempLines] = useState<TempLine[]>([]);
    const [dragLayerId, setDragLayerId] = useState<string>('');

    // Sistema de zoom e pan
    const [zoom, setZoom] = useState<number>(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [lastPanPos, setLastPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Sistema de chat
    const [messages, setMessages] = useState<Array<{
        id: string;
        playerId: string;
        playerName: string;
        playerColor: string;
        text: string;
        timestamp: number;
    }>>([]);
    const [chatInput, setChatInput] = useState<string>('');
    const [showChat, setShowChat] = useState<boolean>(true);
    const [playerName, setPlayerName] = useState<string>('');
    const [showNameInput, setShowNameInput] = useState<boolean>(true);

    // Sistema de permissões
    const [playerRole, setPlayerRole] = useState<'editor' | 'viewer'>('editor');
    const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
    const [selectedPermission, setSelectedPermission] = useState<'editor' | 'viewer'>('editor');

    // Sistema de exportação/importação
    const [showExportModal, setShowExportModal] = useState<boolean>(false);
    const [showImportModal, setShowImportModal] = useState<boolean>(false);
    const [importData, setImportData] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Redimensionamento
    const [toolbarWidth, setToolbarWidth] = useState<number>(280);
    const [layersPanelWidth, setLayersPanelWidth] = useState<number>(300);
    const [isResizingToolbar, setIsResizingToolbar] = useState<boolean>(false);

    // Sistema de carregamento de ícones
    const [loadedIcons, setLoadedIcons] = useState<{ [key: string]: HTMLImageElement }>({});
    const [iconsLoaded, setIconsLoaded] = useState<boolean>(false);
    const [isResizingLayers, setIsResizingLayers] = useState<boolean>(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const backgroundImageRef = useRef<HTMLImageElement | null>(null);
    const playerId = useRef<string>(uuidv4());
    const tempLineTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const currentTempLine = useRef<TempLine | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const syncTimeout = useRef<NodeJS.Timeout | null>(null);

    const colors = [
        '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
        '#ffa500', '#800080', '#008000', '#ffc0cb', '#a52a2a', '#ffffff'
    ];

    const icons = {
        mob: '👹',
        npc: '👤',
        resource: '💎',
        boss: '👺',
        portal: '🌀',
        quest: '❓'
    };

    // Sistema de ícones do Perfect World para unidades táticas
    const pwUnitTypes = {
        // Tanks
        tank: {
            name: 'Tank',
            iconPath: '/icones_pw_180/classe_guerreiro.png',
            description: 'Unidade de defesa e proteção',
            color: '#4A90E2'
        },
        // DPS
        assassin: {
            name: 'Assassino',
            iconPath: '/icones_pw_180/classe_assassino.png',
            description: 'Dano furtivo e crítico',
            color: '#D0021B'
        },
        swordsman: {
            name: 'Espadachim',
            iconPath: '/icones_pw_180/classe_espadachim.png',
            description: 'Dano corpo a corpo',
            color: '#9013FE'
        },
        // Healers
        healer: {
            name: 'Curandeiro',
            iconPath: '/icones_pw_180/classe_espirito_alado.png',
            description: 'Cura e suporte',
            color: '#7ED321'
        },
        // Support
        support: {
            name: 'Suporte',
            iconPath: '/icones_pw_180/classe_fada.png',
            description: 'Buffs e debuffs',
            color: '#F5A623'
        },
        bard: {
            name: 'Bardo',
            iconPath: '/icones_pw_180/bardo_normal.ico',
            description: 'Música e inspiração',
            color: '#BD10E0'
        },
        // Ranged
        archer: {
            name: 'Arqueiro',
            iconPath: '/icones_pw_180/classe_arqueiro_alado.png',
            description: 'Dano à distância',
            color: '#50E3C2'
        },
        // Magic
        mage: {
            name: 'Mago',
            iconPath: '/icones_pw_180/classe_mago.png',
            description: 'Magia elemental',
            color: '#4A90E2'
        },
        warlock: {
            name: 'Bruxo',
            iconPath: '/icones_pw_180/classe_bruxo.png',
            description: 'Magia sombria',
            color: '#8B572A'
        },
        lunar: {
            name: 'Imortal Lunar',
            iconPath: '/icones_pw_180/classe_imortal_lunar.png',
            description: 'Magia lunar',
            color: '#F8E71C'
        },
        // Agile
        agile: {
            name: 'Ágil',
            iconPath: '/icones_pw_180/classe_macaco.png',
            description: 'Velocidade e esquiva',
            color: '#F5A623'
        },
        wasp: {
            name: 'Vespa',
            iconPath: '/icones_pw_180/classe_vespa_alada.png',
            description: 'Ataque rápido',
            color: '#D0021B'
        },
        // Control
        controller: {
            name: 'Controlador',
            iconPath: '/icones_pw_180/classe_espirito_encantador.png',
            description: 'Controle de multidões',
            color: '#9013FE'
        },
        // Special
        divine: {
            name: 'Máquina Divina',
            iconPath: '/icones_pw_180/classe_maquina_divina.png',
            description: 'Tecnologia avançada',
            color: '#50E3C2'
        },
        beast: {
            name: 'Bestial',
            iconPath: '/icones_pw_180/classe_bestial.png',
            description: 'Força bruta',
            color: '#8B572A'
        }
    };

    // Inicializar camadas
    useEffect(() => {
        const createLayer = (name: string): Layer => {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            return {
                id: uuidv4(),
                name,
                visible: true,
                locked: false,
                opacity: 1,
                canvas
            };
        };

        // Não criar camadas automaticamente - aguardar layers-state
        console.log('📋 Aguardando layers-state do servidor...');
    }, []);

    // Carregar imagem de fundo
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            backgroundImageRef.current = img;
            redrawCanvas();
        };
        img.src = '/mapa-tw.png';
    }, []);

    // Carregar ícones das unidades
    useEffect(() => {
        const loadIcons = async () => {
            const iconPromises = Object.entries(pwUnitTypes).map(([key, unit]) => {
                return new Promise<[string, HTMLImageElement]>((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve([key, img]);
                    img.onerror = () => reject(new Error(`Falha ao carregar ícone: ${unit.iconPath}`));
                    img.src = unit.iconPath;
                });
            });

            try {
                const loadedIconsArray = await Promise.all(iconPromises);
                const iconsMap: { [key: string]: HTMLImageElement } = {};
                loadedIconsArray.forEach(([key, img]) => {
                    iconsMap[key] = img;
                });
                setLoadedIcons(iconsMap);
                setIconsLoaded(true);
                console.log('✅ Ícones das unidades carregados com sucesso');
            } catch (error) {
                console.error('❌ Erro ao carregar ícones:', error);
            }
        };

        loadIcons();
    }, []);

    // Limpar linhas temporárias
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setTempLines(prev => prev.filter(line => {
                // Verificar se todos os segmentos da linha ainda são válidos
                const validSegments = line.segments.filter(segment =>
                    now - segment.timestamp < 3000
                );

                // Se ainda há segmentos válidos, atualizar a linha
                if (validSegments.length > 0) {
                    line.segments = validSegments;
                    return true;
                }

                // Se não há mais segmentos válidos, remover a linha
                return false;
            }));
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Event listeners para redimensionamento e controle de desenho
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingToolbar) {
                const newWidth = Math.max(200, Math.min(500, e.clientX));
                setToolbarWidth(newWidth);
            }
            if (isResizingLayers) {
                const newWidth = Math.max(250, Math.min(600, window.innerWidth - e.clientX));
                setLayersPanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizingToolbar(false);
            setIsResizingLayers(false);
            // Parar o desenho quando o botão do mouse for solto em qualquer lugar
            if (isDrawing) {
                stopDrawing();
            }
        };

        if (isResizingToolbar || isResizingLayers || isDrawing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingToolbar, isResizingLayers, isDrawing]);

    useEffect(() => {
        // Gerar sessionId se não existir
        const urlParams = new URLSearchParams(window.location.search);
        const sessionFromUrl = urlParams.get('session');
        const roleFromUrl = urlParams.get('role') as 'editor' | 'viewer' || 'editor';

        if (sessionFromUrl) {
            setSessionId(sessionFromUrl);
            setPlayerRole(roleFromUrl);
        } else {
            const newSessionId = uuidv4();
            setSessionId(newSessionId);
            setPlayerRole('editor'); // Criador da sessão é sempre editor
            window.history.replaceState({}, '', `?session=${newSessionId}&role=editor`);
        }

        // Conectar ao servidor
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('🔗 Conectado ao servidor');
            console.log('📤 Enviando join-session:', {
                sessionId: sessionFromUrl || sessionId,
                playerId: playerId.current,
                role: roleFromUrl
            });
            newSocket.emit('join-session', {
                sessionId: sessionFromUrl || sessionId,
                playerId: playerId.current,
                role: roleFromUrl
            });
        });

        newSocket.on('session-info', (data: { players: Player[]; sessionId: string }) => {
            console.log('📋 SESSION-INFO recebido:', data);
            setPlayers(data.players.filter(p => p.id !== playerId.current));

            // Se somos o primeiro jogador e não temos camadas, criar uma camada padrão
            if (data.players.length === 1 && layers.length === 0) {
                console.log('👤 Primeiro jogador na sessão, criando camada padrão...');
                const defaultLayer: Layer = {
                    id: uuidv4(),
                    name: 'Camada Principal',
                    visible: true,
                    locked: false,
                    opacity: 1,
                    canvas: (() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 800;
                        canvas.height = 600;
                        return canvas;
                    })()
                };

                setLayers([defaultLayer]);
                setActiveLayerId(defaultLayer.id);

                // Sincronizar a nova camada com o servidor
                setTimeout(() => {
                    syncLayersState();
                }, 500);
            } else if (data.players.length > 1) {
                console.log('🔄 Sincronizando camadas com outros jogadores...');
                setTimeout(() => {
                    syncLayersState();
                }, 1000); // Aguardar 1 segundo para garantir que tudo foi inicializado
            } else {
                console.log('👤 Aguardando camadas serem criadas...');
            }
        });

        newSocket.on('player-joined', (player: Player) => {
            setPlayers(prev => [...prev, player]);
        });

        newSocket.on('player-left', (playerId: string) => {
            setPlayers(prev => prev.filter(p => p.id !== playerId));
        });

        newSocket.on('drawing-update', (data: DrawingData) => {
            console.log('🎨 DRAWING-UPDATE recebido:', data);
            if (data.playerId !== playerId.current) {
                console.log('🔄 Processando desenho remoto em tempo real...');
                handleRemoteDrawing(data);
            } else {
                console.log('⏭️ Pulando desenho próprio em tempo real');
            }
        });

        newSocket.on('chat-message', (data: { message: any }) => {
            if (data.message.playerId !== playerId.current) {
                setMessages(prev => [...prev, data.message]);
            }
        });

        newSocket.on('player-name', (data: { playerId: string; name: string }) => {
            if (data.playerId !== playerId.current) {
                setPlayers(prev => prev.map(player =>
                    player.id === data.playerId
                        ? { ...player, name: data.name }
                        : player
                ));
            }
        });

        // Receber histórico de desenhos ao entrar na sessão
        newSocket.on('drawing-history', (drawings: DrawingData[]) => {
            console.log('📜 DRAWING-HISTORY recebido:', drawings.length, 'desenhos');
            console.log('📜 Detalhes dos desenhos:', drawings);

            // Aguardar um pouco para garantir que as camadas foram criadas
            setTimeout(() => {
                drawings.forEach((drawing, index) => {
                    console.log(`📜 Processando desenho ${index + 1}:`, drawing);
                    if (drawing.playerId !== playerId.current) {
                        console.log('🔄 Processando desenho remoto...');
                        handleRemoteDrawing(drawing);
                    } else {
                        console.log('⏭️ Pulando desenho próprio');
                    }
                });
            }, 500); // Aguardar 500ms para as camadas serem criadas
        });

        // Receber estado das camadas ao entrar na sessão
        newSocket.on('layers-state', (layersState: any) => {
            console.log('📑 LAYERS-STATE recebido:', layersState);
            console.log('📋 Estado atual das camadas locais:', layers.length, 'camadas');

            // Se já temos camadas locais, não criar novas
            if (layers.length > 0) {
                console.log('📋 Já existem camadas locais, apenas sincronizando dados...');
                Object.entries(layersState).forEach(([layerId, layerData]: [string, any]) => {
                    console.log(`📑 Processando camada ${layerId}:`, layerData);
                    const existingLayer = layers.find(l => l.id === layerId);

                    // Carregar dados do canvas se disponível
                    if (existingLayer && layerData.canvasData) {
                        console.log(`🔄 Carregando dados do canvas para camada ${layerId}`);
                        const img = new Image();
                        img.onload = () => {
                            const ctx = existingLayer.canvas.getContext('2d');
                            if (ctx) {
                                ctx.clearRect(0, 0, existingLayer.canvas.width, existingLayer.canvas.height);
                                ctx.drawImage(img, 0, 0);
                                redrawCanvas();
                                console.log(`✅ Canvas da camada ${layerId} atualizado`);
                            }
                        };
                        img.src = layerData.canvasData;
                    } else if (!existingLayer) {
                        console.log(`⚠️ Camada ${layerId} não encontrada localmente`);
                    }
                });
            } else {
                console.log('📋 Criando camadas a partir do estado recebido...');
                const newLayers: Layer[] = [];

                // Se não há camadas no servidor, aguardar
                if (Object.keys(layersState).length === 0) {
                    console.log('📋 Nenhuma camada no servidor, aguardando criação...');
                } else {
                    // Sincronizar camadas existentes
                    Object.entries(layersState).forEach(([layerId, layerData]: [string, any]) => {
                        console.log(`📑 Processando camada ${layerId}:`, layerData);

                        console.log(`🆕 Criando nova camada ${layerId} com nome: ${layerData.name || 'Camada Sincronizada'}`);
                        const newLayer: Layer = {
                            id: layerId,
                            name: layerData.name || 'Camada Sincronizada',
                            visible: layerData.visible !== undefined ? layerData.visible : true,
                            locked: layerData.locked !== undefined ? layerData.locked : false,
                            opacity: layerData.opacity !== undefined ? layerData.opacity : 1,
                            canvas: (() => {
                                const canvas = document.createElement('canvas');
                                canvas.width = 800;
                                canvas.height = 600;
                                return canvas;
                            })()
                        };

                        newLayers.push(newLayer);

                        // Carregar dados do canvas se disponível
                        if (layerData.canvasData) {
                            console.log(`🔄 Carregando dados do canvas para camada ${layerId}`);
                            const img = new Image();
                            img.onload = () => {
                                const ctx = newLayer.canvas.getContext('2d');
                                if (ctx) {
                                    ctx.clearRect(0, 0, newLayer.canvas.width, newLayer.canvas.height);
                                    ctx.drawImage(img, 0, 0);
                                    console.log(`✅ Canvas da camada ${layerId} atualizado`);
                                }
                            };
                            img.src = layerData.canvasData;
                        }
                    });
                }

                // Atualizar todas as camadas de uma vez
                if (newLayers.length > 0) {
                    console.log(`🔄 Definindo ${newLayers.length} camadas sincronizadas`);
                    setLayers(newLayers);
                    setActiveLayerId(newLayers[0].id);
                    console.log(`✅ Camadas sincronizadas definidas. Camada ativa: ${newLayers[0].id}`);
                }
            }
        });

        // Receber atualizações de camadas
        newSocket.on('layer-update', (data: { layerId: string; action: string; layerData: any }) => {
            console.log('📑 LAYER-UPDATE recebido:', data);

            if (data.action === 'create') {
                console.log('🆕 Recebendo criação de nova camada:', data.layerId);
                // A camada já foi criada no layers-state, então só precisamos atualizar se necessário
            } else if (data.action === 'update') {
                console.log('🔄 Recebendo atualização de camada:', data.layerId);
                let existingLayer = layers.find(l => l.id === data.layerId);

                // Se a camada não existe, criar uma nova
                if (!existingLayer) {
                    console.log('🆕 Criando nova camada a partir de layer-update:', data.layerId);

                    // Verificar se já existe uma camada com este ID (evitar duplicatas)
                    const existingLayerWithId = layers.find(l => l.id === data.layerId);
                    if (existingLayerWithId) {
                        console.log('⚠️ Camada já existe, usando existente:', data.layerId);
                        existingLayer = existingLayerWithId;
                    } else {
                        const newLayer: Layer = {
                            id: data.layerId,
                            name: data.layerData.name || 'Camada Sincronizada',
                            visible: data.layerData.visible !== undefined ? data.layerData.visible : true,
                            locked: data.layerData.locked !== undefined ? data.layerData.locked : false,
                            opacity: data.layerData.opacity !== undefined ? data.layerData.opacity : 1,
                            canvas: (() => {
                                const canvas = document.createElement('canvas');
                                canvas.width = 800;
                                canvas.height = 600;
                                return canvas;
                            })()
                        };

                        setLayers(prev => [...prev, newLayer]);
                        existingLayer = newLayer;
                        console.log('✅ Nova camada criada:', data.layerId);
                    }
                }

                // Atualizar dados do canvas se disponível
                if (existingLayer && data.layerData.canvasData) {
                    console.log('🔄 Atualizando canvas da camada:', data.layerId);
                    const img = new Image();
                    img.onload = () => {
                        const ctx = existingLayer.canvas.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, existingLayer.canvas.width, existingLayer.canvas.height);
                            ctx.drawImage(img, 0, 0);
                            redrawCanvas();
                            console.log(`✅ Canvas da camada ${data.layerId} atualizado via layer-update`);
                        }
                    };
                    img.src = data.layerData.canvasData;
                }
            }
        });

        return () => {
            newSocket.disconnect();
            if (syncTimeout.current) {
                clearTimeout(syncTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = 800;
        canvas.height = 600;

        const context = canvas.getContext('2d');
        if (context) {
            context.lineCap = 'round';
            context.strokeStyle = currentColor;
            context.lineWidth = brushSize;
            contextRef.current = context;
        }
    }, []);

    // Atualizar contexto quando ferramenta ou cor mudar
    useEffect(() => {
        // Atualizar cursor do canvas baseado na ferramenta
        const canvas = canvasRef.current;
        if (canvas) {
            if (currentTool === 'eraser') {
                canvas.style.cursor = 'crosshair';
            } else if (currentTool === 'icon' || currentTool === 'unit') {
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'crosshair';
            }
        }
    }, [currentTool, currentColor, brushSize]);

    // Redesenhar canvas com todas as camadas
    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;

        // Limpar canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Aplicar transformações de zoom e pan
        context.save();
        context.translate(pan.x, pan.y);
        context.scale(zoom, zoom);

        // Resetar configurações do contexto para o redesenho
        context.globalCompositeOperation = 'source-over';
        context.globalAlpha = 1;

        // Desenhar imagem de fundo
        if (backgroundImageRef.current) {
            context.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
        }

        // Desenhar camadas visíveis
        layers.forEach(layer => {
            if (layer.visible) {
                context.globalAlpha = layer.opacity;
                context.drawImage(layer.canvas, 0, 0);
            }
        });

        // Resetar opacidade
        context.globalAlpha = 1;

        // Desenhar linhas temporárias com fade progressivo
        const now = Date.now();
        tempLines.forEach(line => {
            if (line.segments.length < 2) return;

            // Desenhar cada segmento com opacidade baseada no tempo
            for (let i = 0; i < line.segments.length - 1; i++) {
                const segment = line.segments[i];
                const nextSegment = line.segments[i + 1];

                // Calcular opacidade baseada no tempo do segmento
                const segmentAge = now - segment.timestamp;
                const alpha = Math.max(0, 1 - segmentAge / 3000);

                if (alpha > 0) {
                    context.globalAlpha = alpha;
                    context.strokeStyle = line.color;
                    context.lineWidth = 3;
                    context.beginPath();
                    context.moveTo(segment.x, segment.y);
                    context.lineTo(nextSegment.x, nextSegment.y);
                    context.stroke();
                }
            }
        });

        // Restaurar contexto
        context.restore();
    };

    // Atualizar redraw quando camadas ou linhas temporárias mudarem
    useEffect(() => {
        redrawCanvas();
    }, [layers, tempLines]);

    const handleRemoteDrawing = (data: DrawingData) => {
        console.log('🔄 HANDLE-REMOTE-DRAWING:', data);

        if (data.type === 'temp-line') {
            console.log('⚡ Processando linha temporária...');
            // Adicionar linha temporária
            setTempLines(prev => {
                const existingLine = prev.find(line => line.id === data.data.lineId);

                if (existingLine) {
                    // Adicionar novo segmento à linha existente
                    existingLine.segments.push({
                        x: data.data.x,
                        y: data.data.y,
                        timestamp: Date.now()
                    });
                    return [...prev];
                } else {
                    // Criar nova linha
                    return [...prev, {
                        id: data.data.lineId,
                        playerId: data.playerId,
                        startX: data.data.x,
                        startY: data.data.y,
                        endX: data.data.x,
                        endY: data.data.y,
                        color: data.data.color,
                        timestamp: Date.now(),
                        segments: [{
                            x: data.data.x,
                            y: data.data.y,
                            timestamp: Date.now()
                        }]
                    }];
                }
            });
            return;
        }

        console.log(`🔍 Procurando camada ${data.layerId}...`);
        console.log(`📋 Camadas locais disponíveis:`, layers.map(l => ({ id: l.id, name: l.name })));
        const layer = layers.find(l => l.id === data.layerId);
        if (!layer || layer.locked) {
            console.log(`❌ Camada ${data.layerId} não encontrada ou bloqueada`);
            return;
        }

        console.log(`✅ Camada ${data.layerId} encontrada`);
        const layerContext = layer.canvas.getContext('2d');
        if (!layerContext) {
            console.log(`❌ Contexto da camada ${data.layerId} não disponível`);
            return;
        }

        switch (data.type) {
            case 'draw':
                layerContext.beginPath();
                layerContext.moveTo(data.data.startX, data.data.startY);
                layerContext.lineTo(data.data.endX, data.data.endY);

                // Verificar se é uma operação de borracha
                if (data.data.isEraser) {
                    layerContext.globalCompositeOperation = 'destination-out';
                    layerContext.strokeStyle = 'rgba(0,0,0,1)';
                } else {
                    layerContext.globalCompositeOperation = 'source-over';
                    layerContext.strokeStyle = data.data.color || currentColor;
                }

                layerContext.stroke();
                break;
            case 'clear':
                layerContext.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                break;
            case 'icon':
                layerContext.font = '24px Arial';
                layerContext.fillText(icons[data.data.iconType as IconType], data.data.x, data.data.y);
                break;
            case 'unit':
                const unitType = pwUnitTypes[data.data.iconType as keyof typeof pwUnitTypes];
                if (unitType && loadedIcons[data.data.iconType]) {
                    const iconSize = 32;
                    layerContext.drawImage(
                        loadedIcons[data.data.iconType],
                        data.data.x - iconSize / 2,
                        data.data.y - iconSize / 2,
                        iconSize,
                        iconSize
                    );

                    layerContext.font = '12px Arial';
                    layerContext.fillStyle = '#000';
                    layerContext.fillText(unitType.name, data.data.x, data.data.y + iconSize / 2 + 15);
                }
                break;
        }

        redrawCanvas();
    };

    // Função para sincronizar estado das camadas
    const syncLayersState = () => {
        console.log('🔄 SYNC-LAYERS-STATE chamado com', layers.length, 'camadas');
        if (socket && layers.length > 0) {
            // Sincronizar apenas a camada ativa para evitar spam
            const activeLayer = layers.find(l => l.id === activeLayerId);
            if (activeLayer) {
                console.log('📤 Sincronizando camada ativa:', activeLayer.id, activeLayer.name);
                socket.emit('layer-update', {
                    sessionId,
                    layerId: activeLayer.id,
                    action: 'update',
                    layerData: {
                        name: activeLayer.name,
                        visible: activeLayer.visible,
                        locked: activeLayer.locked,
                        opacity: activeLayer.opacity,
                        canvasData: activeLayer.canvas.toDataURL()
                    }
                });
            }
        } else {
            console.log('❌ Socket não disponível ou sem camadas para sincronização');
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (playerRole !== 'editor') return; // Apenas editores podem desenhar

        // Verificar se é o botão esquerdo do mouse (button === 0)
        if (e.button !== 0) return;

        console.log('Iniciando desenho com ferramenta:', currentTool);

        if (currentTool === 'temp-line') {
            setIsDrawing(true);
            const mousePos = getMousePos(e);
            lastMousePos.current = mousePos;

            // Criar nova linha temporária
            const newTempLine: TempLine = {
                id: uuidv4(),
                playerId: playerId.current,
                startX: mousePos.x,
                startY: mousePos.y,
                endX: mousePos.x,
                endY: mousePos.y,
                color: currentColor,
                timestamp: Date.now(),
                segments: [{
                    x: mousePos.x,
                    y: mousePos.y,
                    timestamp: Date.now()
                }]
            };

            currentTempLine.current = newTempLine;
            setTempLines(prev => [...prev, newTempLine]);

            // Enviar início da linha para outros jogadores
            if (socket) {
                socket.emit('drawing', {
                    type: 'temp-line',
                    data: {
                        lineId: newTempLine.id,
                        x: mousePos.x,
                        y: mousePos.y,
                        color: currentColor
                    },
                    playerId: playerId.current,
                    sessionId,
                    layerId: 'temp'
                });
            }
            return;
        }

        const activeLayer = layers.find(l => l.id === activeLayerId);
        if (!activeLayer || activeLayer.locked) return;

        setIsDrawing(true);
        const layerContext = activeLayer.canvas.getContext('2d');
        if (!layerContext) return;

        const mousePos = getMousePos(e);

        layerContext.beginPath();
        layerContext.moveTo(mousePos.x, mousePos.y);

        // Configurar contexto baseado na ferramenta
        if (currentTool === 'eraser') {
            layerContext.globalCompositeOperation = 'destination-out';
            layerContext.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            layerContext.globalCompositeOperation = 'source-over';
            layerContext.strokeStyle = currentColor;
        }

        layerContext.lineWidth = brushSize;
        layerContext.lineCap = 'round';
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || playerRole !== 'editor') return; // Apenas editores podem desenhar

        // Verificar se o botão esquerdo do mouse ainda está pressionado
        if (e.buttons !== 1) {
            stopDrawing();
            return;
        }

        const mousePos = getMousePos(e);

        if (currentTool === 'temp-line') {
            // Adicionar novo segmento à linha temporária atual
            if (currentTempLine.current) {
                const newSegment = {
                    x: mousePos.x,
                    y: mousePos.y,
                    timestamp: Date.now()
                };

                currentTempLine.current.segments.push(newSegment);

                // Atualizar a linha no estado
                setTempLines(prev => prev.map(line =>
                    line.id === currentTempLine.current?.id
                        ? { ...line, segments: [...line.segments, newSegment] }
                        : line
                ));

                // Enviar segmento para outros jogadores
                if (socket) {
                    socket.emit('drawing', {
                        type: 'temp-line',
                        data: {
                            lineId: currentTempLine.current?.id || '',
                            x: mousePos.x,
                            y: mousePos.y,
                            color: currentColor
                        },
                        playerId: playerId.current,
                        sessionId,
                        layerId: 'temp'
                    });
                }
            }
            return;
        }

        const activeLayer = layers.find(l => l.id === activeLayerId);
        if (!activeLayer || activeLayer.locked) return;

        const layerContext = activeLayer.canvas.getContext('2d');
        if (!layerContext) return;

        // Configurar contexto baseado na ferramenta
        if (currentTool === 'eraser') {
            layerContext.globalCompositeOperation = 'destination-out';
            layerContext.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            layerContext.globalCompositeOperation = 'source-over';
            layerContext.strokeStyle = currentColor;
        }

        layerContext.lineWidth = brushSize;
        layerContext.lineCap = 'round';
        layerContext.lineTo(mousePos.x, mousePos.y);
        layerContext.stroke();

        redrawCanvas();

        // Enviar dados para outros jogadores
        if (socket) {
            const drawingData = {
                type: 'draw',
                data: {
                    startX: mousePos.x,
                    startY: mousePos.y,
                    endX: mousePos.x,
                    endY: mousePos.y,
                    isEraser: currentTool === 'eraser',
                    color: currentColor
                },
                playerId: playerId.current,
                sessionId,
                layerId: activeLayerId
            };

            console.log('📤 Enviando desenho:', drawingData);
            socket.emit('drawing', drawingData);

            // Sincronizar a camada apenas quando necessário (não a cada movimento)
            // Usar um debounce para evitar spam
            if (syncTimeout.current) {
                clearTimeout(syncTimeout.current);
            }

            syncTimeout.current = setTimeout(() => {
                const activeLayer = layers.find(l => l.id === activeLayerId);
                if (socket && activeLayer) {
                    console.log('📤 Sincronizando camada após desenho...');
                    socket.emit('layer-update', {
                        sessionId,
                        layerId: activeLayerId,
                        action: 'update',
                        layerData: {
                            name: activeLayer.name,
                            visible: activeLayer.visible,
                            locked: activeLayer.locked,
                            opacity: activeLayer.opacity,
                            canvasData: activeLayer.canvas.toDataURL()
                        }
                    });
                }
            }, 1000); // Sincronizar após 1 segundo de inatividade
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        currentTempLine.current = null;

        // Sincronizar imediatamente quando parar de desenhar
        if (syncTimeout.current) {
            clearTimeout(syncTimeout.current);
        }

        const activeLayer = layers.find(l => l.id === activeLayerId);
        if (socket && activeLayer) {
            console.log('📤 Sincronizando camada ao parar de desenhar...');
            socket.emit('layer-update', {
                sessionId,
                layerId: activeLayerId,
                action: 'update',
                layerData: {
                    name: activeLayer.name,
                    visible: activeLayer.visible,
                    locked: activeLayer.locked,
                    opacity: activeLayer.opacity,
                    canvasData: activeLayer.canvas.toDataURL()
                }
            });
        }
    };

    const clearCanvas = () => {
        if (playerRole !== 'editor') return; // Apenas editores podem limpar

        const activeLayer = layers.find(l => l.id === activeLayerId);
        if (!activeLayer || activeLayer.locked) return;

        const layerContext = activeLayer.canvas.getContext('2d');
        if (!layerContext) return;

        layerContext.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
        redrawCanvas();

        if (socket) {
            socket.emit('drawing', {
                type: 'clear',
                data: {},
                playerId: playerId.current,
                sessionId,
                layerId: activeLayerId
            });
        }
    };

    const addIcon = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if ((currentTool !== 'icon' && currentTool !== 'unit') || playerRole !== 'editor') return;

        const activeLayer = layers.find(l => l.id === activeLayerId);
        if (!activeLayer || activeLayer.locked) return;

        const layerContext = activeLayer.canvas.getContext('2d');
        if (!layerContext) return;

        const mousePos = getMousePos(e);

        if (currentTool === 'unit') {
            // Adicionar unidade tática do PW
            const unitType = pwUnitTypes[selectedUnitType as keyof typeof pwUnitTypes];
            if (unitType && loadedIcons[selectedUnitType]) {
                const iconSize = 32;
                layerContext.drawImage(
                    loadedIcons[selectedUnitType],
                    mousePos.x - iconSize / 2,
                    mousePos.y - iconSize / 2,
                    iconSize,
                    iconSize
                );

                // Adicionar nome da unidade
                layerContext.font = '12px Arial';
                layerContext.fillStyle = '#000';
                layerContext.fillText(unitType.name, mousePos.x, mousePos.y + iconSize / 2 + 15);
            }
        } else {
            // Adicionar ícone normal
            layerContext.font = '24px Arial';
            layerContext.fillText(icons[selectedIcon], mousePos.x, mousePos.y);
        }

        redrawCanvas();

        if (socket) {
            socket.emit('drawing', {
                type: currentTool === 'unit' ? 'unit' : 'icon',
                data: {
                    iconType: currentTool === 'unit' ? selectedUnitType : selectedIcon,
                    x: mousePos.x,
                    y: mousePos.y
                },
                playerId: playerId.current,
                sessionId,
                layerId: activeLayerId
            });
        }
    };

    // Funções de gerenciamento de camadas
    const createLayer = () => {
        if (playerRole !== 'editor') return; // Apenas editores podem criar camadas

        const newLayer: Layer = {
            id: uuidv4(),
            name: `Layer ${layers.length + 1}`,
            visible: true,
            locked: false,
            opacity: 1,
            canvas: (() => {
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 600;
                return canvas;
            })()
        };

        setLayers(prev => [...prev, newLayer]);
        setActiveLayerId(newLayer.id);

        // Sincronizar nova camada com outros jogadores
        if (socket) {
            console.log('📤 Sincronizando nova camada:', newLayer.id);
            socket.emit('layer-update', {
                sessionId,
                layerId: newLayer.id,
                action: 'create',
                layerData: {
                    name: newLayer.name,
                    visible: newLayer.visible,
                    locked: newLayer.locked,
                    opacity: newLayer.opacity,
                    canvasData: newLayer.canvas.toDataURL()
                }
            });
        }
    };

    const deleteLayer = (layerId: string) => {
        if (playerRole !== 'editor' || layers.length <= 1) return; // Apenas editores podem deletar camadas

        setLayers(prev => {
            const newLayers = prev.filter(l => l.id !== layerId);
            if (activeLayerId === layerId) {
                setActiveLayerId(newLayers[0].id);
            }
            return newLayers;
        });
    };

    const toggleLayerVisibility = (layerId: string) => {
        if (playerRole !== 'editor') return; // Apenas editores podem alterar visibilidade

        setLayers(prev => prev.map(layer =>
            layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
        ));
    };

    const toggleLayerLock = (layerId: string) => {
        if (playerRole !== 'editor') return; // Apenas editores podem bloquear camadas

        setLayers(prev => prev.map(layer =>
            layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
        ));
    };

    const updateLayerOpacity = (layerId: string, opacity: number) => {
        if (playerRole !== 'editor') return; // Apenas editores podem alterar opacidade

        setLayers(prev => prev.map(layer =>
            layer.id === layerId ? { ...layer, opacity } : layer
        ));
    };

    const startEditingLayer = (layer: Layer) => {
        if (playerRole !== 'editor') return; // Apenas editores podem renomear camadas

        setEditingLayerId(layer.id);
        setEditingLayerName(layer.name);
    };

    const saveLayerName = () => {
        if (playerRole !== 'editor' || !editingLayerName.trim()) return; // Apenas editores podem salvar nomes

        setLayers(prev => prev.map(layer =>
            layer.id === editingLayerId ? { ...layer, name: editingLayerName.trim() } : layer
        ));
        setEditingLayerId('');
        setEditingLayerName('');
    };

    const moveLayer = (fromIndex: number, toIndex: number) => {
        if (playerRole !== 'editor') return; // Apenas editores podem reordenar camadas

        setLayers(prev => {
            const newLayers = [...prev];
            const [movedLayer] = newLayers.splice(fromIndex, 1);
            newLayers.splice(toIndex, 0, movedLayer);
            return newLayers;
        });
    };

    const copySessionLink = () => {
        setShowPermissionModal(true);
    };

    const generateLink = (permission: 'editor' | 'viewer') => {
        const baseUrl = window.location.origin + window.location.pathname;
        const link = `${baseUrl}?session=${sessionId}&role=${permission}`;
        navigator.clipboard.writeText(link);
        setShowPermissionModal(false);
        alert(`Link de ${permission === 'editor' ? 'Editor' : 'Visualizador'} copiado!`);
    };

    // Funções de exportação e importação
    const exportSession = () => {
        const sessionData = {
            sessionId,
            timestamp: Date.now(),
            metadata: {
                name: `Sessão Cavalo Paraguayo Tactics - ${new Date().toLocaleString()}`,
                version: '1.0',
                exportedBy: playerName || 'Usuário',
                playerRole
            },
            layers: layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                visible: layer.visible,
                locked: layer.locked,
                opacity: layer.opacity,
                canvasData: layer.canvas.toDataURL()
            })),
            messages: messages,
            tempLines: tempLines,
            zoom,
            pan,
            activeLayerId
        };

        const dataStr = JSON.stringify(sessionData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `cavalo-paraguayo-tatics-session-${sessionId.slice(0, 8)}.json`;
        link.click();

        setShowExportModal(false);
        alert('Sessão exportada com sucesso!');
    };

    const importSession = () => {
        if (!importData.trim()) {
            alert('Por favor, cole os dados da sessão.');
            return;
        }

        try {
            setIsLoading(true);
            const sessionData = JSON.parse(importData);

            // Validar estrutura do arquivo
            if (!sessionData.layers || !sessionData.messages || !sessionData.metadata) {
                throw new Error('Formato de arquivo inválido');
            }

            // Carregar camadas
            const importedLayers: Layer[] = sessionData.layers.map((layerData: any) => {
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 600;

                const img = new Image();
                img.onload = () => {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                    }
                };
                img.src = layerData.canvasData;

                return {
                    id: layerData.id,
                    name: layerData.name,
                    visible: layerData.visible,
                    locked: layerData.locked,
                    opacity: layerData.opacity,
                    canvas
                };
            });

            // Atualizar estado
            setLayers(importedLayers);
            setMessages(sessionData.messages || []);
            setTempLines(sessionData.tempLines || []);
            setZoom(sessionData.zoom || 1);
            setPan(sessionData.pan || { x: 0, y: 0 });
            setActiveLayerId(sessionData.activeLayerId || importedLayers[0]?.id || '');

            setShowImportModal(false);
            setImportData('');
            alert('Sessão importada com sucesso!');

        } catch (error) {
            console.error('Erro ao importar sessão:', error);
            alert('Erro ao importar sessão. Verifique se o arquivo é válido.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setImportData(content);
        };
        reader.readAsText(file);
    };

    // Funções de zoom e pan
    const zoomIn = () => {
        setZoom(prev => Math.min(prev * 1.2, 5)); // Máximo 5x zoom
    };

    const zoomOut = () => {
        setZoom(prev => Math.max(prev / 1.2, 0.1)); // Mínimo 0.1x zoom
    };

    const resetZoom = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        return { x, y };
    };

    const startPanning = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.ctrlKey || e.metaKey) {
            setIsPanning(true);
            setLastPanPos({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const panCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPanning) {
            const deltaX = e.clientX - lastPanPos.x;
            const deltaY = e.clientY - lastPanPos.y;

            setPan(prev => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));

            setLastPanPos({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const stopPanning = () => {
        setIsPanning(false);
    };

    // Funções do chat
    const sendMessage = () => {
        if (!chatInput.trim() || !playerName.trim()) return;

        const message = {
            id: uuidv4(),
            playerId: playerId.current,
            playerName: playerName,
            playerColor: currentColor,
            text: chatInput.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, message]);
        setChatInput('');

        // Enviar mensagem para outros jogadores
        if (socket) {
            socket.emit('chat-message', {
                message,
                sessionId
            });
        }
    };

    const handleChatKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const setPlayerNameHandler = () => {
        if (playerName.trim()) {
            setShowNameInput(false);
            // Notificar outros jogadores sobre o nome
            if (socket) {
                socket.emit('player-name', {
                    playerId: playerId.current,
                    name: playerName.trim(),
                    sessionId
                });
            }
        }
    };

    const handleNameKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setPlayerNameHandler();
        }
    };

    // Auto-scroll para o final do chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="app">
            <header className="header">
                <h1>🎮 Cavalo Paraguayo Tactics</h1>
                <div className="session-info">
                    <span>Sessão: {sessionId.slice(0, 8)}...</span>
                    <span className={`role-badge ${playerRole}`}>
                        {playerRole === 'editor' ? '✏️ Editor' : '👁️ Visualizador'}
                    </span>
                    <button className="session-link" onClick={copySessionLink}>
                        📋 Compartilhar Link
                    </button>
                    <button className="session-btn" onClick={() => setShowExportModal(true)}>
                        💾 Exportar
                    </button>
                    <button className="session-btn" onClick={() => setShowImportModal(true)}>
                        📂 Importar
                    </button>
                </div>
            </header>

            <div className="main-content">
                <div
                    className="toolbar"
                    style={{ width: `${toolbarWidth}px` }}
                >
                    <div className="tool-section">
                        <h3>🖌️ Ferramentas</h3>
                        <div className="tool-buttons">
                            <button
                                className={`tool-button ${currentTool === 'brush' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                onClick={() => setCurrentTool('brush')}
                                title="Pincel"
                                disabled={playerRole !== 'editor'}
                            >
                                ✏️
                            </button>
                            <button
                                className={`tool-button ${currentTool === 'eraser' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                onClick={() => setCurrentTool('eraser')}
                                title="Borracha"
                                disabled={playerRole !== 'editor'}
                            >
                                🧽
                            </button>
                            <button
                                className={`tool-button ${currentTool === 'icon' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                onClick={() => setCurrentTool('icon')}
                                title="Ícones"
                                disabled={playerRole !== 'editor'}
                            >
                                🎯
                            </button>
                            <button
                                className={`tool-button ${currentTool === 'temp-line' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                onClick={() => setCurrentTool('temp-line')}
                                title="Linha Temporária"
                                disabled={playerRole !== 'editor'}
                            >
                                ⚡
                            </button>
                            <button
                                className={`tool-button ${currentTool === 'unit' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                onClick={() => setCurrentTool('unit')}
                                title="Unidades Táticas"
                                disabled={playerRole !== 'editor'}
                            >
                                ⚔️
                            </button>
                        </div>
                    </div>

                    <div className="tool-section">
                        <h3>🎨 Cores</h3>
                        <div className="color-picker">
                            {colors.map((color) => (
                                <div
                                    key={color}
                                    className={`color-option ${currentColor === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setCurrentColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="tool-section">
                        <h3>📏 Espessura</h3>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="slider"
                            />
                            <span>{brushSize}px</span>
                        </div>
                    </div>

                    {currentTool === 'icon' && (
                        <div className="tool-section">
                            <h3>🎯 Ícones PW</h3>
                            <div className="icons-panel">
                                {Object.entries(icons).map(([type, icon]) => (
                                    <button
                                        key={type}
                                        className={`icon-button ${selectedIcon === type ? 'active' : ''}`}
                                        onClick={() => setSelectedIcon(type as IconType)}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentTool === 'unit' && (
                        <div className="tool-section">
                            <h3>⚔️ Unidades Táticas</h3>
                            <div className="units-panel">
                                {Object.entries(pwUnitTypes).map(([key, unit]) => (
                                    <button
                                        key={key}
                                        className={`unit-button ${selectedUnitType === key ? 'active' : ''}`}
                                        onClick={() => setSelectedUnitType(key)}
                                        title={unit.description}
                                        style={{ borderColor: unit.color }}
                                    >
                                        <div className="unit-icon" style={{ color: unit.color }}>
                                            {loadedIcons[key] ? (
                                                <img
                                                    src={unit.iconPath}
                                                    alt={unit.name}
                                                    style={{ width: '24px', height: '24px' }}
                                                />
                                            ) : (
                                                <span>⏳</span>
                                            )}
                                        </div>
                                        <div className="unit-name">{unit.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="tool-section">
                        <h3>🧹 Ações</h3>
                        <button
                            className={`tool-button ${playerRole !== 'editor' ? 'disabled' : ''}`}
                            onClick={clearCanvas}
                            disabled={playerRole !== 'editor'}
                        >
                            🗑️ Limpar
                        </button>
                    </div>
                </div>

                {/* Handle de redimensionamento da toolbar */}
                <div
                    className="resize-handle resize-handle-toolbar"
                    onMouseDown={() => setIsResizingToolbar(true)}
                />

                <div className="canvas-container">
                    <canvas
                        ref={canvasRef}
                        className="canvas"
                        onMouseDown={(e) => {
                            if (e.ctrlKey || e.metaKey) {
                                startPanning(e);
                            } else if (currentTool === 'icon' || currentTool === 'unit') {
                                addIcon(e);
                            } else {
                                startDrawing(e);
                            }
                        }}
                        onMouseMove={(e) => {
                            if (isPanning) {
                                panCanvas(e);
                            } else if (isDrawing && currentTool !== 'icon') {
                                draw(e);
                            }
                        }}
                        onMouseUp={stopPanning}
                        onMouseLeave={() => {
                            if (isDrawing) {
                                stopDrawing();
                            }
                            if (isPanning) {
                                stopPanning();
                            }
                        }}
                    />

                    <div className="players-list">
                        <h4>👥 Jogadores ({players.length + 1})</h4>
                        <div className="player-item">
                            <div className="player-indicator" style={{ backgroundColor: currentColor }}></div>
                            <span>Você</span>
                        </div>
                        {players.map((player) => (
                            <div key={player.id || `player-${Math.random()}`} className="player-item">
                                <div className="player-indicator" style={{ backgroundColor: player.color }}></div>
                                <span>{player.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="active-layer-info">
                        <span>Camada Ativa: {layers.find(l => l.id === activeLayerId)?.name}</span>
                    </div>

                    {/* Controles de Zoom */}
                    <div className="zoom-controls">
                        <button
                            className="zoom-btn zoom-in"
                            onClick={zoomIn}
                            title="Zoom In (+)"
                        >
                            ➕
                        </button>
                        <button
                            className="zoom-btn zoom-out"
                            onClick={zoomOut}
                            title="Zoom Out (-)"
                        >
                            ➖
                        </button>
                        <button
                            className="zoom-btn zoom-reset"
                            onClick={resetZoom}
                            title="Reset Zoom (100%)"
                        >
                            🎯
                        </button>
                        <div className="zoom-info">
                            {Math.round(zoom * 100)}%
                        </div>
                    </div>

                    {/* Sistema de Chat */}
                    <div className={`chat-container ${showChat ? 'open' : ''}`}>
                        <div className="chat-header">
                            <h3>💬 Chat</h3>
                            <button
                                className="chat-toggle-btn"
                                onClick={() => setShowChat(!showChat)}
                                title={showChat ? 'Ocultar Chat' : 'Mostrar Chat'}
                            >
                                {showChat ? '◀' : '▶'}
                            </button>
                        </div>

                        {showChat && (
                            <>
                                {/* Input de Nome */}
                                {showNameInput && (
                                    <div className="name-input-container">
                                        <input
                                            type="text"
                                            placeholder="Digite seu nome..."
                                            value={playerName}
                                            onChange={(e) => setPlayerName(e.target.value)}
                                            onKeyPress={handleNameKeyPress}
                                            className="name-input"
                                            maxLength={20}
                                        />
                                        <button
                                            className="name-submit-btn"
                                            onClick={setPlayerNameHandler}
                                        >
                                            OK
                                        </button>
                                    </div>
                                )}

                                {/* Mensagens */}
                                <div className="chat-messages" ref={chatContainerRef}>
                                    {messages.map((message) => (
                                        <div
                                            key={message.id || `message-${Math.random()}`}
                                            className={`chat-message ${message.playerId === playerId.current ? 'own-message' : ''}`}
                                        >
                                            <div className="message-header">
                                                <span
                                                    className="player-name"
                                                    style={{ color: message.playerColor }}
                                                >
                                                    {message.playerName}
                                                </span>
                                                <span className="message-time">
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="message-text">
                                                {message.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input de Mensagem */}
                                {!showNameInput && (
                                    <div className="chat-input-container">
                                        <input
                                            type="text"
                                            placeholder="Digite sua mensagem..."
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyPress={handleChatKeyPress}
                                            className="chat-input"
                                            maxLength={200}
                                        />
                                        <button
                                            className="chat-send-btn"
                                            onClick={sendMessage}
                                            disabled={!chatInput.trim()}
                                        >
                                            ➤
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Handle de redimensionamento das camadas */}
                <div
                    className="resize-handle resize-handle-layers"
                    onMouseDown={() => setIsResizingLayers(true)}
                />

                {/* Botão flutuante para mostrar painel de camadas quando oculto */}
                {!showLayerManager && (
                    <button
                        className="show-layers-btn"
                        onClick={() => setShowLayerManager(true)}
                        title="Mostrar Painel de Camadas"
                    >
                        📑
                    </button>
                )}

                {/* Painel de Camadas Profissional */}
                <div
                    className={`layers-panel ${showLayerManager ? 'open' : ''}`}
                    style={{ width: `${layersPanelWidth}px` }}
                >
                    <div className="layers-header">
                        <h3>📑 Camadas</h3>
                        <div className="layers-controls">
                            <button
                                className="layer-control-btn"
                                onClick={() => setShowLayerManager(!showLayerManager)}
                                title={showLayerManager ? 'Ocultar' : 'Mostrar'}
                            >
                                {showLayerManager ? '◀' : '▶'}
                            </button>
                            <button
                                className={`layer-control-btn ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                onClick={createLayer}
                                title="Nova Camada"
                                disabled={playerRole !== 'editor'}
                            >
                                ➕
                            </button>
                        </div>
                    </div>

                    {showLayerManager && (
                        <div className="layers-content">
                            <div className="layers-list">
                                {layers.map((layer, index) => (
                                    <div
                                        key={`${layer.id}-${index}`}
                                        className={`layer-item ${activeLayerId === layer.id ? 'active' : ''} ${layer.locked ? 'locked' : ''}`}
                                        draggable
                                        onDragStart={(e) => setDragLayerId(layer.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const fromIndex = layers.findIndex(l => l.id === dragLayerId);
                                            if (fromIndex !== -1) {
                                                moveLayer(fromIndex, index);
                                            }
                                        }}
                                    >
                                        <div className="layer-visibility-toggle">
                                            <button
                                                className={`visibility-btn ${layer.visible ? 'visible' : 'hidden'} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                                onClick={() => toggleLayerVisibility(layer.id)}
                                                title={layer.visible ? 'Ocultar' : 'Mostrar'}
                                                disabled={playerRole !== 'editor'}
                                            >
                                                {layer.visible ? '👁️' : '🙈'}
                                            </button>
                                        </div>

                                        <div className="layer-lock-toggle">
                                            <button
                                                className={`lock-btn ${layer.locked ? 'locked' : 'unlocked'} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                                onClick={() => toggleLayerLock(layer.id)}
                                                title={layer.locked ? 'Desbloquear' : 'Bloquear'}
                                                disabled={playerRole !== 'editor'}
                                            >
                                                {layer.locked ? '🔒' : '🔓'}
                                            </button>
                                        </div>

                                        <div className="layer-info" onClick={() => setActiveLayerId(layer.id)}>
                                            <div className="layer-name">
                                                {editingLayerId === layer.id ? (
                                                    <input
                                                        type="text"
                                                        value={editingLayerName}
                                                        onChange={(e) => setEditingLayerName(e.target.value)}
                                                        onBlur={saveLayerName}
                                                        onKeyPress={(e) => e.key === 'Enter' && saveLayerName()}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span onDoubleClick={() => startEditingLayer(layer)}>
                                                        {layer.name}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="layer-opacity">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={layer.opacity * 100}
                                                    onChange={(e) => updateLayerOpacity(layer.id, Number(e.target.value) / 100)}
                                                    className={`opacity-slider ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                                    disabled={playerRole !== 'editor'}
                                                />
                                                <span className="opacity-value">{Math.round(layer.opacity * 100)}%</span>
                                            </div>
                                        </div>

                                        <div className="layer-actions">
                                            <button
                                                className={`layer-edit-btn ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                                onClick={() => startEditingLayer(layer)}
                                                title="Renomear"
                                                disabled={playerRole !== 'editor'}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={`layer-delete-btn ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                                onClick={() => deleteLayer(layer.id)}
                                                disabled={playerRole !== 'editor' || layers.length <= 1}
                                                title="Deletar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Permissão */}
            {showPermissionModal && (
                <div className="permission-modal">
                    <div className="modal-content">
                        <h2>Compartilhar Sessão</h2>
                        <p>Compartilhe este link para permitir que outros jogadores participem da sessão.</p>
                        <div className="permission-options">
                            <button
                                className="permission-option"
                                onClick={() => generateLink('editor')}
                                title="Compartilhar como Editor"
                            >
                                Compartilhar como Editor
                            </button>
                            <button
                                className="permission-option"
                                onClick={() => generateLink('viewer')}
                                title="Compartilhar como Visualizador"
                            >
                                Compartilhar como Visualizador
                            </button>
                        </div>
                        <button className="close-modal-btn" onClick={() => setShowPermissionModal(false)}>
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Exportação */}
            {showExportModal && (
                <div className="export-modal">
                    <div className="modal-content">
                        <h2>Exportar Sessão</h2>
                        <p>Salve sua sessão atual em um arquivo para usar posteriormente.</p>
                        <div className="export-info">
                            <p><strong>Será exportado:</strong></p>
                            <ul>
                                <li>✅ Todas as camadas e desenhos</li>
                                <li>✅ Histórico de chat</li>
                                <li>✅ Linhas temporárias</li>
                                <li>✅ Configurações de zoom e pan</li>
                                <li>✅ Metadados da sessão</li>
                            </ul>
                        </div>
                        <div className="modal-actions">
                            <button className="export-btn" onClick={exportSession}>
                                💾 Exportar Sessão
                            </button>
                            <button className="cancel-btn" onClick={() => setShowExportModal(false)}>
                                Cancelar
                            </button>
                        </div>
                        <button className="close-modal-btn" onClick={() => setShowExportModal(false)}>
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Importação */}
            {showImportModal && (
                <div className="import-modal">
                    <div className="modal-content">
                        <h2>Importar Sessão</h2>
                        <p>Carregue uma sessão salva anteriormente.</p>

                        <div className="import-methods">
                            <div className="import-method">
                                <h3>📁 Carregar Arquivo</h3>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="file-input"
                                />
                            </div>

                            <div className="import-method">
                                <h3>📋 Colar Dados</h3>
                                <textarea
                                    placeholder="Cole aqui os dados da sessão..."
                                    value={importData}
                                    onChange={(e) => setImportData(e.target.value)}
                                    className="import-textarea"
                                    rows={8}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="import-btn"
                                onClick={importSession}
                                disabled={!importData.trim() || isLoading}
                            >
                                {isLoading ? '⏳ Carregando...' : '📂 Importar Sessão'}
                            </button>
                            <button className="cancel-btn" onClick={() => {
                                setShowImportModal(false);
                                setImportData('');
                            }}>
                                Cancelar
                            </button>
                        </div>
                        <button className="close-modal-btn" onClick={() => {
                            setShowImportModal(false);
                            setImportData('');
                        }}>
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App; 