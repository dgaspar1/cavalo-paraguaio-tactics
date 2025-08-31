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

interface GeometricShape {
    id: string;
    type: 'square' | 'circle' | 'triangle';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    color: string;
    strokeWidth: number;
    isSelected: boolean;
    layerId: string;
    timestamp: number;
}

interface VideoLink {
    id: string;
    playerId: string;
    playerName: string;
    playerColor: string;
    title: string;
    url: string;
    timestamp: number;
    description?: string;
}

type Tool = 'brush' | 'eraser' | 'text' | 'icon' | 'temp-line' | 'unit' | 'square' | 'circle' | 'triangle' | 'select';
type IconType = 'mob' | 'npc' | 'resource' | 'boss' | 'portal' | 'quest';

const App: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [sessionId, setSessionId] = useState<string>('');
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentTool, setCurrentTool] = useState<Tool>('brush');
    const [currentColor, setCurrentColor] = useState<string>('#ff0000');
    const [brushSize, setBrushSize] = useState<number>(5);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [isDrawingShape, setIsDrawingShape] = useState<boolean>(false);
    const [shapeStartPos, setShapeStartPos] = useState<{ x: number; y: number } | null>(null);
    const [shapes, setShapes] = useState<GeometricShape[]>([]);
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
    const [isResizing, setIsResizing] = useState<boolean>(false);
    const [isRotating, setIsRotating] = useState<boolean>(false);
    const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);

    const [selectedUnitType, setSelectedUnitType] = useState('tank');
    const [layers, setLayers] = useState<Layer[]>([]);
    const [activeLayerId, setActiveLayerId] = useState<string>('');
    const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);
    const [activeRightTab, setActiveRightTab] = useState<'layers' | 'chat'>('layers');
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
    const [activeTab, setActiveTab] = useState<'canvas' | 'videos'>('canvas');
    const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
    const [newVideoTitle, setNewVideoTitle] = useState<string>('');
    const [newVideoUrl, setNewVideoUrl] = useState<string>('');
    const [newVideoDescription, setNewVideoDescription] = useState<string>('');
    const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

    // Redimensionamento
    const [toolbarWidth, setToolbarWidth] = useState<number>(280);
    const [layersPanelWidth, setLayersPanelWidth] = useState<number>(300);
    const [isResizingToolbar, setIsResizingToolbar] = useState<boolean>(false);
    const [showToolbar, setShowToolbar] = useState<boolean>(true);

    // Sistema de carregamento de ícones
    const [loadedIcons, setLoadedIcons] = useState<{ [key: string]: HTMLImageElement }>({});

    const [isResizingLayers, setIsResizingLayers] = useState<boolean>(false);

    // Estados para controlar seções colapsáveis da toolbar
    const [collapsedSections, setCollapsedSections] = useState<{
        arsenal: boolean;
        identification: boolean;
        caliber: boolean;
        icons: boolean;
        units: boolean;
        actions: boolean;
    }>({
        arsenal: false,
        identification: false,
        caliber: false,
        icons: false,
        units: false,
        actions: false
    });

    // Estados para controlar seções retráteis (acordeão)
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
        arsenal: true,
        identification: true,
        thickness: true,
        units: true,
        actions: true
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const backgroundImageRef = useRef<HTMLImageElement | null>(null);
    const playerId = useRef<string>(uuidv4());

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
            name: 'Tank (PT)',
            iconPath: '/icones_pw_180/classe_guerreiro.png',
            description: 'Unidade de linha de frente, absorve dano.',
            color: '#4A90E2'
        },
        // DPS
        assassin: {
            name: 'Assassino (ATK)',
            iconPath: '/icones_pw_180/classe_assassino.png',
            description: 'Especialista em dano furtivo e crítico.',
            color: '#D0021B'
        },
        swordsman: {
            name: 'Espadachim (ATK)',
            iconPath: '/icones_pw_180/classe_espadachim.png',
            description: 'Dano corpo a corpo e combate direto.',
            color: '#9013FE'
        },
        // Healers
        healer: {
            name: 'Curandeiro (APOIO)',
            iconPath: '/icones_pw_180/classe_espirito_alado.png',
            description: 'Cura e suporte vital para a equipe.',
            color: '#7ED321'
        },
        // Support
        support: {
            name: 'Suporte (APOIO)',
            iconPath: '/icones_pw_180/classe_fada.png',
            description: 'Buffs, debuffs e controle de campo.',
            color: '#F5A623'
        },
        bard: {
            name: 'Bardo (APOIO)',
            iconPath: '/icones_pw_180/bardo_normal.ico',
            description: 'Música e inspiração para aliados.',
            color: '#BD10E0'
        },
        // Ranged
        archer: {
            name: 'Arqueiro (CT)',
            iconPath: '/icones_pw_180/classe_arqueiro_alado.png',
            description: 'Dano à distância e precisão letal.',
            color: '#50E3C2'
        },
        // Magic
        mage: {
            name: 'Mago (CT)',
            iconPath: '/icones_pw_180/classe_mago.png',
            description: 'Magia elemental devastadora.',
            color: '#4A90E2'
        },
        warlock: {
            name: 'Bruxo (CT)',
            iconPath: '/icones_pw_180/classe_bruxo.png',
            description: 'Magia sombria e maldições.',
            color: '#8B572A'
        },
        lunar: {
            name: 'Imortal Lunar (CT)',
            iconPath: '/icones_pw_180/classe_imortal_lunar.png',
            description: 'Poderes lunares e controle de energia.',
            color: '#F8E71C'
        },
        // Agile
        agile: {
            name: 'Ágil (CC)',
            iconPath: '/icones_pw_180/classe_macaco.png',
            description: 'Velocidade e manobras evasivas.',
            color: '#F5A623'
        },
        wasp: {
            name: 'Vespa (CC)',
            iconPath: '/icones_pw_180/classe_vespa_alada.png',
            description: 'Ataques rápidos e mobilidade aérea.',
            color: '#D0021B'
        },
        // Control
        controller: {
            name: 'Controlador (CC)',
            iconPath: '/icones_pw_180/classe_espirito_encantador.png',
            description: 'Especialista em controle de multidões.',
            color: '#9013FE'
        },
        // Special
        divine: {
            name: 'Máquina Divina (CC)',
            iconPath: '/icones_pw_180/classe_maquina_divina.png',
            description: 'Suporte tático e tecnologia avançada.',
            color: '#50E3C2'
        },
        beast: {
            name: 'Bestial (PT)',
            iconPath: '/icones_pw_180/classe_bestial.png',
            description: 'Força bruta e resistência em combate.',
            color: '#8B572A'
        }
    };

    // Inicializar camadas
    useEffect(() => {
        // Não criar camadas automaticamente - aguardar layers-state
        console.log('📋 Aguardando layers-state do servidor...');
    }, []);

    // Carregar imagem de fundo
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            console.log('✅ Imagem de fundo carregada com sucesso');
            backgroundImageRef.current = img;
            redrawCanvas();
        };
        img.onerror = () => {
            console.error('❌ Erro ao carregar imagem de fundo');
        };
        img.src = '/mapa-tw.png';
    }, []);

    // Monitorar quando o canvas é montado e forçar redesenho
    useEffect(() => {
        if (canvasRef.current && activeTab === 'canvas') {
            console.log('🎯 Canvas montado, forçando redesenho');
            // Aguardar um pouco para garantir que tudo foi inicializado
            const timer = setTimeout(() => {
                redrawCanvas();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [canvasRef.current, activeTab]);



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
            console.log('🎨 Desenhando imagem de fundo');
            context.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
        } else {
            console.log('⚠️ Imagem de fundo não disponível');
        }

        // Desenhar camadas visíveis
        layers.forEach(layer => {
            if (layer.visible) {
                context.drawImage(layer.canvas, 0, 0);
            }
        });

        // Desenhar formas geométricas
        shapes.forEach(shape => {
            if (shape.layerId === activeLayerId) {
                drawShape(context, shape);
            }
        });

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

    const drawShape = (ctx: CanvasRenderingContext2D, shape: GeometricShape) => {
        ctx.save();

        // Aplicar transformações
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(shape.rotation);
        ctx.translate(-centerX, -centerY);

        // Configurar estilo
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = 'transparent';
        ctx.lineWidth = shape.strokeWidth;

        // Desenhar forma baseada no tipo
        switch (shape.type) {
            case 'square':
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                break;
            case 'circle':
                const radius = Math.max(shape.width, shape.height) / 2;
                ctx.beginPath();
                ctx.arc(shape.x + shape.width / 2, shape.y + shape.height / 2, radius, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(shape.x + shape.width / 2, shape.y);
                ctx.lineTo(shape.x, shape.y + shape.height);
                ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
                ctx.closePath();
                ctx.stroke();
                break;
        }

        // Desenhar controles de seleção se a forma estiver selecionada
        if (shape.isSelected) {
            drawSelectionControls(ctx, shape);
        }

        ctx.restore();
    };

    const drawSelectionControls = (ctx: CanvasRenderingContext2D, shape: GeometricShape) => {
        // Handles de redimensionamento
        const handles = [
            { x: shape.x, y: shape.y, type: 'nw' },
            { x: shape.x + shape.width, y: shape.y, type: 'ne' },
            { x: shape.x, y: shape.y + shape.height, type: 'sw' },
            { x: shape.x + shape.width, y: shape.y + shape.height, type: 'se' }
        ];

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;

        handles.forEach(handle => {
            ctx.beginPath();
            ctx.arc(handle.x, handle.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        });

        // Handle de rotação
        const rotationHandle = {
            x: shape.x + shape.width / 2,
            y: shape.y - 25
        };

        ctx.beginPath();
        ctx.arc(rotationHandle.x, rotationHandle.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Linha de conexão para rotação
        ctx.beginPath();
        ctx.moveTo(shape.x + shape.width / 2, shape.y);
        ctx.lineTo(rotationHandle.x, rotationHandle.y);
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Borda de seleção
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(shape.x - 2, shape.y - 2, shape.width + 4, shape.height + 4);
        ctx.setLineDash([]);
    };

    // Atualizar redraw quando camadas, linhas temporárias ou formas mudarem
    useEffect(() => {
        redrawCanvas();
    }, [layers, tempLines, shapes]);

    // Forçar redesenho quando voltar para a aba canvas
    useEffect(() => {
        if (activeTab === 'canvas') {
            console.log('🔄 Forçando redesenho do canvas ao voltar para aba canvas');
            // Aguardar o próximo frame para garantir que o canvas foi montado
            requestAnimationFrame(() => {
                setTimeout(() => {
                    redrawCanvas();
                }, 50);
            });
        }
    }, [activeTab]);

    const handleRemoteDrawing = (data: any) => {
        if (data.layerId && data.data) {
            const layer = layers.find(l => l.id === data.layerId);
            if (layer && layer.canvas) {
                const ctx = layer.canvas.getContext('2d');
                if (ctx) {
                    if (data.data.type === 'icon') {
                        const icon = icons[data.data.iconType as IconType];
                        if (icon) {
                            const img = new Image();
                            img.onload = () => {
                                ctx.drawImage(img, data.data.x - 15, data.data.y - 15, 30, 30);
                                redrawCanvas();
                            };
                            img.src = icon;
                        }
                    } else {
                        ctx.beginPath();
                        ctx.moveTo(data.data.startX, data.data.startY);
                        ctx.lineTo(data.data.endX, data.data.endY);
                        ctx.strokeStyle = data.data.color;
                        ctx.lineWidth = data.data.width;
                        ctx.stroke();
                        redrawCanvas();
                    }
                }
            }
        }
    };

    const handleRemoteTempLine = (data: any) => {
        const tempLine: TempLine = {
            id: data.id,
            playerId: data.playerId,
            startX: data.startX,
            startY: data.startY,
            endX: data.endX,
            endY: data.endY,
            color: data.color,
            timestamp: data.timestamp,
            segments: data.segments || []
        };

        setTempLines(prev => [...prev, tempLine]);
    };

    const handleRemoteLayerUpdate = (data: any) => {
        if (data.type === 'create') {
            setLayers(prev => [...prev, data.layer]);
        } else if (data.type === 'delete') {
            setLayers(prev => prev.filter(l => l.id !== data.layerId));
        } else if (data.type === 'update') {
            setLayers(prev => prev.map(l =>
                l.id === data.layerId ? { ...l, ...data.updates } : l
            ));
        }
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
        } else if (['square', 'circle', 'triangle'].includes(currentTool)) {
            // Iniciar desenho de forma geométrica
            setIsDrawingShape(true);
            const mousePos = getMousePos(e);
            setShapeStartPos(mousePos);
            return;
        } else if (currentTool === 'select') {
            // Modo de seleção
            const mousePos = getMousePos(e);
            const clickedShape = findShapeAtPosition(mousePos);

            if (clickedShape) {
                // Selecionar forma
                setSelectedShapeId(clickedShape.id);
                setShapes(prev => prev.map(shape => ({
                    ...shape,
                    isSelected: shape.id === clickedShape.id
                })));

                // Verificar se clicou em um handle de redimensionamento
                const handle = getResizeHandle(mousePos, clickedShape);
                if (handle) {
                    setIsResizing(true);
                    setResizeHandle(handle);
                    console.log('🔧 Iniciando redimensionamento com handle:', handle);
                } else if (isNearRotationHandle(mousePos, clickedShape)) {
                    setIsRotating(true);
                    console.log('🔄 Iniciando rotação');
                } else {
                    console.log('👆 Forma selecionada para movimento');
                }
            } else {
                // Deselecionar
                setSelectedShapeId(null);
                setShapes(prev => prev.map(shape => ({ ...shape, isSelected: false })));
                console.log('❌ Nenhuma forma selecionada');
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

        // Verificar se está redimensionando ou rotacionando uma forma
        if (isResizing && selectedShapeId && resizeHandle) {
            const mousePos = getMousePos(e);
            const selectedShape = shapes.find(s => s.id === selectedShapeId);

            if (selectedShape) {
                console.log('🔧 Redimensionando forma:', resizeHandle, 'mouse:', mousePos);
                setShapes(prev => prev.map(shape => {
                    if (shape.id === selectedShapeId) {
                        let newWidth = shape.width;
                        let newHeight = shape.height;
                        let newX = shape.x;
                        let newY = shape.y;

                        switch (resizeHandle) {
                            case 'se':
                                newWidth = Math.max(10, mousePos.x - shape.x);
                                newHeight = Math.max(10, mousePos.y - shape.y);
                                break;
                            case 'sw':
                                newWidth = Math.max(10, (shape.x + shape.width) - mousePos.x);
                                newHeight = Math.max(10, mousePos.y - shape.y);
                                newX = mousePos.x;
                                break;
                            case 'ne':
                                newWidth = Math.max(10, mousePos.x - shape.x);
                                newHeight = Math.max(10, (shape.y + shape.height) - mousePos.y);
                                newY = mousePos.y;
                                break;
                            case 'nw':
                                newWidth = Math.max(10, (shape.x + shape.width) - mousePos.x);
                                newHeight = Math.max(10, (shape.y + shape.height) - mousePos.y);
                                newX = mousePos.x;
                                newY = mousePos.y;
                                break;
                        }

                        console.log('📏 Novas dimensões:', { newX, newY, newWidth, newHeight });
                        return {
                            ...shape,
                            x: Math.max(0, newX),
                            y: Math.max(0, newY),
                            width: newWidth,
                            height: newHeight
                        };
                    }
                    return shape;
                }));
                redrawCanvas();
                return;
            }
        }

        if (isRotating && selectedShapeId) {
            const mousePos = getMousePos(e);
            const selectedShape = shapes.find(s => s.id === selectedShapeId);

            if (selectedShape) {
                const centerX = selectedShape.x + selectedShape.width / 2;
                const centerY = selectedShape.y + selectedShape.height / 2;
                const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX);

                setShapes(prev => prev.map(shape => {
                    if (shape.id === selectedShapeId) {
                        return { ...shape, rotation: angle };
                    }
                    return shape;
                }));
                redrawCanvas();
                return;
            }
        }

        // Arrastar forma selecionada
        if (selectedShapeId && !isResizing && !isRotating && currentTool === 'select') {
            const selectedShape = shapes.find(s => s.id === selectedShapeId);
            if (selectedShape) {
                const mousePos = getMousePos(e);
                const deltaX = mousePos.x - lastMousePos.current.x;
                const deltaY = mousePos.y - lastMousePos.current.y;

                setShapes(prev => prev.map(shape => {
                    if (shape.id === selectedShapeId) {
                        return {
                            ...shape,
                            x: Math.max(0, shape.x + deltaX),
                            y: Math.max(0, shape.y + deltaY)
                        };
                    }
                    return shape;
                }));
                redrawCanvas();
                return;
            }
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

                            canvasData: activeLayer.canvas.toDataURL()
                        }
                    });
                }
            }, 1000); // Sincronizar após 1 segundo de inatividade
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setIsDrawingShape(false);
        setIsResizing(false);
        setIsRotating(false);
        setResizeHandle(null);
        currentTempLine.current = null;

        // Finalizar desenho de forma geométrica
        if (isDrawingShape && shapeStartPos && currentTool && ['square', 'circle', 'triangle'].includes(currentTool)) {
            const endPos = lastMousePos.current;
            if (endPos) {
                const newShape: GeometricShape = {
                    id: uuidv4(),
                    type: currentTool as 'square' | 'circle' | 'triangle',
                    x: Math.min(shapeStartPos.x, endPos.x),
                    y: Math.min(shapeStartPos.y, endPos.y),
                    width: Math.abs(endPos.x - shapeStartPos.x),
                    height: Math.abs(endPos.y - shapeStartPos.y),
                    rotation: 0,
                    color: currentColor,
                    strokeWidth: brushSize,
                    isSelected: false,
                    layerId: activeLayerId,
                    timestamp: Date.now()
                };

                // Garantir tamanho mínimo
                if (newShape.width < 10) newShape.width = 10;
                if (newShape.height < 10) newShape.height = 10;

                setShapes(prev => [...prev, newShape]);
                redrawCanvas();
            }
            setShapeStartPos(null);
        }

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


            redrawCanvas();

            if (socket) {
                socket.emit('drawing', {
                    type: 'unit',
                    data: {
                        iconType: selectedUnitType,
                        x: mousePos.x,
                        y: mousePos.y
                    },
                    playerId: playerId.current,
                    sessionId,
                    layerId: activeLayerId
                });
            }
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
        alert(`Link de ${permission === 'editor' ? 'Oficial de Operações' : 'Observador Tático'} copiado!`);
    };

    // Funções de exportação e importação
    const exportSession = () => {
        const sessionData = {
            sessionId,
            timestamp: Date.now(),
            metadata: {
                name: `Operação Cavalo Paraguayo - ${new Date().toLocaleString()}`,
                version: '1.0',
                exportedBy: playerName || 'Oficial',
                playerRole
            },
            layers: layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                visible: layer.visible,
                locked: layer.locked,

                canvasData: layer.canvas.toDataURL()
            })),
            shapes: shapes,
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
        link.download = `operacao-cavalo-paraguayo-${sessionId.slice(0, 8)}.json`;
        link.click();

        setShowExportModal(false);
        alert('Operação registrada com sucesso!');
    };

    const addVideoLink = () => {
        if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;

        const videoLink: VideoLink = {
            id: uuidv4(),
            playerId: socket?.id || playerId.current, // Use socket.id if available, otherwise playerId.current
            playerName: playerName || 'Jogador',
            playerColor: currentColor,
            title: newVideoTitle.trim(),
            url: newVideoUrl.trim(),
            timestamp: Date.now(),
            description: newVideoDescription.trim() || undefined
        };

        setVideoLinks(prev => [...prev, videoLink]);
        socket?.emit('video-link', videoLink);

        // Limpar campos
        setNewVideoTitle('');
        setNewVideoUrl('');
        setNewVideoDescription('');
        setShowVideoModal(false);
    };

    const removeVideoLink = (id: string) => {
        if (playerRole !== 'editor') return;

        setVideoLinks(prev => prev.filter(video => video.id !== id));
        socket?.emit('remove-video-link', id);
    };

    const openVideoLink = (url: string) => {
        window.open(url, '_blank');
    };

    const validateVideoUrl = (url: string): boolean => {
        const videoPatterns = [
            /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
            /^https?:\/\/(www\.)?(twitch\.tv)\/.+/,
            /^https?:\/\/(www\.)?(vimeo\.com)\/.+/,
            /^https?:\/\/(www\.)?(dailymotion\.com)\/.+/,
            /^https?:\/\/(www\.)?(bilibili\.com)\/.+/,
            /^https?:\/\/(www\.)?(tiktok\.com)\/.+/,
            /^https?:\/\/(www\.)?(instagram\.com)\/.+/
        ];

        return videoPatterns.some(pattern => pattern.test(url));
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
            setZoom(newZoom);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Control' || e.key === 'Meta') {
            setIsPanning(true);
        }

        // Deletar forma selecionada
        if (e.key === 'Delete' && selectedShapeId && playerRole === 'editor') {
            setShapes(prev => prev.filter(shape => shape.id !== selectedShapeId));
            setSelectedShapeId(null);
            redrawCanvas();
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent) => {
        if (e.key === 'Control' || e.key === 'Meta') {
            setIsPanning(false);
        }
    };

    const importSession = () => {
        if (!importData.trim()) return;

        setIsLoading(true);

        try {
            const data = JSON.parse(importData);

            // Validar estrutura básica
            if (!data.layers || !Array.isArray(data.layers)) {
                throw new Error('Estrutura de briefing inválida');
            }

            // Importar camadas
            const newLayers: Layer[] = [];
            data.layers.forEach((layerData: any) => {
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 600;
                const ctx = canvas.getContext('2d');

                if (ctx && layerData.canvasData) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                    };
                    img.src = layerData.canvasData;
                }

                newLayers.push({
                    id: layerData.id || uuidv4(),
                    name: layerData.name || 'Setor Importado',
                    visible: layerData.visible !== undefined ? layerData.visible : true,
                    locked: layerData.locked !== undefined ? layerData.locked : false,

                    canvas
                });
            });

            setLayers(newLayers);
            if (newLayers.length > 0) {
                setActiveLayerId(newLayers[0].id);
            }

            // Importar outros dados
            if (data.messages) setMessages(data.messages);
            if (data.tempLines) setTempLines(data.tempLines);
            if (data.shapes) setShapes(data.shapes);
            if (data.videoLinks) setVideoLinks(data.videoLinks);
            if (data.zoom) setZoom(data.zoom);
            if (data.pan) setPan(data.pan);
            if (data.activeLayerId) setActiveLayerId(data.activeLayerId);

            setShowImportModal(false);
            setImportData('');
            alert('Briefing de missão carregado com sucesso!');

        } catch (error) {
            alert('Falha na decodificação do briefing. Verifique a integridade do arquivo.');
            console.error('Erro ao importar sessão:', error);
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

    // Funções auxiliares para seleção e transformação de formas
    const findShapeAtPosition = (pos: { x: number; y: number }): GeometricShape | null => {
        // Procurar formas de trás para frente (últimas desenhadas primeiro)
        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            if (isPointInShape(pos, shape)) {
                return shape;
            }
        }
        return null;
    };

    const isPointInShape = (pos: { x: number; y: number }, shape: GeometricShape): boolean => {
        // Para formas não rotacionadas, usar detecção simples
        if (shape.rotation === 0) {
            switch (shape.type) {
                case 'square':
                    return pos.x >= shape.x && pos.x <= shape.x + shape.width &&
                        pos.y >= shape.y && pos.y <= shape.y + shape.height;
                case 'circle':
                    const centerX = shape.x + shape.width / 2;
                    const centerY = shape.y + shape.height / 2;
                    const radius = Math.max(shape.width, shape.height) / 2;
                    const distance = Math.sqrt(
                        Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
                    );
                    return distance <= radius;
                case 'triangle':
                    // Verificar se está dentro do retângulo delimitador
                    return pos.x >= shape.x && pos.x <= shape.x + shape.width &&
                        pos.y >= shape.y && pos.y <= shape.y + shape.height;
                default:
                    return false;
            }
        } else {
            // Para formas rotacionadas, aplicar transformação inversa
            const cos = Math.cos(-shape.rotation);
            const sin = Math.sin(-shape.rotation);

            const centerX = shape.x + shape.width / 2;
            const centerY = shape.y + shape.height / 2;

            const dx = pos.x - centerX;
            const dy = pos.y - centerY;

            const rotatedX = dx * cos - dy * sin;
            const rotatedY = dx * sin + dy * cos;

            const halfWidth = shape.width / 2;
            const halfHeight = shape.height / 2;

            switch (shape.type) {
                case 'square':
                    return rotatedX >= -halfWidth && rotatedX <= halfWidth &&
                        rotatedY >= -halfHeight && rotatedY <= halfHeight;
                case 'circle':
                    const radius = Math.max(shape.width, shape.height) / 2;
                    const distance = Math.sqrt(rotatedX * rotatedX + rotatedY * rotatedY);
                    return distance <= radius;
                case 'triangle':
                    return rotatedX >= -halfWidth && rotatedX <= halfWidth &&
                        rotatedY >= -halfHeight && rotatedY <= halfHeight;
                default:
                    return false;
            }
        }
    };

    const getResizeHandle = (pos: { x: number; y: number }, shape: GeometricShape): 'nw' | 'ne' | 'sw' | 'se' | null => {
        const handleSize = 10;
        const handles = {
            nw: { x: shape.x, y: shape.y },
            ne: { x: shape.x + shape.width, y: shape.y },
            sw: { x: shape.x, y: shape.y + shape.height },
            se: { x: shape.x + shape.width, y: shape.y + shape.height }
        };

        for (const [handle, handlePos] of Object.entries(handles)) {
            const distance = Math.sqrt(
                Math.pow(pos.x - handlePos.x, 2) + Math.pow(pos.y - handlePos.y, 2)
            );
            if (distance <= handleSize) {
                return handle as 'nw' | 'ne' | 'sw' | 'se';
            }
        }
        return null;
    };

    const isNearRotationHandle = (pos: { x: number; y: number }, shape: GeometricShape): boolean => {
        const handleSize = 10;
        const rotationHandle = {
            x: shape.x + shape.width / 2,
            y: shape.y - 25
        };

        const distance = Math.sqrt(
            Math.pow(pos.x - rotationHandle.x, 2) + Math.pow(pos.y - rotationHandle.y, 2)
        );
        return distance <= handleSize;
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

    // Funções para controlar colapso das seções da toolbar
    const toggleSection = (section: keyof typeof collapsedSections) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleOpenSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleToolbar = () => {
        setShowToolbar(!showToolbar);
    };

    // Auto-scroll para o final do chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        socket.on('drawing', handleRemoteDrawing);
        socket.on('temp-line', handleRemoteTempLine);
        socket.on('layer-update', handleRemoteLayerUpdate);
        socket.on('shape-update', (data: any) => {
            if (data.action === 'create') {
                setShapes(prev => [...prev, data.shape]);
            } else if (data.action === 'update') {
                setShapes(prev => prev.map(shape =>
                    shape.id === data.shape.id ? data.shape : shape
                ));
            } else if (data.action === 'delete') {
                setShapes(prev => prev.filter(shape => shape.id !== data.shapeId));
            }
        });
        socket.on('chat-message', (message) => {
            setMessages(prev => [...prev, message]);
        });
        socket.on('player-name', (data) => {
            setPlayers(prev => prev.map(p =>
                p.id === data.playerId ? { ...p, name: data.name } : p
            ));
        });
        socket.on('video-link', (videoLink: VideoLink) => {
            setVideoLinks(prev => [...prev, videoLink]);
        });
        socket.on('remove-video-link', (id: string) => {
            setVideoLinks(prev => prev.filter(video => video.id !== id));
        });
        socket.on('video-links-history', (videoLinks: VideoLink[]) => {
            setVideoLinks(videoLinks);
        });

        return () => {
            socket.off('drawing');
            socket.off('temp-line');
            socket.off('layer-update');
            socket.off('shape-update');
            socket.off('chat-message');
            socket.off('player-name');
            socket.off('video-link');
            socket.off('remove-video-link');
            socket.off('video-links-history');
        };
    }, [socket]);

    return (
        <div className="app">
            <header className="header">
                <h1>Quartel General Tático</h1>

                <div className="header-tabs">
                    <button
                        className={`tab-button ${activeTab === 'canvas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('canvas')}
                    >
                        🗺️ Mapa de Operações
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('videos')}
                    >
                        📹 Relatórios de Campo
                    </button>
                </div>

                <div className="header-controls">
                    <div className="role-badge">
                        {playerRole === 'editor' ? 'Oficial de Operações' : 'Observador Tático'}
                    </div>
                    <button onClick={() => setShowPermissionModal(true)} className="share-btn">
                        🔗 Transmitir Coordenadas
                    </button>
                    <button onClick={() => setShowExportModal(true)} className="export-btn">
                        💾 Registrar
                    </button>
                    <button onClick={() => setShowImportModal(true)} className="import-btn">
                        📁 Carregar
                    </button>
                </div>
            </header>

            {activeTab === 'canvas' ? (
                <>
                    {/* Canvas e ferramentas */}
                    <div className="main-content">
                        <div
                            className={`toolbar ${showToolbar ? '' : 'collapsed'}`}
                            style={{ width: showToolbar ? `${toolbarWidth}px` : '60px' }}
                        >
                            <div className="toolbar-header">
                                <h3>⚔️ Arsenal</h3>
                                <button
                                    className="toolbar-toggle-btn"
                                    onClick={() => setShowToolbar(!showToolbar)}
                                    title={showToolbar ? 'Minimizar' : 'Maximizar'}
                                >
                                    {showToolbar ? '◀' : '▶'}
                                </button>
                            </div>

                            {!showToolbar && (
                                <div className="minimized-icons">
                                    <button className="minimized-icon" title="Seleção e Transformação">👆</button>
                                    <button className="minimized-icon" title="Arsenal">⚔️</button>
                                    <button className="minimized-icon" title="Identificação de Unidade">🎨</button>
                                    <button className="minimized-icon" title="Calibre de Traço">📏</button>
                                    <button className="minimized-icon" title="Formas Geométricas">⬜</button>
                                    <button className="minimized-icon" title="Efetivo de Combate">⚔️</button>
                                    <button className="minimized-icon" title="Ações de Campo">🛠️</button>
                                </div>
                            )}

                            <div className="tool-section">
                                <h3
                                    className="section-header clickable"
                                    onClick={() => toggleOpenSection('arsenal')}
                                >
                                    ⚔️ Arsenal Tático {openSections.arsenal ? '▼' : '▶'}
                                </h3>
                                {openSections.arsenal && (
                                    <div className="tool-buttons">
                                        <button
                                            className={`tool-button ${currentTool === 'select' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                            onClick={() => setCurrentTool('select')}
                                            title="Selecionar e Transformar"
                                            disabled={playerRole !== 'editor'}
                                        >
                                            👆
                                        </button>
                                        <button
                                            className={`tool-button ${currentTool === 'brush' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                            onClick={() => setCurrentTool('brush')}
                                            title="Marcador Tático"
                                            disabled={playerRole !== 'editor'}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className={`tool-button ${currentTool === 'eraser' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                            onClick={() => setCurrentTool('eraser')}
                                            title="Neutralizador de Marcas"
                                            disabled={playerRole !== 'editor'}
                                        >
                                            🧽
                                        </button>

                                        <button
                                            className={`tool-button ${currentTool === 'temp-line' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                            onClick={() => setCurrentTool('temp-line')}
                                            title="Traço de Reconhecimento"
                                            disabled={playerRole !== 'editor'}
                                        >
                                            ⚡
                                        </button>
                                        <button
                                            className={`tool-button ${currentTool === 'square' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                            onClick={() => setCurrentTool('square')}
                                            title="Quadrado/Retângulo"
                                            disabled={playerRole !== 'editor'}
                                        >
                                            ⬜
                                        </button>
                                        <button
                                            className={`tool-button ${currentTool === 'circle' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                            onClick={() => setCurrentTool('circle')}
                                            title="Círculo/Elipse"
                                            disabled={playerRole !== 'editor'}
                                        >
                                            ⭕
                                        </button>
                                        <button
                                            className={`tool-button ${currentTool === 'triangle' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                            onClick={() => setCurrentTool('triangle')}
                                            title="Triângulo"
                                            disabled={playerRole !== 'editor'}
                                        >
                                            🔺
                                        </button>
                                        <button
                                            className={`tool-button ${currentTool === 'unit' ? 'active' : ''} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                            onClick={() => setCurrentTool('unit')}
                                            title="Efetivo de Combate"
                                            disabled={playerRole !== 'editor'}
                                        >
                                            ⚔️
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="tool-section">
                                <h3
                                    className="section-header clickable"
                                    onClick={() => toggleOpenSection('identification')}
                                >
                                    🎨 Identificação de Unidade {openSections.identification ? '▼' : '▶'}
                                </h3>
                                {openSections.identification && (
                                    <div className="color-picker">
                                        {colors.map((color) => (
                                            <div
                                                key={color}
                                                className={`color-option ${currentColor === color ? 'active' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setCurrentColor(color)}
                                                title={`Cor: ${color}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="tool-section">
                                <h3
                                    className="section-header clickable"
                                    onClick={() => toggleOpenSection('thickness')}
                                >
                                    📏 Calibre de Traço {openSections.thickness ? '▼' : '▶'}
                                </h3>
                                {openSections.thickness && (
                                    <div className="thickness-control">
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            value={brushSize}
                                            onChange={(e) => setBrushSize(Number(e.target.value))}
                                            className="thickness-slider"
                                            disabled={playerRole !== 'editor'}
                                        />
                                        <span className="thickness-value">{brushSize}px</span>
                                    </div>
                                )}
                            </div>



                            {currentTool === 'unit' && (
                                <div className="tool-section">
                                    <h3
                                        className="section-header clickable"
                                        onClick={() => toggleOpenSection('units')}
                                    >
                                        ⚔️ Efetivo de Combate {openSections.units ? '▼' : '▶'}
                                    </h3>
                                    {openSections.units && (
                                        <div className="units-panel">
                                            {Object.entries(pwUnitTypes).map(([key, unit]) => (
                                                <button
                                                    key={key}
                                                    className={`unit-button ${selectedUnitType === key ? 'active' : ''}`}
                                                    onClick={() => setSelectedUnitType(key)}
                                                    title={unit.description}
                                                    disabled={playerRole !== 'editor'}
                                                >
                                                    <div className="unit-icon">{unit.iconPath}</div>
                                                    <div className="unit-name">{unit.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="tool-section">
                                <h3
                                    className="section-header clickable"
                                    onClick={() => toggleOpenSection('actions')}
                                >
                                    🔄 Ações de Campo {openSections.actions ? '▼' : '▶'}
                                </h3>
                                {openSections.actions && (
                                    <button
                                        className="tool-button"
                                        onClick={clearCanvas}
                                        disabled={playerRole !== 'editor'}
                                        title="Redefinir Campo"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Handle de redimensionamento da toolbar */}
                        <div
                            className="resize-handle resize-handle-toolbar"
                            onMouseDown={() => setIsResizingToolbar(true)}
                        />

                        <div className="center-pane">
                            <div className="canvas-container">
                                <canvas
                                    ref={canvasRef}
                                    width={800}
                                    height={600}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onWheel={handleWheel}
                                    onKeyDown={handleKeyDown}
                                    onKeyUp={handleKeyUp}
                                    tabIndex={0}
                                />

                                {/* Zoom controls */}
                                <div className="zoom-controls">
                                    <button className="zoom-btn zoom-in" onClick={zoomIn} title="Zoom In (+)">➕</button>
                                    <button className="zoom-btn zoom-out" onClick={zoomOut} title="Zoom Out (-)">➖</button>
                                    <button className="zoom-btn zoom-reset" onClick={resetZoom} title="Reset Zoom (100%)">🎯</button>
                                    <div className="zoom-info">{Math.round(zoom * 100)}%</div>
                                </div>
                            </div>


                        </div>

                        <div
                            className={`right-sidebar ${showRightSidebar ? 'expanded' : 'collapsed'}`}
                            style={{
                                width: showRightSidebar ? `${layersPanelWidth}px` : '60px',
                                minWidth: showRightSidebar ? '250px' : '60px'
                            }}
                        >
                            <div className="right-sidebar-header">
                                <h3>{showRightSidebar ? 'Painel de Operações' : '⚙️'}</h3>
                                <div className="right-sidebar-controls">
                                    <button
                                        className="right-sidebar-control-btn"
                                        onClick={() => setShowRightSidebar(!showRightSidebar)}
                                        title={showRightSidebar ? 'Comprimir' : 'Expandir'}
                                    >
                                        {showRightSidebar ? '◀' : '▶'}
                                    </button>
                                    {showRightSidebar && activeRightTab === 'layers' && (
                                        <button
                                            className={`layer-control-btn ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                            onClick={createLayer}
                                            title="Adicionar Setor"
                                            disabled={playerRole !== 'editor'}
                                        >
                                            ➕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!showRightSidebar && (
                                <div className="minimized-tabs">
                                    <button
                                        className={`minimized-tab ${activeRightTab === 'layers' ? 'active' : ''}`}
                                        onClick={() => {
                                            setShowRightSidebar(true);
                                            setActiveRightTab('layers');
                                        }}
                                        title="Setores de Operação"
                                    >
                                        🗺️
                                    </button>
                                    <button
                                        className={`minimized-tab ${activeRightTab === 'chat' ? 'active' : ''}`}
                                        onClick={() => {
                                            setShowRightSidebar(true);
                                            setActiveRightTab('chat');
                                        }}
                                        title={`Comunicações de Campo (${players.length} oficiais)`}
                                    >
                                        📡{players.length > 0 ? `(${players.length})` : ''}
                                    </button>
                                </div>
                            )}

                            {showRightSidebar && (
                                <div className="right-sidebar-tabs">
                                    <button
                                        className={`sidebar-tab ${activeRightTab === 'layers' ? 'active' : ''}`}
                                        onClick={() => setActiveRightTab('layers')}
                                    >
                                        🗺️ Setores
                                    </button>
                                    <button
                                        className={`sidebar-tab ${activeRightTab === 'chat' ? 'active' : ''}`}
                                        onClick={() => setActiveRightTab('chat')}
                                    >
                                        📡 Comunicações ({players.length})
                                    </button>
                                </div>
                            )}

                            {showRightSidebar && activeRightTab === 'layers' && (
                                <div className="layers-content">
                                    <div className="layers-list">
                                        {layers.map((layer, index) => (
                                            <div
                                                key={`${layer.id}-${index}`}
                                                className={`layer-item ${activeLayerId === layer.id ? 'active' : ''} ${layer.locked ? 'locked' : ''}`}
                                                draggable
                                                onDragStart={() => setDragLayerId(layer.id)}
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
                                                        title={layer.visible ? 'Desativar Visibilidade' : 'Ativar Visibilidade'}
                                                        disabled={playerRole !== 'editor'}
                                                    >
                                                        {layer.visible ? '👁️' : '🙈'}
                                                    </button>
                                                </div>

                                                <div className="layer-lock-toggle">
                                                    <button
                                                        className={`lock-btn ${layer.locked ? 'locked' : 'unlocked'} ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                                        onClick={() => toggleLayerLock(layer.id)}
                                                        title={layer.locked ? 'Liberar Setor' : 'Bloquear Setor'}
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


                                                </div>

                                                <div className="layer-actions">
                                                    <button
                                                        className={`layer-edit-btn ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                                        onClick={() => startEditingLayer(layer)}
                                                        title="Reclassificar Setor"
                                                        disabled={playerRole !== 'editor'}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className={`layer-delete-btn ${playerRole !== 'editor' ? 'disabled' : ''}`}
                                                        onClick={() => deleteLayer(layer.id)}
                                                        title="Desativar Setor"
                                                        disabled={playerRole !== 'editor'}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showRightSidebar && activeRightTab === 'chat' && (
                                <div className="chat-content">
                                    {showNameInput ? (
                                        <div className="name-input-container">
                                            <p>Tudo pronto para o briefing de missão!</p>
                                            <p>Para iniciar, insira sua identificação de oficial:</p>
                                            <input
                                                type="text"
                                                value={playerName}
                                                onChange={(e) => setPlayerName(e.target.value)}
                                                placeholder="Sua identificação de oficial"
                                                className="name-input"
                                                maxLength={20}
                                            />
                                            <button
                                                className="name-submit-btn"
                                                onClick={setPlayerNameHandler}
                                                disabled={!playerName.trim()}
                                            >
                                                Iniciar Briefing
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="chat-messages" ref={chatContainerRef}>
                                                {messages.map((message) => (
                                                    <div key={message.id} className="chat-message">
                                                        <div className="message-header">
                                                            <span
                                                                className="player-name"
                                                                style={{ color: message.playerColor }}
                                                            >
                                                                {message.playerName === playerName ? 'Oficial' : message.playerName}
                                                            </span>
                                                            <span className="message-time">
                                                                {new Date(message.timestamp).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        <div className="message-text">{message.text}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="chat-input-container">
                                                <input
                                                    type="text"
                                                    value={chatInput}
                                                    onChange={(e) => setChatInput(e.target.value)}
                                                    onKeyPress={handleChatKeyPress}
                                                    placeholder="Insira sua comunicação..."
                                                    className="chat-input"
                                                    maxLength={200}
                                                    disabled={playerRole !== 'editor'}
                                                />
                                                <button
                                                    className="chat-send-btn"
                                                    onClick={sendMessage}
                                                    disabled={!chatInput.trim() || playerRole !== 'editor'}
                                                >
                                                    Transmitir
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>




                </>
            ) : (
                <>
                    {/* Aba de Vídeos */}
                    <div className="videos-content">
                        <div className="videos-header">
                            <h2>📹 Centro de Inteligência</h2>
                            {playerRole === 'editor' && (
                                <button
                                    className="add-video-btn"
                                    onClick={() => setShowVideoModal(true)}
                                >
                                    ➕ Anexar Relatório
                                </button>
                            )}
                        </div>

                        <div className="videos-list">
                            {videoLinks.length === 0 ? (
                                <div className="no-videos">
                                    <p>Nenhum relatório de inteligência disponível.</p>
                                    <p>Anexe relatórios de vídeo para análise tática e planejamento de missão.</p>
                                </div>
                            ) : (
                                videoLinks.map((video) => (
                                    <div key={video.id} className="video-item">
                                        <div className="video-info">
                                            <div className="video-header">
                                                <h3>{video.title}</h3>
                                                <div className="video-meta">
                                                    <span className="player-name" style={{ color: video.playerColor }}>
                                                        {video.playerName}
                                                    </span>
                                                    <span className="video-time">
                                                        {new Date(video.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {video.description && (
                                                <p className="video-description">{video.description}</p>
                                            )}
                                            <div className="video-url">
                                                <a
                                                    href={video.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        openVideoLink(video.url);
                                                    }}
                                                >
                                                    🔗 {video.url}
                                                </a>
                                            </div>
                                        </div>

                                        {playerRole === 'editor' && (
                                            <button
                                                className="remove-video-btn"
                                                onClick={() => removeVideoLink(video.id)}
                                                title="Descartar Relatório"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Modal de Exportação */}
            {showExportModal && (
                <div className="export-modal">
                    <div className="modal-content">
                        <h2>💾 Registrar Operação</h2>
                        <p>Registre o estado atual da operação para futuras análises.</p>

                        <div className="export-info">
                            <p>Os seguintes itens serão registrados:</p>
                            <ul>
                                <li>Todos os setores de operação e marcações táticas.</li>
                                <li>Registro de comunicações.</li>
                                <li>Parâmetros de visualização do mapa.</li>
                                <li>Referências de inteligência.</li>
                            </ul>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="export-btn"
                                onClick={exportSession}
                            >
                                💾 Registrar Agora
                            </button>
                            <button className="cancel-btn" onClick={() => setShowExportModal(false)}>
                                Abortar
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
                        <h2>📋 Carregar Briefing de Missão</h2>
                        <p>Carregue um briefing de missão salvo anteriormente.</p>

                        <div className="import-methods">
                            <div className="import-method">
                                <h3>📁 Receber Transmissão</h3>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="file-input"
                                />
                            </div>

                            <div className="import-method">
                                <h3>📋 Decodificar Dados</h3>
                                <textarea
                                    placeholder="Cole aqui os dados do briefing..."
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
                                {isLoading ? '⏳ Decodificando...' : '📂 Iniciar Briefing'}
                            </button>
                            <button className="cancel-btn" onClick={() => {
                                setShowImportModal(false);
                                setImportData('');
                            }}>
                                Abortar
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

            {/* Modal de Adicionar Vídeo */}
            {showVideoModal && (
                <div className="video-modal">
                    <div className="modal-content">
                        <h2>📹 Anexar Relatório</h2>
                        <p>Adicione um relatório de vídeo para análise tática durante o planejamento.</p>

                        <div className="form-group">
                            <label htmlFor="video-title">Assunto do Relatório:</label>
                            <input
                                id="video-title"
                                type="text"
                                placeholder="Ex: Análise de Posicionamento Inimigo"
                                value={newVideoTitle}
                                onChange={(e) => setNewVideoTitle(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="video-url">Localização do Relatório (URL):</label>
                            <input
                                id="video-url"
                                type="url"
                                placeholder="https://..."
                                value={newVideoUrl}
                                onChange={(e) => setNewVideoUrl(e.target.value)}
                                className="form-input"
                            />
                            {newVideoUrl && !validateVideoUrl(newVideoUrl) && (
                                <div className="url-warning">
                                    Localização do relatório inválida ou de fonte não autorizada.
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="video-description">Observações do Oficial (Opcional):</label>
                            <textarea
                                id="video-description"
                                placeholder="Ex: Vídeo mostra posicionamento das forças inimigas na região norte"
                                value={newVideoDescription}
                                onChange={(e) => setNewVideoDescription(e.target.value)}
                                className="form-textarea"
                                rows={3}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="add-btn"
                                onClick={addVideoLink}
                                disabled={!newVideoTitle.trim() || !newVideoUrl.trim()}
                            >
                                ➕ Anexar
                            </button>
                            <button className="cancel-btn" onClick={() => setShowVideoModal(false)}>
                                Abortar
                            </button>
                        </div>
                        <button className="close-modal-btn" onClick={() => setShowVideoModal(false)}>
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Permissões */}
            {showPermissionModal && (
                <div className="permission-modal">
                    <div className="modal-content">
                        <h2>🔗 Transmitir Coordenadas</h2>
                        <p>Compartilhe o acesso ao mapa de operações com outros oficiais.</p>

                        <div className="permission-options">
                            <div
                                className={`permission-option ${selectedPermission === 'editor' ? 'active' : ''}`}
                                onClick={() => setSelectedPermission('editor')}
                            >
                                <h3>✏️ Oficial de Operações</h3>
                                <p>Pode desenhar, editar setores, gerenciar operações e transmitir comunicações.</p>
                            </div>

                            <div
                                className={`permission-option ${selectedPermission === 'viewer' ? 'active' : ''}`}
                                onClick={() => setSelectedPermission('viewer')}
                            >
                                <h3>👁️ Observador Tático</h3>
                                <p>Pode visualizar o mapa, setores e comunicações, mas não pode fazer alterações.</p>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="share-btn"
                                onClick={() => generateLink(selectedPermission)}
                            >
                                🔗 Gerar Link
                            </button>
                            <button className="cancel-btn" onClick={() => setShowPermissionModal(false)}>
                                Abortar
                            </button>
                        </div>
                        <button className="close-modal-btn" onClick={() => setShowPermissionModal(false)}>
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App; 