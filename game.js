// ==========================================
//  MERGE GUYS v2 - Sepet + Kombo
//  Suika Game Style Physics Merge Game
// ==========================================

(function () {
    'use strict';

    // ---- Lokalizasyon ----
    const LANG = {
        tr: {
            score: 'SKOR',
            highscore: 'EN YÜKSEK',
            next: 'SIRADAKI',
            current: 'MEVCUT',
            gameOver: 'OYUN BİTTİ',
            finalScore: 'SKOR',
            newHighscore: 'YENİ REKOR!',
            restart: 'TEKRAR OYNA',
            play: 'OYNA',
            title: 'MERGE GUYS',
            subtitle: 'Topları birleştir, yüksek skoru yakala!',
            instruction: 'Topları bırakmak için dokun veya tıkla',
            instructionMerge: 'Aynı toplar birleşir ve büyür!',
            maxCombo: 'MAKS KOMBO',
            combo: 'KOMBO'
        },
        en: {
            score: 'SCORE',
            highscore: 'BEST',
            next: 'NEXT',
            current: 'CURRENT',
            gameOver: 'GAME OVER',
            finalScore: 'SCORE',
            newHighscore: 'NEW RECORD!',
            restart: 'PLAY AGAIN',
            play: 'PLAY',
            title: 'MERGE GUYS',
            subtitle: 'Merge the balls, reach the high score!',
            instruction: 'Tap or click to drop balls',
            instructionMerge: 'Same balls merge and grow!',
            maxCombo: 'MAX COMBO',
            combo: 'COMBO'
        }
    };

    const userLang = (navigator.language || 'en').startsWith('tr') ? 'tr' : 'en';
    const L = LANG[userLang];

    function applyLocalization() {
        const el = (id) => document.getElementById(id);
        if (el('score-label-text')) el('score-label-text').textContent = L.score;
        if (el('highscore-label-text')) el('highscore-label-text').textContent = L.highscore;
        if (el('game-over-title')) el('game-over-title').textContent = L.gameOver;
        if (el('final-score-label')) el('final-score-label').textContent = L.finalScore;
        if (el('new-highscore-badge')) el('new-highscore-badge').textContent = L.newHighscore;
        if (el('restart-btn')) el('restart-btn').textContent = L.restart;
        if (el('start-title')) el('start-title').textContent = L.title;
        if (el('start-subtitle')) el('start-subtitle').textContent = L.subtitle;
        if (el('start-btn')) el('start-btn').textContent = L.play;
        if (el('instruction-text')) el('instruction-text').textContent = L.instruction;
        if (el('instruction-merge-text')) el('instruction-merge-text').textContent = L.instructionMerge;
    }

    // ---- Matter.js Alias ----
    const { Engine, Bodies, Body, Composite, Events } = Matter;

    // ---- Top Seviyeleri (15 seviye) - Canlı Renkler ----
    const LEVELS = [
        { label: 'level0',  radius: 14,  score: 2,    color: '#FF5757', gradient: ['#FF9A9A', '#D62828'], name: 'Tiny' },
        { label: 'level1',  radius: 21,  score: 4,    color: '#38BDF8', gradient: ['#7DD3FC', '#0284C7'], name: 'Small' },
        { label: 'level2',  radius: 29,  score: 8,    color: '#4ADE80', gradient: ['#86EFAC', '#16A34A'], name: 'Medium' },
        { label: 'level3',  radius: 38,  score: 16,   color: '#FB923C', gradient: ['#FDBA74', '#EA580C'], name: 'Large' },
        { label: 'level4',  radius: 48,  score: 32,   color: '#C084FC', gradient: ['#E0B0FF', '#9333EA'], name: 'X-Large' },
        { label: 'level5',  radius: 58,  score: 64,   color: '#FF6392', gradient: ['#FF97B7', '#DB2777'], name: 'Huge' },
        { label: 'level6',  radius: 68,  score: 128,  color: '#FBBF24', gradient: ['#FDE68A', '#D97706'], name: 'Giant' },
        { label: 'level7',  radius: 78,  score: 256,  color: '#34D399', gradient: ['#6EE7B7', '#059669'], name: 'Mega' },
        { label: 'level8',  radius: 88,  score: 512,  color: '#F87171', gradient: ['#FECACA', '#B91C1C'], name: 'Ultra' },
        { label: 'level9',  radius: 98,  score: 1024, color: '#818CF8', gradient: ['#C7D2FE', '#4F46E5'], name: 'Supreme' },
        { label: 'level10', radius: 108, score: 2048, color: '#FCD34D', gradient: ['#FEF3C7', '#B45309'], name: 'Titan' },
        { label: 'level11', radius: 118, score: 4096, color: '#2DD4BF', gradient: ['#99F6E4', '#0D9488'], name: 'Divine' },
        { label: 'level12', radius: 128, score: 8192,  color: '#FB7185', gradient: ['#FECDD3', '#E11D48'], name: 'Cosmic' },
        { label: 'level13', radius: 138, score: 16384, color: '#22D3EE', gradient: ['#A5F3FC', '#0891B2'], name: 'Eternal' },
        { label: 'level14', radius: 148, score: 32768, color: '#E879F9', gradient: ['#F5D0FE', '#A21CAF'], name: 'Celestial' }
    ];

    const MAX_SPAWN_LEVEL = 4;

    // ---- Oyun Değişkenleri ----
    let engine = null;
    let canvas = null;
    let ctx = null;
    let canvasContainer = null;
    let canvasWidth = 0;
    let canvasHeight = 0;

    let score = 0;
    let highScore = parseInt(localStorage.getItem('mergeGuysHighScore') || '0', 10);

    let currentBallLevel = 0;
    let nextBallLevel = 0;
    let ghostX = 0;
    let isPointerDown = false;
    let canDrop = true;
    let dropCooldown = 500;
    let dropCooldownTimer = 0;
    let gameOver = false;
    let gameStarted = false;

    // Sepet geometrisi
    let basketTopY = 0;       // Sepet üst kenarı Y
    let basketBottomY = 0;    // Sepet alt Y
    let basketTopLeft = 0;    // Sepet üst sol X
    let basketTopRight = 0;   // Sepet üst sağ X
    let basketBottomLeft = 0; // Sepet alt sol X
    let basketBottomRight = 0;// Sepet alt sağ X
    const BASKET_TOP_RATIO = 0.55;      // Sepet üst kenarı - yarı yükseklik
    const BASKET_NARROW_RATIO = 0.65;   // Alt genişliğin üst genişliğe oranı
    const BASKET_WALL_THICKNESS = 14;

    // Sepet genişleme sistemi
    let basketWidthMultiplier = 1.0;
    let basketExpanded60k = false;
    let pendingBasketExpansion = false;

    // Birleştirme sırasında çift silmeyi önlemek için set
    let mergedThisFrame = new Set();

    // Efektler
    let popEffects = [];
    let floatingTexts = [];
    let screenShake = { x: 0, y: 0, intensity: 0 };

    // Kombo sistemi
    let comboCount = 0;
    let comboTimer = 0;
    const COMBO_TIMEOUT = 2.0; // Saniye - kombo sıfırlanma süresi
    let maxCombo = 0;

    // Zorluk artışı
    let gameTime = 0;
    let gravityScale = 0.0015;  // Başlangıç yerçekimi artırıldı
    const GRAVITY_INCREASE_RATE = 0.0000003; // Çok yavaş artış



    // Web Audio API
    let audioCtx = null;
    let bgMusic = null;
    let isMuted = false;

    // ---- Yetenek (Ability) Sistemi Değişkenleri ----
    let energy = 0;
    const MAX_ENERGY = 100;
    let activeAbility = null; // 'shrink' | 'wildcard' | 'bomb' | 'swap' | null
    let slowMoTimer = 0;
    let frozenBalls = []; // Zaman dondurma: dondurulan topların referansları
    let blackholeTimer = 0;
    let earthquakeTimer = 0;
    let earthquakeTempWalls = [];
    let earthquakeGracePeriod = 0;
    let magnetTimer = 0;
    let energyRegenAccum = 0;
    let swapFirstBody = null; // Takas yeteneği: ilk seçilen top
    
    // ---- DOM Elementleri ----
    const scoreValueEl = document.getElementById('score-value');
    const highscoreValueEl = document.getElementById('highscore-value');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalScoreEl = document.getElementById('final-score');
    const comboInfoEl = document.getElementById('combo-info');
    const newHighscoreBadge = document.getElementById('new-highscore-badge');
    const restartBtn = document.getElementById('restart-btn');
    const startOverlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-btn');
    const evoCanvas = document.getElementById('evo-canvas');
    const evoCtx = evoCanvas ? evoCanvas.getContext('2d') : null;
    const muteBtn = document.getElementById('mute-btn');
    const iconSoundOn = document.getElementById('icon-sound-on');
    const iconSoundOff = document.getElementById('icon-sound-off');

    // Yetenek DOM
    const energyBarFill = document.getElementById('energy-bar-fill');
    const energyText = document.getElementById('energy-text');
    const abilityBtns = {
        earthquake: document.getElementById('btn-earthquake'),
        wildcard: document.getElementById('btn-wildcard'),
        shrink: document.getElementById('btn-shrink'),
        slowmo: document.getElementById('btn-slowmo'),
        blackhole: document.getElementById('btn-blackhole'),
        bomb: document.getElementById('btn-bomb'),
        magnet: document.getElementById('btn-magnet'),
        swap: document.getElementById('btn-swap')
    };

    // ---- Ses Sistemi (Prosedürel Web Audio + Arkaplan Müziği) ----
    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Arka plan müziğini (dark.mp3) başlat
            bgMusic = new Audio('müzik_1.mp3');
            bgMusic.loop = true;
            bgMusic.volume = 0.4; // Müziğin de çok patlamaması için %40 seviyesine aldık
            bgMusic.muted = isMuted;
            bgMusic.play().catch(e => console.log('Müzik otomatik başlatılamadı:', e));

        } catch (e) {
            audioCtx = null;
        }
    }

    function playDropSound() {
        if (!audioCtx || isMuted) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime); // 0.08'den düşürüldü
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.type = 'sine';
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
        osc.onended = () => { gain.disconnect(); };
    }

    function playMergeSound(levelIndex) {
        if (!audioCtx || isMuted) return;
        const baseFreq = 250 + levelIndex * 60;
        // Ana ton
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audioCtx.currentTime + 0.15);
        gain1.gain.setValueAtTime(0.05, audioCtx.currentTime); // 0.12'den düşürüldü
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc1.type = 'sine';
        osc1.start(audioCtx.currentTime);
        osc1.stop(audioCtx.currentTime + 0.3);
        osc1.onended = () => { gain1.disconnect(); };

        // Harmonik
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(baseFreq * 2, audioCtx.currentTime + 0.05);
        gain2.gain.setValueAtTime(0.02, audioCtx.currentTime + 0.05);  // 0.05'ten düşürüldü
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc2.type = 'triangle';
        osc2.start(audioCtx.currentTime + 0.05);
        osc2.stop(audioCtx.currentTime + 0.25);
        osc2.onended = () => { gain2.disconnect(); };
    }

    function playComboSound(combo) {
        if (!audioCtx || isMuted) return;
        const freq = 400 + combo * 80;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.8, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime); // 0.08'den düşürüldü
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.type = 'square';
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
        osc.onended = () => { gain.disconnect(); };
    }

    function playGameOverSound() {
        if (!audioCtx || isMuted) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime); // 0.15'ten düşürüldü
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
        osc.type = 'sawtooth';
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.7);
        osc.onended = () => { gain.disconnect(); };
    }

    // Haptic feedback (mobil titreşim)
    function vibrate(ms) {
        if (navigator.vibrate) {
            navigator.vibrate(ms);
        }
    }

    // ---- Başlangıç ----
    function init() {
        applyLocalization();
        highscoreValueEl.textContent = highScore;
        canvasContainer = document.getElementById('canvas-container');
        canvas = document.getElementById('game-canvas');

        resizeCanvas();
        setupPhysics();
        setupEvents();
        pickNextBall();
        currentBallLevel = Math.floor(Math.random() * (MAX_SPAWN_LEVEL + 1));

        // Start screen göster
        startOverlay.classList.remove('hidden');
        gameOverOverlay.classList.add('hidden');

        drawEvolutionBar();
        updateEnergyUI();

        // Oyun döngüsü
        requestAnimationFrame(gameLoop);
    }

    function resizeCanvas() {
        const rect = canvasContainer.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvasWidth = Math.floor(rect.width);
        canvasHeight = Math.floor(rect.height);
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
        ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Sepet geometrisi hesapla
        calculateBasket();
    }

    function calculateBasket() {
        const margin = canvasWidth * 0.06;
        basketTopY = canvasHeight * BASKET_TOP_RATIO;
        basketBottomY = canvasHeight - 12;
        const baseTopLeft = margin;
        const baseTopRight = canvasWidth - margin;
        const topWidth = (baseTopRight - baseTopLeft) * basketWidthMultiplier;
        const centerX = canvasWidth / 2;
        basketTopLeft = centerX - topWidth / 2;
        basketTopRight = centerX + topWidth / 2;
        const bottomWidth = topWidth * BASKET_NARROW_RATIO;
        basketBottomLeft = centerX - bottomWidth / 2;
        basketBottomRight = centerX + bottomWidth / 2;
    }

    // ---- X pozisyonunu sepet sınırlarına göre hesapla ----
    function getBasketXAtY(y) {
        if (y <= basketTopY) return { left: basketTopLeft, right: basketTopRight };
        if (y >= basketBottomY) return { left: basketBottomLeft, right: basketBottomRight };
        const t = (y - basketTopY) / (basketBottomY - basketTopY);
        return {
            left: basketTopLeft + (basketBottomLeft - basketTopLeft) * t,
            right: basketTopRight + (basketBottomRight - basketTopRight) * t
        };
    }

    // ---- Fizik Motoru Kurulumu ----
    function setupPhysics() {
        engine = Engine.create({
            gravity: { x: 0, y: 1.0, scale: gravityScale },
            positionIterations: 30,
            velocityIterations: 20,
            constraintIterations: 6,
            enableSleeping: false
        });

        createBasketWalls();

        // Collision detection - Birleştirme
        Events.on(engine, 'collisionStart', handleCollisions);
    }

    function createBasketWalls() {
        const wallOptions = {
            isStatic: true,
            friction: 0.1,     // Duvar sürtünmesi düşürüldü ki toplar yapışmasın
            restitution: 0.05, // Kenarlardan sekme iyileştirildi, neredeyse tamamen alındı
            render: { visible: false },
            label: 'wall'
        };

        const th = 80;                // Tünelleme önleme için kalın duvar
        const sideOverlap = 10;       // Yan duvarlar: az uzatma → toplar ağızdan taşabilsin
        const bottomOverlap = 60;     // Alt/köşe: tam koruma (toplar alttan kaçmasın)

        function createWall(x1, y1, x2, y2, isLeft, wallOverlap) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx);
            
            // Fiziksel sınırın tam olarak görsel çizgiye (x1,y1)->(x2,y2) oturması için dışa öteleme
            const nx = isLeft ? -dy/len : dy/len;
            const ny = isLeft ? dx/len : -dx/len;

            // Duvarı aşağı doğru kaydır (üste taşmaması, alta taşması için)
            // sideOverlap küçük olduğunda duvar ağız seviyesinde biter, alt tarafta uzar
            const shiftDown = wallOverlap * 0.4; // Aşağı yönde ofset
            const cx = (x1 + x2)/2 + nx * (th/2) + (dx/len) * shiftDown;
            const cy = (y1 + y2)/2 + ny * (th/2) + (dy/len) * shiftDown;

            return Bodies.rectangle(cx, cy, len + wallOverlap, th, {
                ...wallOptions,
                angle: angle
            });
        }

        const leftWall = createWall(basketTopLeft, basketTopY, basketBottomLeft, basketBottomY, true, sideOverlap);
        const rightWall = createWall(basketTopRight, basketTopY, basketBottomRight, basketBottomY, false, sideOverlap);
        
        // Alt duvar tam görsel basketBottomY çizgisine oturacak şekilde
        const bottomLen = Math.abs(basketBottomRight - basketBottomLeft) + bottomOverlap * 2;
        const bottomWall = Bodies.rectangle(
            canvasWidth / 2, basketBottomY + th / 2,
            bottomLen, th,
            { ...wallOptions, restitution: 0.05, friction: 0.5 }
        );

        // Köşelerden kaçıp düşebilecek toplara karşı koruma daireleri
        const cornerLeft = Bodies.circle(basketBottomLeft, basketBottomY, 15, { isStatic: true, label: 'wall', restitution: 0.05 });
        const cornerRight = Bodies.circle(basketBottomRight, basketBottomY, 15, { isStatic: true, label: 'wall', restitution: 0.05 });

        Composite.add(engine.world, [leftWall, rightWall, bottomWall, cornerLeft, cornerRight]);
    }

    // ---- Çarpışma Yönetimi ----
    function handleCollisions(event) {
        const pairs = event.pairs;

        for (let i = 0; i < pairs.length; i++) {
            const { bodyA, bodyB } = pairs[i];

            if (bodyA.label.startsWith('level') && bodyB.label.startsWith('level')) {
                if (bodyA.label === bodyB.label) {
                    if (mergedThisFrame.has(bodyA.id) || mergedThisFrame.has(bodyB.id)) {
                        continue;
                    }

                    mergedThisFrame.add(bodyA.id);
                    mergedThisFrame.add(bodyB.id);

                    const levelIndex = bodyA.levelIndex;
                    if (levelIndex >= LEVELS.length - 1) continue;

                    const midX = (bodyA.position.x + bodyB.position.x) / 2;
                    const midY = (bodyA.position.y + bodyB.position.y) / 2;

                    Composite.remove(engine.world, bodyA);
                    Composite.remove(engine.world, bodyB);

                    const newLevel = levelIndex + 1;
                    const newBall = createBall(midX, midY, newLevel);
                    Composite.add(engine.world, newBall);

                    comboCount++;
                    comboTimer = COMBO_TIMEOUT;
                    if (comboCount > maxCombo) maxCombo = comboCount;

                    const comboMultiplier = comboCount > 1 ? comboCount : 1;
                    const earnedScore = LEVELS[newLevel].score * comboMultiplier;
                    score += earnedScore;
                    scoreValueEl.textContent = score;

                    if (!basketExpanded60k && score >= 60000) {
                        basketExpanded60k = true;
                        basketWidthMultiplier = 1.08;
                        pendingBasketExpansion = true;
                    }

                    addEnergy(Math.max(2, Math.floor(earnedScore / 3)));
                    if (comboCount >= 3) addEnergy(comboCount * 2);

                    let text = '+' + earnedScore;
                    if (comboCount > 1) text += ' x' + comboCount;
                    floatingTexts.push({
                        x: midX, y: midY - 20, text: text,
                        color: LEVELS[newLevel].color, alpha: 1, time: 0,
                        isCombo: comboCount > 1
                    });

                    if (comboCount >= 3) {
                        floatingTexts.push({
                            x: canvasWidth / 2, y: basketTopY + 40,
                            text: L.combo + ' x' + comboCount + '!',
                            color: '#FFD700', alpha: 1, time: 0,
                            isCombo: true, big: true
                        });
                        playComboSound(comboCount);
                        vibrate([30, 20, 30]);
                    }

                    const popR = LEVELS[newLevel].radius * getScaleFactor() * 0.85;
                    popEffects.push({
                        x: midX, y: midY, radius: popR,
                        color: LEVELS[newLevel].color, gradient: LEVELS[newLevel].gradient,
                        alpha: 1, scale: 0.5, time: 0,
                        particles: generateParticles(midX, midY, LEVELS[newLevel].color, 14 + newLevel * 3),
                        isNew: true
                    });
                    popEffects.push({
                        x: midX, y: midY, radius: popR * 0.6,
                        color: '#ffffff', alpha: 0.8, scale: 1, time: 0
                    });

                    screenShake.intensity = Math.min(12, 3 + newLevel * 1.2);
                    playMergeSound(newLevel);
                    vibrate(15 + newLevel * 5);
                    drawEvolutionBar(newLevel);
                }
            }
        }
    }

    // ---- Parçacık Üretici ----
    function generateParticles(x, y, color, count) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = 60 + Math.random() * 120;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 40,
                radius: 1.5 + Math.random() * 3,
                color: color,
                alpha: 1,
                life: 0.4 + Math.random() * 0.4
            });
        }
        return particles;
    }

    function getScaleFactor() {
        return canvasWidth / 400;
    }

    // ---- Top Oluşturma ----
    function createBall(x, y, levelIndex) {
        const level = LEVELS[levelIndex];
        const scaleFactor = getScaleFactor();
        const scaledRadius = level.radius * scaleFactor * 0.85;

        // Sepetteki topların durma işlevini düzeltmek ve büyükleri ağır yapmak için:
        let initialFriction = 0.5;
        const ball = Bodies.circle(x, y, scaledRadius, {
            label: level.label,
            restitution: 0.05,
            friction: initialFriction,         
            frictionAir: 0.003 + (levelIndex * 0.0008), 
            density: 0.001 + (levelIndex * 0.0006), 
            slop: 0.01,
            render: { visible: false },
            collisionFilter: { group: 0, category: 0x0001, mask: 0xFFFF }
        });

        ball.baseFriction = initialFriction;

        ball.levelIndex = levelIndex;
        ball.scaledRadius = scaledRadius;
        ball.spawnTime = Date.now();

        return ball;
    }



    // ---- Ghost / Önizleme ----
    function drawGhost() {
        if (!canDrop || gameOver || !gameStarted) return;
        // Deprem sırasında kapak varken ghost gösterme
        if (earthquakeTimer > 0 && earthquakeTempWalls.length > 0) return;
        if (activeAbility === 'shrink' || activeAbility === 'wildcard' || activeAbility === 'bomb' || activeAbility === 'swap') return; // Hedeflemeli yeteneklerde ghost kapatılır

        const scaleFactor = getScaleFactor();
        let level = LEVELS[currentBallLevel];
        
        let scaledRadius = level.radius * scaleFactor * 0.85;

        // Kırmızı ile cizilen alanın hizası tahminen ekranın %25'i
        const dropY = canvasHeight * 0.25;
        // Top, her zaman sepet ağzından içeri düşebilmelidir, bu nedenle limitleri sepet genişliği olarak tutuyoruz
        const bounds = getBasketXAtY(basketTopY);
        const minX = bounds.left + scaledRadius + 8;
        const maxX = bounds.right - scaledRadius - 8;
        const clampedX = Math.max(minX, Math.min(maxX, ghostX));

        // Dikey kılavuz çizgi
        ctx.save();
        ctx.strokeStyle = 'rgba(108, 99, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(clampedX, dropY + scaledRadius + 5);
        ctx.lineTo(clampedX, basketBottomY);
        ctx.stroke();
        ctx.restore();

        // Ghost top
        ctx.save();
        ctx.globalAlpha = isPointerDown ? 0.55 : 0.3;

        let grd = ctx.createRadialGradient(
            clampedX - scaledRadius * 0.3, dropY - scaledRadius * 0.3, scaledRadius * 0.1,
            clampedX, dropY, scaledRadius
        );
        grd.addColorStop(0, level.gradient[0]);
        grd.addColorStop(1, level.gradient[1]);
        
        ctx.beginPath();
        ctx.arc(clampedX, dropY, scaledRadius, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Glowing kenar
        ctx.strokeStyle = level.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = isPointerDown ? 0.3 : 0.15;
        ctx.stroke();

        ctx.restore();
    }

    // ---- Top Bırakma ----
    function dropBall() {
        // Deprem kapağı açık değilse VE canDrop true ise bırak
        if (!canDrop || gameOver || !gameStarted) return;
        // Deprem sırasında kapak varsa top bırakmayı engelle, gracePeriod sırasında değil
        if (earthquakeTimer > 0 && earthquakeTempWalls.length > 0) return;

        initAudio(); // İlk etkileşimde ses başlat

        const scaleFactor = getScaleFactor();
        const scaledRadius = LEVELS[currentBallLevel].radius * scaleFactor * 0.85;
        
        // Kırmızı ile çizilen alan yüksekliği
        const dropY = canvasHeight * 0.25;
        const bounds = getBasketXAtY(basketTopY);
        const minX = bounds.left + scaledRadius + 8;
        const maxX = bounds.right - scaledRadius - 8;
        const clampedX = Math.max(minX, Math.min(maxX, ghostX));

        const ball = createBall(clampedX, dropY, currentBallLevel);
        Composite.add(engine.world, ball);

        canDrop = false;
        dropCooldownTimer = dropCooldown / 1000; // saniyeye çevir
        currentBallLevel = nextBallLevel;
        pickNextBall();

        playDropSound();
        vibrate(8);
        addEnergy(1); // Her top bıraktığında +1 enerji

        // Kombo sıfırlama zamanlaması (yeni top bırakıldığında)
        if (comboTimer <= 0) {
            comboCount = 0;
        }
    }

    function pickNextBall() {
        // Ağırlıklı rastgele seçim (Geliş sırası optimizasyonu: küçük toplar daha sık gelir)
        const rand = Math.random() * 100;
        if (rand < 35) {
            nextBallLevel = 0; // %35 ihtimal Tiny
        } else if (rand < 65) {
            nextBallLevel = 1; // %30 ihtimal Small
        } else if (rand < 85) {
            nextBallLevel = 2; // %20 ihtimal Medium
        } else if (rand < 96) {
            nextBallLevel = 3; // %11 ihtimal Large
        } else {
            nextBallLevel = 4; // %4 ihtimal X-Large
        }
    }

    // ---- Render Önbellek (Optimizasyon) ----
    const renderCache = new Map();

    function getCachedGradients(r, level) {
        if (!renderCache.has(level.label)) {
            const shadowGrd = ctx.createRadialGradient(0, r * 0.35, r * 0.2, 0, r * 0.35, r * 1.4);
            shadowGrd.addColorStop(0, 'rgba(0,0,0,0.18)');
            shadowGrd.addColorStop(1, 'rgba(0,0,0,0)');

            const bodyGrd = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.05, 0, 0, r);
            bodyGrd.addColorStop(0, level.gradient[0]);
            bodyGrd.addColorStop(1, level.gradient[1]);

            renderCache.set(level.label, { shadowGrd, bodyGrd, cachedR: r });
        } else {
            const cache = renderCache.get(level.label);
            if (Math.abs(cache.cachedR - r) > 0.5) {
                renderCache.delete(level.label);
                return getCachedGradients(r, level);
            }
        }
        return renderCache.get(level.label);
    }

    // ---- Topları Çiz (Daire + Gülen Surat) ----
    function renderBalls() {
        const bodies = Composite.allBodies(engine.world);

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            
            if (!body.label.startsWith('level')) continue;

            const level = LEVELS[body.levelIndex];
            if (!level) continue;

            const x = body.position.x;
            const y = body.position.y;
            const r = body.scaledRadius;
            const angle = body.angle;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            let gradients = getCachedGradients(r, level);

            // ---- Gölge ----
            ctx.beginPath();
            ctx.arc(0, r * 0.35, r * 1.4, 0, Math.PI * 2);
            ctx.fillStyle = gradients.shadowGrd;
            ctx.fill();

            // ---- Daire ----
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.closePath();

            ctx.fillStyle = gradients.bodyGrd;
            ctx.fill();

            // Glow kenar
            ctx.strokeStyle = level.color + '55';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // ---- İç Yansıma ----
            ctx.beginPath();
            ctx.ellipse(-r * 0.15, -r * 0.28, r * 0.5, r * 0.22, -0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.32)';
            ctx.fill();

            // Küçük spot
            ctx.beginPath();
            ctx.arc(-r * 0.3, -r * 0.38, r * 0.1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fill();

            // ---- Yüz İfadesi ----
            drawSmileyFace(r, level, body.levelIndex);

            ctx.restore();
        }
    }

    // ---- Yüz İfadesi Çizimi (belirgin gülen yüz) ----
    function drawSmileyFace(r, level, levelIndex) {
        if (r < 12) return;

        const faceColor = '#1a1a2e';
        const eyeY = -r * 0.13;
        const eyeSpacing = r * 0.24;
        const mouthY = r * 0.2;

        // ---- Gözler (beyaz alan + siyah göz bebeği) ----
        const eyeW = Math.max(3, r * 0.16);
        const eyeH = Math.max(3.5, r * 0.18);
        const pupilR = Math.max(1.5, r * 0.065);

        // Sol göz beyaz alanı
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();
        // Sol göz bebeği
        ctx.fillStyle = faceColor;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY + pupilR * 0.3, pupilR, 0, Math.PI * 2);
        ctx.fill();

        // Sağ göz beyaz alanı
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.ellipse(eyeSpacing, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();
        // Sağ göz bebeği
        ctx.fillStyle = faceColor;
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY + pupilR * 0.3, pupilR, 0, Math.PI * 2);
        ctx.fill();

        // ---- Göz parıltısı ----
        const glintR = Math.max(0.8, pupilR * 0.45);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(-eyeSpacing - pupilR * 0.35, eyeY - pupilR * 0.25, glintR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing - pupilR * 0.35, eyeY - pupilR * 0.25, glintR, 0, Math.PI * 2);
        ctx.fill();

        // ---- Yanaklar (pembe) ----
        const cheekR = Math.max(2, r * 0.09);
        ctx.fillStyle = 'rgba(255,120,150,0.25)';
        ctx.beginPath();
        ctx.arc(-eyeSpacing - r * 0.08, mouthY - r * 0.02, cheekR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing + r * 0.08, mouthY - r * 0.02, cheekR, 0, Math.PI * 2);
        ctx.fill();

        // ---- Ağız (belirgin gülümseme) ----
        const lw = Math.max(1.5, r * 0.045);
        const mW = r * 0.2;
        ctx.beginPath();
        ctx.arc(0, mouthY - r * 0.06, mW, 0.2, Math.PI - 0.2);
        ctx.strokeStyle = faceColor;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    // ---- Sepet Çizimi (\____/) ----
    function renderBasket() {
        ctx.save();

        // Sepet dolgu (yarı saydam)
        ctx.beginPath();
        ctx.moveTo(basketTopLeft, basketTopY);
        ctx.lineTo(basketBottomLeft, basketBottomY);
        ctx.lineTo(basketBottomRight, basketBottomY);
        ctx.lineTo(basketTopRight, basketTopY);
        ctx.closePath();

        const basketGrd = ctx.createLinearGradient(0, basketTopY, 0, basketBottomY);
        basketGrd.addColorStop(0, 'rgba(108, 99, 255, 0.02)');
        basketGrd.addColorStop(1, 'rgba(108, 99, 255, 0.08)');
        ctx.fillStyle = basketGrd;
        ctx.fill();

        // Sepet kenar çizgileri (neon efekt)
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Glow efekti
        ctx.shadowColor = 'rgba(108, 99, 255, 0.5)';
        ctx.shadowBlur = 10;

        // Sol kenar
        const edgeGrd = ctx.createLinearGradient(basketTopLeft, basketTopY, basketBottomLeft, basketBottomY);
        edgeGrd.addColorStop(0, 'rgba(108, 99, 255, 0.3)');
        edgeGrd.addColorStop(0.5, 'rgba(108, 99, 255, 0.6)');
        edgeGrd.addColorStop(1, 'rgba(108, 99, 255, 0.8)');
        ctx.strokeStyle = edgeGrd;

        ctx.beginPath();
        ctx.moveTo(basketTopLeft, basketTopY - 20);
        ctx.lineTo(basketBottomLeft, basketBottomY);
        ctx.lineTo(basketBottomRight, basketBottomY);
        ctx.lineTo(basketTopRight, basketTopY - 20);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Üst kenar köşe noktaları (küçük daireler)
        ctx.fillStyle = 'rgba(108, 99, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(basketTopLeft, basketTopY - 20, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(basketTopRight, basketTopY - 20, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ---- Sağ Üst Köşe: Mevcut + Sıradaki Top Gösterimi ----
    function drawBallPreviews() {
        const panelX = canvasWidth - 12;
        const panelY = 4; // Önceden 12'ydi, daha yukarı çıkarıldı
        const boxW = 60;
        const boxH = 110;
        const scaleFactor = getScaleFactor();

        ctx.save();

        // Panel arka planı
        const panelLeft = panelX - boxW;
        ctx.beginPath();
        drawRoundedRect(ctx, panelLeft, panelY, boxW, boxH, 10);
        ctx.fillStyle = 'rgba(20, 20, 50, 0.75)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(108, 99, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Mevcut top
        const currentLevel = LEVELS[currentBallLevel];
        const curR = Math.min(16, currentLevel.radius * scaleFactor * 0.35);
        const curCx = panelLeft + boxW / 2;
        const curCy = panelY + 28;

        // "MEVCUT" etiketi
        ctx.fillStyle = 'rgba(160, 160, 192, 0.8)';
        ctx.font = "bold 7px 'Outfit', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText(L.current, curCx, panelY + 11);

        // Mevcut top çizimi
        const curGrd = ctx.createRadialGradient(curCx - curR * 0.3, curCy - curR * 0.3, curR * 0.1, curCx, curCy, curR);
        curGrd.addColorStop(0, currentLevel.gradient[0]);
        curGrd.addColorStop(1, currentLevel.gradient[1]);
        ctx.beginPath();
        ctx.arc(curCx, curCy, curR, 0, Math.PI * 2);
        ctx.fillStyle = curGrd;
        ctx.fill();
        // Highlight
        ctx.beginPath();
        ctx.arc(curCx - curR * 0.25, curCy - curR * 0.3, curR * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();

        // Ayırıcı çizgi
        ctx.strokeStyle = 'rgba(108, 99, 255, 0.15)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(panelLeft + 8, panelY + boxH / 2);
        ctx.lineTo(panelLeft + boxW - 8, panelY + boxH / 2);
        ctx.stroke();

        // Sıradaki top
        const nextLevel = LEVELS[nextBallLevel];
        const nextR = Math.min(16, nextLevel.radius * scaleFactor * 0.35);
        const nextCy = panelY + boxH - 28;

        // "SIRADAKİ" etiketi
        ctx.fillStyle = 'rgba(160, 160, 192, 0.6)';
        ctx.font = "bold 7px 'Outfit', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText(L.next, curCx, panelY + boxH / 2 + 11);

        // Sıradaki top çizimi
        const nextGrd = ctx.createRadialGradient(curCx - nextR * 0.3, nextCy - nextR * 0.3, nextR * 0.1, curCx, nextCy, nextR);
        nextGrd.addColorStop(0, nextLevel.gradient[0]);
        nextGrd.addColorStop(1, nextLevel.gradient[1]);
        ctx.beginPath();
        ctx.arc(curCx, nextCy, nextR, 0, Math.PI * 2);
        ctx.fillStyle = nextGrd;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(curCx - nextR * 0.25, nextCy - nextR * 0.3, nextR * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();

        ctx.restore();
    }

    // ---- Kombo Göstergesi ----
    function drawComboIndicator() {
        if (comboCount < 2 || comboTimer <= 0) return;

        ctx.save();

        const cx = canvasWidth / 2;
        const cy = basketTopY - 35;
        const alpha = Math.min(1, comboTimer / 0.5);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFD700';
        ctx.font = "bold 18px 'Outfit', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(L.combo + ' x' + comboCount, cx, cy);

        // Kombo timer bar
        const barWidth = 80;
        const barHeight = 3;
        const barX = cx - barWidth / 2;
        const barY = cy + 14;
        const progress = comboTimer / COMBO_TIMEOUT;

        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const barGrd = ctx.createLinearGradient(barX, barY, barX + barWidth * progress, barY);
        barGrd.addColorStop(0, '#FFD700');
        barGrd.addColorStop(1, '#FF8C00');
        ctx.fillStyle = barGrd;
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        ctx.restore();
    }

    // ---- Pop Efektleri + Parçacıklar ----
    function renderPopEffects(dt) {
        // Ring efektleri
        for (let i = popEffects.length - 1; i >= 0; i--) {
            const p = popEffects[i];
            p.time += dt;
            p.alpha = Math.max(0, 1 - p.time / 0.5);
            p.scale = 1.5 + p.time * 3;

            if (p.alpha <= 0) {
                popEffects.splice(i, 1);
                continue;
            }

            // Expanding ring
            ctx.save();
            ctx.globalAlpha = p.alpha * 0.4;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * p.scale, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();

            // Inner flash
            if (p.time < 0.1) {
                ctx.save();
                ctx.globalAlpha = (1 - p.time / 0.1) * 0.3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 1.2, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.restore();
            }

            // Parçacıklar
            if (p.particles) {
                for (let j = p.particles.length - 1; j >= 0; j--) {
                    const pt = p.particles[j];
                    pt.x += pt.vx * dt;
                    pt.y += pt.vy * dt;
                    pt.vy += 200 * dt; // Yerçekimi
                    pt.life -= dt;
                    pt.alpha = Math.max(0, pt.life / 0.5);

                    if (pt.life <= 0) {
                        p.particles.splice(j, 1);
                        continue;
                    }

                    ctx.save();
                    ctx.globalAlpha = pt.alpha * 0.8;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, pt.radius * pt.alpha, 0, Math.PI * 2);
                    ctx.fillStyle = pt.color;
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
    }

    // ---- Floating Text ----
    function renderFloatingTexts(dt) {
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.time += dt;
            ft.y -= 40 * dt;
            ft.alpha = Math.max(0, 1 - ft.time / 1.2);

            if (ft.alpha <= 0) {
                floatingTexts.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.fillStyle = ft.color;
            const size = ft.big ? 20 : (ft.isCombo ? 14 : 12);
            ctx.font = `bold ${size}px 'Outfit', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Hafif gölge
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 6;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }

    // ---- Top Hız/Pozisyon Kısıtlama (Duvar Dışına Çıkmayı Engeller) ----
    function clampBallsToBasket() {
        const bodies = Composite.allBodies(engine.world);
        const MAX_VELOCITY = 18;

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (!body.label.startsWith('level')) continue;
            if (body.isStatic) continue;

            // Hız sınırlama - tunneling önleme
            const vx = body.velocity.x;
            const vy = body.velocity.y;
            const speed = Math.sqrt(vx * vx + vy * vy);
            if (speed > MAX_VELOCITY) {
                const s = MAX_VELOCITY / speed;
                Body.setVelocity(body, { x: vx * s, y: vy * s });
            }

            const x = body.position.x;
            const y = body.position.y;
            const r = body.scaledRadius;

            // --- ALT DUVAR KORUMASI (toplar alttan düşmesin) ---
            // Sadece alt sınır için sert düzeltme tutuluyor
            if (y > basketTopY) {
                const bottomMargin = r + 2;
                const bottomPen = y - (basketBottomY - bottomMargin);
                if (bottomPen > 0) {
                    Body.applyForce(body, body.position, { x: 0, y: -bottomPen * 0.35 * body.mass * 0.01 });
                    if (y > basketBottomY - r) {
                        Body.setPosition(body, { x: x, y: basketBottomY - r });
                    }
                    if (body.velocity.y > 0.5) {
                        Body.setVelocity(body, { x: body.velocity.x, y: body.velocity.y * 0.05 });
                    }
                }
            }

            // --- YAN DUVARLAR: SERT CLAMP YOK ---
            // Fiziksel Matter.js duvarları topları tutuyor.
            // Eğer toplar yeterince yığılırsa, ağız üstünden taşıp düşebilirler.
            // Buraya sert düzeltme KOYMUYORUZ → düşme (game over) mümkün.
        }
    }

    // ---- Top-Top Overlap Çözümleme (Penetrasyon Düzeltme) ----
    function resolveOverlaps() {
        const bodies = Composite.allBodies(engine.world);
        const balls = [];
        for (let i = 0; i < bodies.length; i++) {
            if (bodies[i].label.startsWith('level') && !bodies[i].isStatic) {
                balls.push(bodies[i]);
            }
        }

        const OVERLAP_ITERATIONS = 3; // Birden fazla geçiş, yığılmış topları kademeli çözer
        for (let iter = 0; iter < OVERLAP_ITERATIONS; iter++) {
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const a = balls[i];
                    const b = balls[j];
                    const dx = b.position.x - a.position.x;
                    const dy = b.position.y - a.position.y;
                    const distSq = dx * dx + dy * dy;
                    const minDist = a.scaledRadius + b.scaledRadius;
                    const minDistSq = minDist * minDist;

                    if (distSq < minDistSq && distSq > 0.01) {
                        const dist = Math.sqrt(distSq);
                        const overlap = minDist - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;

                        // Kütle oranına göre itme (ağır top az hareket eder)
                        const totalMass = a.mass + b.mass;
                        const ratioA = b.mass / totalMass;
                        const ratioB = a.mass / totalMass;

                        // Pozisyonu yarım overlap kadar ayır (yumuşak - her iterasyonda biraz)
                        const correction = overlap * 0.4;
                        Body.setPosition(a, {
                            x: a.position.x - nx * correction * ratioA,
                            y: a.position.y - ny * correction * ratioA
                        });
                        Body.setPosition(b, {
                            x: b.position.x + nx * correction * ratioB,
                            y: b.position.y + ny * correction * ratioB
                        });

                        // Birbirine giren toplara ayrılma hızı ver
                        const separationSpeed = overlap * 0.15;
                        const relVelN = (b.velocity.x - a.velocity.x) * nx + (b.velocity.y - a.velocity.y) * ny;
                        if (relVelN < 0.5) {
                            Body.setVelocity(a, {
                                x: a.velocity.x - nx * separationSpeed * ratioA,
                                y: a.velocity.y - ny * separationSpeed * ratioA
                            });
                            Body.setVelocity(b, {
                                x: b.velocity.x + nx * separationSpeed * ratioB,
                                y: b.velocity.y + ny * separationSpeed * ratioB
                            });
                        }
                    }
                }
            }
        }
    }

    // ---- Havada Takılan Topları Uyandırma ----
    // Topların serbest düşüş yapması gerekirken takılıp kalmasını önler.
    // enableSleeping=false olsa bile Matter.js bazı durumlarda topları
    // hareketsiz bırakabiliyor (overlap resolution, velocity sıfırlama vb.)
    function wakeStuckBalls() {
        const bodies = Composite.allBodies(engine.world);
        const now = Date.now();

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (!body.label.startsWith('level')) continue;
            if (body.isStatic) continue;

            // Yeni spawn olan toplara dokunma
            if (now - body.spawnTime < 800) continue;

            const vx = body.velocity.x;
            const vy = body.velocity.y;
            const speed = Math.sqrt(vx * vx + vy * vy);

            // Top neredeyse hareketsiz mi?
            if (speed < 0.15) {
                const y = body.position.y;
                const r = body.scaledRadius;

                // Top sepet tabanında veya diğer topların üstünde duruyorsa sorun yok.
                // Ama sepet tabanından uzaktaysa (havada asılı) → uyandır
                const distToBottom = basketBottomY - y - r;

                // Sepet içindeki toplarla gerçekten temas halinde mi kontrol et
                let isSupportedBelow = false;
                if (distToBottom < 5) {
                    // Tabana yakın, sorun yok
                    isSupportedBelow = true;
                } else {
                    // Altında başka top veya duvar var mı?
                    for (let j = 0; j < bodies.length; j++) {
                        const other = bodies[j];
                        if (other === body) continue;

                        // Duvarlar için farklı destek kontrolü
                        if (other.label === 'wall' || other.label === 'tempWall') {
                            // Duvar yakınlığını Matter.js bounds ile kontrol et
                            const wallBounds = other.bounds;
                            if (wallBounds && y + r >= wallBounds.min.y - 5 && y + r <= wallBounds.max.y + 5
                                && body.position.x >= wallBounds.min.x && body.position.x <= wallBounds.max.x) {
                                isSupportedBelow = true;
                                break;
                            }
                            continue;
                        }

                        if (!other.label.startsWith('level')) continue;

                        const dx = other.position.x - body.position.x;
                        const dy = other.position.y - body.position.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const otherR = other.scaledRadius || 0;
                        const touchDist = r + otherR + 5;

                        // Altında mı (dy > 0 = other daha aşağıda)?
                        if (dy > 0 && dist < touchDist) {
                            isSupportedBelow = true;
                            break;
                        }
                    }
                }

                // Havada asılı kalmış → hafif aşağı impulse ver
                if (!isSupportedBelow) {
                    Body.setVelocity(body, { x: vx, y: Math.max(vy, 0.5) });
                    // Uyku modundan çıkar (enableSleeping açıksa)
                    if (body.isSleeping) {
                        Matter.Sleeping.set(body, false);
                    }
                }
            }
        }
    }

    // ---- Sepetten Düşme Kontrolü (Game Over) ----
    // Toplar sepetin kenarlarından düşerse game over tetiklenir.
    function checkOverflow() {
        if (gameOver) return;
        // Deprem sırasında ve hemen sonrasında kontrol yapma
        if (earthquakeTimer > 0 || earthquakeGracePeriod > 0) return;

        const bodies = Composite.allBodies(engine.world);
        const now = Date.now();

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (!body.label.startsWith('level')) continue;
            if (body.isStatic) continue;

            // Kaos topu overflow kontrolüne dahil edilmemeli
            if (body._isChaos) continue;

            // Yeni spawn olan toplara 2.5 saniye tolerans (düşüş + yerleşme süresi)
            if (now - body.spawnTime < 2500) continue;

            const x = body.position.x;
            const y = body.position.y;
            const r = body.scaledRadius;

            // Top sepet altından düştüyse → Game Over
            if (y > basketBottomY + r + 20) {
                triggerGameOver();
                return;
            }

            // Top ekranın altından düştüyse → Game Over
            if (y > canvasHeight + r) {
                triggerGameOver();
                return;
            }

            // Top tamamen ekran dışına çıktıysa (sol/sağ) → Game Over
            if (x < -r * 2 || x > canvasWidth + r * 2) {
                triggerGameOver();
                return;
            }
        }
    }



    // ---- Game Over ----
    function triggerGameOver() {
        gameOver = true;
        gameStarted = false;

        // Aktif yetenekleri ve state'leri temizle
        activeAbility = null;
        swapFirstBody = null;
        dropCooldownTimer = 0;
        canDrop = true;

        // Donmuş topları çöz (yoksa static kalırlar)
        if (slowMoTimer > 0) {
            slowMoTimer = 0;
            unfreezeBalls();
        }

        // Kaos topunu temizle
        if (blackholeTimer > 0) {
            blackholeTimer = 0;
            removeChaosBall();
        }

        // Mıknatısı durdur
        magnetTimer = 0;

        // Deprem geçici duvarlarını temizle
        if (earthquakeTimer > 0 || earthquakeTempWalls.length > 0) {
            earthquakeTimer = 0;
            earthquakeGracePeriod = 0;
            if (earthquakeTempWalls.length > 0) {
                try { Composite.remove(engine.world, earthquakeTempWalls); } catch(e) {}
                earthquakeTempWalls = [];
            }
        }

        finalScoreEl.textContent = score;
        if (maxCombo > 1) {
            comboInfoEl.textContent = L.maxCombo + ': x' + maxCombo;
        } else {
            comboInfoEl.textContent = '';
        }

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('mergeGuysHighScore', String(highScore));
            highscoreValueEl.textContent = highScore;
            newHighscoreBadge.classList.remove('hidden');
        } else {
            newHighscoreBadge.classList.add('hidden');
        }

        playGameOverSound();
        vibrate([50, 30, 100]);

        updateEnergyUI();
        gameOverOverlay.classList.remove('hidden');
    }

    // ---- Oyun Yeniden Başlatma ----
    function restartGame() {
        // Eski engine'deki event listener'ları temizle (duplicate birikimini önle)
        Events.off(engine, 'collisionStart', handleCollisions);

        Composite.clear(engine.world);
        Engine.clear(engine);

        score = 0;
        scoreValueEl.textContent = '0';
        energy = 0;
        activeAbility = null;
        slowMoTimer = 0;
        frozenBalls = [];
        blackholeTimer = 0;
        earthquakeTimer = 0;
        earthquakeGracePeriod = 0;
        earthquakeTempWalls = [];
        magnetTimer = 0;
        energyRegenAccum = 0;
        swapFirstBody = null;
        dropCooldownTimer = 0;
        engine.timing.timeScale = 1;
        updateEnergyUI();
        gameOver = false;
        gameStarted = true;
        canDrop = true;
        mergedThisFrame.clear();
        popEffects = [];
        floatingTexts = [];

        comboCount = 0;
        comboTimer = 0;
        maxCombo = 0;
        gameTime = 0;
        gravityScale = 0.0015;
        basketWidthMultiplier = 1.0;
        basketExpanded60k = false;
        pendingBasketExpansion = false;
        renderCache.clear();
        screenShake = { x: 0, y: 0, intensity: 0 };

        // Sepet geometrisini yeniden hesapla (multiplier sıfırlandığı için)
        calculateBasket();
        setupPhysics();

        currentBallLevel = Math.floor(Math.random() * (MAX_SPAWN_LEVEL + 1));
        pickNextBall();
        drawEvolutionBar();

        gameOverOverlay.classList.add('hidden');
        startOverlay.classList.add('hidden');
    }

    // ---- Event Yönetimi ----
    function setupEvents() {
        canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
        canvas.addEventListener('pointermove', onPointerMove, { passive: false });
        canvas.addEventListener('pointerup', onPointerUp, { passive: false });
        canvas.addEventListener('pointercancel', onPointerUp, { passive: false });

        restartBtn.addEventListener('click', () => {
            initAudio();
            restartGame();
        });
        startBtn.addEventListener('click', () => {
            initAudio();
            gameStarted = true;
            gameOver = false;
            startOverlay.classList.add('hidden');
            currentBallLevel = Math.floor(Math.random() * (MAX_SPAWN_LEVEL + 1));
            pickNextBall();
            drawEvolutionBar();
        });

        window.addEventListener('resize', handleResize);
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                isMuted = !isMuted;
                if (bgMusic) bgMusic.muted = isMuted;
                
                if (isMuted) {
                    iconSoundOn.classList.add('hidden');
                    iconSoundOff.classList.remove('hidden');
                } else {
                    iconSoundOn.classList.remove('hidden');
                    iconSoundOff.classList.add('hidden');
                    initAudio(); // Initialize audio if it was not done yet
                }
            });
        }

        // Yetenek butonları eventleri
        setupAbilityEvents();
    }

    // ---- Yetenek Sistemleri Çekirdek Mantığı ----
    function addEnergy(amount) {
        if (gameOver || !gameStarted) return;
        energy = Math.min(MAX_ENERGY, energy + amount);
        updateEnergyUI();
    }

    function updateEnergyUI() {
        if(!energyBarFill || !energyText) return;
        const progress = (energy / MAX_ENERGY) * 100;
        energyBarFill.style.width = progress + '%';
        energyText.textContent = Math.floor(energy) + ' / ' + MAX_ENERGY;
        
        if (energy >= MAX_ENERGY) {
            energyBarFill.classList.add('maxed');
        } else {
            energyBarFill.classList.remove('maxed');
        }

        // Butonların hazır/aktif durumları
        for(let key in abilityBtns) {
            const btn = abilityBtns[key];
            if(!btn) continue;
            const cost = parseInt(btn.dataset.cost || '0', 10);
            
            // Seçili aktif yeteneği vurgula
            if (activeAbility === key && (key === 'shrink' || key === 'wildcard' || key === 'bomb' || key === 'swap')) {
                btn.classList.add('active-ability');
                btn.classList.remove('ready');
            } else {
                btn.classList.remove('active-ability');
                if (energy >= cost && activeAbility !== key) {
                    btn.classList.add('ready');
                } else {
                    btn.classList.remove('ready');
                }
            }
        }
    }

    function useAbility(abilityKey, cost) {
        if (gameOver || !gameStarted || energy < cost) return false;
        
        // Eğer zaten basılıysa iptal et
        if (activeAbility === abilityKey) {
            activeAbility = null;
            updateEnergyUI();
            return false;
        }

        switch (abilityKey) {
            case 'earthquake':
                energy -= cost;
                triggerEarthquake();
                activeAbility = null;
                break;
            case 'wildcard':
            case 'shrink':
            case 'bomb':
                activeAbility = abilityKey;
                
                // Oyuncuyu bilgilendirme
                const cx = canvasWidth / 2;
                const topY = canvasHeight * 0.3;
                const abilityTexts = {
                    shrink: { text: 'BÖLDÜRMEK İÇİN TIKLA', color: '#FF4757' },
                    wildcard: { text: 'JOKER HAZIR', color: '#FFD700' },
                    bomb: { text: 'PATLAT!', color: '#FF5252' }
                };
                const info = abilityTexts[abilityKey];
                floatingTexts.push({
                    x: cx, y: topY,
                    text: info.text,
                    color: info.color,
                    alpha: 1, time: 0, big: true
                });
                break;
            case 'swap':
                activeAbility = 'swap';
                swapFirstBody = null;
                floatingTexts.push({
                    x: canvasWidth / 2, y: canvasHeight * 0.3,
                    text: '1. TOPU SEÇ', color: '#00FFB3',
                    alpha: 1, time: 0, big: true
                });
                break;
            case 'slowmo':
                energy -= cost;
                triggerSlowMo();
                activeAbility = null;
                break;
            case 'blackhole':
                energy -= cost;
                triggerBlackhole();
                activeAbility = null;
                break;
            case 'magnet':
                energy -= cost;
                triggerMagnet();
                activeAbility = null;
                break;
        }
        updateEnergyUI();
        initAudio(); // ses izni vermek için
        vibrate(20);
        return true;
    }

    function triggerEarthquake() {
        const bodies = Composite.allBodies(engine.world);
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            if (b.label.startsWith('level')) {
                // Daha kontrollü deprem kuvveti (tunneling önlenir)
                const forceX = (Math.random() - 0.5) * 7.5;
                const forceY = -15 - (Math.random() * 7.5);
                Matter.Body.setVelocity(b, { x: forceX, y: forceY });
                

            }
        }
        
        // Önceki geçici duvarları temizle
        if (earthquakeTempWalls.length > 0) {
            try { Composite.remove(engine.world, earthquakeTempWalls); } catch(e) {}
            earthquakeTempWalls = [];
        }
        
        // Sepet ağzına kapak koy - toplar dışarı uçmasın
        // Sepet geometrisinin X ekseninde aynalaması (basketTopY merkezli)
        const wallOpts = { isStatic: true, restitution: 0.15, friction: 0.4, label: 'tempWall' };
        const th = 60;
        
        // Aynalama hesabı: sepet yüksekliği kadar yukarıya uzanan ters trapez
        const basketH = basketBottomY - basketTopY;
        const mirrorTopY = basketTopY - basketH; // Aynalanan kutunun tepesi
        
        // Aynalanan kutunun tepesi dar olacak (sepetin tabanı gibi)
        const topWidth = basketTopRight - basketTopLeft;
        const mirrorNarrowWidth = topWidth * BASKET_NARROW_RATIO;
        const centerX = canvasWidth / 2;
        const mirrorNarrowLeft = centerX - mirrorNarrowWidth / 2;
        const mirrorNarrowRight = centerX + mirrorNarrowWidth / 2;
        
        // Sol duvar: basketTopLeft,basketTopY -> mirrorNarrowLeft,mirrorTopY (açılı)
        function makeAngledWall(x1, y1, x2, y2) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx);
            return Bodies.rectangle((x1+x2)/2, (y1+y2)/2, len + th, th, {
                ...wallOpts, angle: angle
            });
        }
        
        const leftWall = makeAngledWall(basketTopLeft, basketTopY, mirrorNarrowLeft, mirrorTopY);
        const rightWall = makeAngledWall(basketTopRight, basketTopY, mirrorNarrowRight, mirrorTopY);
        // Tavan - aynalanan kutunun tepesi
        const ceilingWidth = mirrorNarrowWidth + th * 2;
        const ceiling = Bodies.rectangle(centerX, mirrorTopY - th / 2, ceilingWidth, th, wallOpts);
        
        earthquakeTempWalls = [leftWall, rightWall, ceiling];
        Composite.add(engine.world, earthquakeTempWalls);

        earthquakeTimer = 2.5;

        screenShake.intensity = 18;
        playDropSound();
        
        floatingTexts.push({
            x: canvasWidth / 2, y: canvasHeight * 0.4,
            text: 'DEPREM!',
            color: '#FF6B8A', alpha: 1, time: 0, big: true
        });
    }

    function triggerSlowMo() {
        // Zaman Dondurma: Mevcut tüm topları dondur, oyuncu yeni top bırakabilir
        slowMoTimer = 5.0;
        frozenBalls = [];
        const bodies = Composite.allBodies(engine.world);
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            if (b.label.startsWith('level')) {
                b._frozenVelX = b.velocity.x;
                b._frozenVelY = b.velocity.y;
                b._wasFrozen = true;
                Body.setStatic(b, true);
                frozenBalls.push(b);
            }
        }
        playGameOverSound();
        vibrate(25);
        
        floatingTexts.push({
            x: canvasWidth / 2, y: canvasHeight * 0.4,
            text: 'ZAMAN DONDU!',
            color: '#00E5FF', alpha: 1, time: 0, big: true
        });
    }

    function unfreezeBalls() {
        const worldBodies = new Set(Composite.allBodies(engine.world).map(b => b.id));
        for (let i = 0; i < frozenBalls.length; i++) {
            const b = frozenBalls[i];
            if (b._wasFrozen && worldBodies.has(b.id)) {
                Body.setStatic(b, false);
                Body.setVelocity(b, { x: b._frozenVelX || 0, y: b._frozenVelY || 0 });
            }
            delete b._wasFrozen;
            delete b._frozenVelX;
            delete b._frozenVelY;
        }
        frozenBalls = [];
    }

    function triggerBlackhole() {
        // Kaos Topu: Dokunduğu topu bir seviye yukarı evrimleştiren gezici top
        blackholeTimer = 4.0;
        
        // Sepet üstünden rastgele bir X'te kaos topu oluştur
        const bounds = getBasketXAtY(basketTopY);
        const margin = 30;
        const spawnX = bounds.left + margin + Math.random() * (bounds.right - bounds.left - margin * 2);
        const spawnY = basketTopY + 30;
        
        const scaleFactor = getScaleFactor();
        const chaosRadius = 18 * scaleFactor;
        
        const chaosBall = Bodies.circle(spawnX, spawnY, chaosRadius, {
            label: 'chaosball',
            restitution: 0.6,
            friction: 0.1,
            frictionAir: 0.002,
            density: 0.0005,
            slop: 0.08,
            render: { visible: false },
            collisionFilter: { group: 0, category: 0x0001, mask: 0xFFFF }
        });
        chaosBall.scaledRadius = chaosRadius;
        chaosBall._isChaos = true;
        chaosBall._chaosHits = 0;
        chaosBall._chaosCooldown = 0;
        chaosBall.spawnTime = Date.now();
        
        Composite.add(engine.world, chaosBall);
        
        // Rastgele başlangıç hızı
        Body.setVelocity(chaosBall, { x: (Math.random() - 0.5) * 5, y: -2 });
        
        playMergeSound(5);
        vibrate([20, 10, 30]);
        screenShake.intensity = 5;
        
        floatingTexts.push({
            x: canvasWidth / 2, y: canvasHeight * 0.4,
            text: 'KAOS TOPU!',
            color: '#B340FF', alpha: 1, time: 0, big: true
        });
    }

    const CHAOS_MAX_HITS = 3;       // Maksimum dokunma sayısı
    const CHAOS_HIT_COOLDOWN = 0.8; // Dokunmalar arası bekleme (saniye)
    const CHAOS_MAX_LEVEL = 8;      // Sadece level 0-8 arası topları etkiler

    function updateChaosBall(dt) {
        if (blackholeTimer <= 0) return;
        
        const bodies = Composite.allBodies(engine.world);
        const chaosBall = bodies.find(b => b._isChaos);
        if (!chaosBall) {
            blackholeTimer = 0;
            return;
        }
        
        // Cooldown say
        if (chaosBall._chaosCooldown > 0) {
            chaosBall._chaosCooldown -= dt;
        }
        
        // Kaos topu sepet içinde kalsın
        const y = chaosBall.position.y;
        const x = chaosBall.position.x;
        const r = chaosBall.scaledRadius;
        if (y > basketTopY) {
            const bounds = getBasketXAtY(y);
            if (x < bounds.left + r + 5) {
                Body.setPosition(chaosBall, { x: bounds.left + r + 5, y: y });
                Body.setVelocity(chaosBall, { x: Math.abs(chaosBall.velocity.x) * 0.8, y: chaosBall.velocity.y });
            }
            if (x > bounds.right - r - 5) {
                Body.setPosition(chaosBall, { x: bounds.right - r - 5, y: y });
                Body.setVelocity(chaosBall, { x: -Math.abs(chaosBall.velocity.x) * 0.8, y: chaosBall.velocity.y });
            }
        }
        
        // Maks hit'e ulaştıysa erken bitir
        if (chaosBall._chaosHits >= CHAOS_MAX_HITS) {
            blackholeTimer = 0;
            removeChaosBall();
            return;
        }
        
        // Cooldown'daysa dokunma kontrolü yapma
        if (chaosBall._chaosCooldown > 0) return;
        
        // Dokunduğu level toplarını kontrol et
        const ballBodies = bodies.filter(b => b.label.startsWith('level'));
        for (let i = 0; i < ballBodies.length; i++) {
            const ball = ballBodies[i];
            if (ball.isStatic) continue;
            const dx = ball.position.x - chaosBall.position.x;
            const dy = ball.position.y - chaosBall.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const touchDist = ball.scaledRadius + chaosBall.scaledRadius + 2;
            
            if (dist < touchDist) {
                const lvl = ball.levelIndex;
                // Sadece düşük seviye topları etkile (level 0-8)
                if (lvl > CHAOS_MAX_LEVEL || lvl >= LEVELS.length - 1) continue;
                
                const bx = ball.position.x;
                const by = ball.position.y;
                const newLevel = lvl + 1;
                
                Composite.remove(engine.world, ball);
                const newBall = createBall(bx, by, newLevel);
                Composite.add(engine.world, newBall);
                
                // Skor ver
                const earnedScore = LEVELS[newLevel].score;
                score += earnedScore;
                scoreValueEl.textContent = score;
                addEnergy(Math.max(1, Math.floor(earnedScore / 4)));

                // 60K sepet genişleme kontrolü (kaos topu üzerinden de ulaşılabilir)
                if (!basketExpanded60k && score >= 60000) {
                    basketExpanded60k = true;
                    basketWidthMultiplier = 1.08;
                    pendingBasketExpansion = true;
                }
                
                popEffects.push({
                    x: bx, y: by, radius: newBall.scaledRadius,
                    color: '#B340FF', gradient: ['#DDA0FF', '#8800CC'],
                    alpha: 1, scale: 0.5, time: 0,
                    particles: generateParticles(bx, by, '#B340FF', 10),
                    isNew: true
                });
                
                const hitsLeft = CHAOS_MAX_HITS - chaosBall._chaosHits - 1;
                floatingTexts.push({
                    x: bx, y: by - 25, text: 'KAOS +' + earnedScore + (hitsLeft > 0 ? ' (' + hitsLeft + ')' : ''),
                    color: '#B340FF', alpha: 1, time: 0
                });
                
                playMergeSound(newLevel);
                vibrate(15);
                
                chaosBall._chaosHits++;
                chaosBall._chaosCooldown = CHAOS_HIT_COOLDOWN;
                
                // Kaos topu dokunduktan sonra sekmesi için
                Body.setVelocity(chaosBall, {
                    x: -dx / dist * 3 + (Math.random() - 0.5) * 2,
                    y: -2.5 - Math.random() * 1.5
                });
                break;
            }
        }
    }

    function removeChaosBall() {
        const bodies = Composite.allBodies(engine.world);
        const chaosBall = bodies.find(b => b._isChaos);
        if (chaosBall) {
            popEffects.push({
                x: chaosBall.position.x, y: chaosBall.position.y,
                radius: chaosBall.scaledRadius * 2,
                color: '#B340FF', alpha: 0.8, scale: 1, time: 0,
                particles: generateParticles(chaosBall.position.x, chaosBall.position.y, '#B340FF', 12)
            });
            Composite.remove(engine.world, chaosBall);
        }
    }

    // ---- BOMBA YETENEĞİ (Zincirleme Patlama) ----
    function handleBombClick(pos) {
        const bodies = Composite.allBodies(engine.world);
        const ballBodies = bodies.filter(b => b.label.startsWith('level'));
        
        const clickedBodies = Matter.Query.point(ballBodies, pos);
        if (clickedBodies.length > 0) {
            const body = clickedBodies[0];
            const cost = parseInt(abilityBtns['bomb'].dataset.cost || '35', 10);
            energy -= cost;
            activeAbility = null;
            updateEnergyUI();

            const targetLabel = body.label;
            // Aynı seviyedeki tüm topları bul (zincirleme patlama)
            const chainTargets = ballBodies.filter(b => b.label === targetLabel);
            const destroyedPositions = [];

            for (let t = 0; t < chainTargets.length; t++) {
                const target = chainTargets[t];
                const bx = target.position.x;
                const by = target.position.y;
                const br = target.scaledRadius;
                destroyedPositions.push({ x: bx, y: by, r: br });

                // Patlama efekti
                popEffects.push({
                    x: bx, y: by, radius: br * 1.5,
                    color: '#FF5252', gradient: ['#FFB3B3', '#FF0000'],
                    alpha: 1, scale: 0.5, time: 0,
                    particles: generateParticles(bx, by, '#FF5252', 15 + target.levelIndex * 2)
                });
                popEffects.push({
                    x: bx, y: by, radius: br * 0.8,
                    color: '#FFD700', alpha: 0.9, scale: 1, time: 0
                });

                Composite.remove(engine.world, target);
            }

            // Her patlayan topun etrafındaki komşu topları it (patlama dalgası)
            const remainingBalls = Composite.allBodies(engine.world).filter(b => b.label.startsWith('level'));
            for (let d = 0; d < destroyedPositions.length; d++) {
                const dp = destroyedPositions[d];
                const blastRadius = dp.r * 3.5;
                for (let i = 0; i < remainingBalls.length; i++) {
                    const other = remainingBalls[i];
                    const dx = other.position.x - dp.x;
                    const dy = other.position.y - dp.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < blastRadius && dist > 0) {
                        const force = Math.min(5, (blastRadius - dist) / blastRadius * 6);
                        const nx = dx / dist;
                        const ny = dy / dist;
                        Body.setVelocity(other, {
                            x: other.velocity.x + nx * force,
                            y: other.velocity.y + ny * force - 1.5
                        });
                    }
                }
            }

            screenShake.intensity = Math.min(18, 8 + chainTargets.length * 3);
            playMergeSound(Math.min(body.levelIndex + 2, LEVELS.length - 1));
            vibrate([30, 15, 40]);

            const chainText = chainTargets.length > 1 ? 'ZİNCİR PATLAMA x' + chainTargets.length + '!' : 'BOMBA!';
            floatingTexts.push({
                x: pos.x, y: pos.y - 30, text: chainText, color: '#FF5252', alpha: 1, time: 0, big: true
            });
        } else {
            activeAbility = null;
            updateEnergyUI();
            floatingTexts.push({
                x: pos.x, y: pos.y - 30, text: 'İptal Edildi', color: '#a0a0c0', alpha: 1, time: 0
            });
        }
    }

    // ---- MIKNATIS YETENEĞİ ----
    function triggerMagnet() {
        magnetTimer = 7.0;
        playMergeSound(3);
        vibrate(25);
        
        floatingTexts.push({
            x: canvasWidth / 2, y: canvasHeight * 0.4,
            text: 'MIKNATIS!',
            color: '#00AAFF', alpha: 1, time: 0, big: true
        });
    }

    function updateMagnet(dt) {
        if (magnetTimer <= 0) return;
        
        const bodies = Composite.allBodies(engine.world);
        const ballBodies = bodies.filter(b => b.label.startsWith('level') && !b.isStatic);
        
        for (let i = 0; i < ballBodies.length; i++) {
            for (let j = i + 1; j < ballBodies.length; j++) {
                const a = ballBodies[i];
                const b = ballBodies[j];
                if (a.label !== b.label) continue;
                
                const dx = b.position.x - a.position.x;
                const dy = b.position.y - a.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                const maxDist = (a.scaledRadius + b.scaledRadius) * 10;
                if (dist > maxDist || dist < 1) continue;
                
                const ratio = 1 - dist / maxDist;
                const strength = 0.005 * ratio * ratio;
                const nx = dx / dist;
                const ny = dy / dist;
                
                Body.applyForce(a, a.position, { x: nx * strength, y: ny * strength });
                Body.applyForce(b, b.position, { x: -nx * strength, y: -ny * strength });
            }
        }
    }

    function drawMagnetLines() {
        if (magnetTimer <= 0) return;
        const bodies = Composite.allBodies(engine.world);
        const ballBodies = bodies.filter(b => b.label.startsWith('level'));
        
        ctx.save();
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        
        for (let i = 0; i < ballBodies.length; i++) {
            for (let j = i + 1; j < ballBodies.length; j++) {
                const a = ballBodies[i];
                const b = ballBodies[j];
                if (a.label !== b.label) continue;
                
                const dx = b.position.x - a.position.x;
                const dy = b.position.y - a.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = (a.scaledRadius + b.scaledRadius) * 8;
                if (dist > maxDist) continue;
                
                const alpha = 0.4 * (1 - dist / maxDist);
                ctx.strokeStyle = 'rgba(0, 170, 255, ' + alpha + ')';
                ctx.beginPath();
                ctx.moveTo(a.position.x, a.position.y);
                ctx.lineTo(b.position.x, b.position.y);
                ctx.stroke();
            }
        }
        ctx.setLineDash([]);
        ctx.restore();
    }

    function setupAbilityEvents() {
        if (!abilityBtns.earthquake) return;
        
        const attach = (key) => {
            const btn = abilityBtns[key];
            if (!btn) return;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const cost = parseInt(btn.dataset.cost || '0', 10);
                useAbility(key, cost);
            });
        };
        
        attach('earthquake');
        attach('wildcard');
        attach('shrink');
        attach('slowmo');
        attach('blackhole');
        attach('bomb');
        attach('magnet');
        attach('swap');
    }

    function getCanvasPos(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        return {
            x: (clientX - rect.left) * (canvasWidth / rect.width),
            y: (clientY - rect.top) * (canvasHeight / rect.height)
        };
    }

    function onPointerDown(e) {
        if(e.button !== undefined && e.button !== 0) return; // Sadece sol tık
        e.preventDefault();
        const pos = getCanvasPos(e);
        
        if (activeAbility === 'shrink') {
            handleShrinkClick(pos);
            return;
        }
        if (activeAbility === 'wildcard') {
            handleWildcardClick(pos);
            return;
        }
        if (activeAbility === 'bomb') {
            handleBombClick(pos);
            return;
        }
        if (activeAbility === 'swap') {
            handleSwapClick(pos);
            return;
        }

        isPointerDown = true;
        ghostX = pos.x;
    }

    function handleWildcardClick(pos) {
        const bodies = Composite.allBodies(engine.world);
        const ballBodies = bodies.filter(b => b.label.startsWith('level'));
        
        const clickedBodies = Matter.Query.point(ballBodies, pos);
        if (clickedBodies.length > 0) {
            const body = clickedBodies[0];
            const lvl = body.levelIndex;
            if (lvl < LEVELS.length - 1) { // Eğer maksimum seviyede değilse
                // Enerji düş
                const cost = parseInt(abilityBtns['wildcard'].dataset.cost || '40', 10);
                energy -= cost;
                activeAbility = null;
                updateEnergyUI();

                const newLevel = lvl + 1;
                // Yeni topun boyutunu hesapla
                const newRadius = LEVELS[newLevel].radius * getScaleFactor() * 0.85;
                const bounds = getBasketXAtY(body.position.y);
                
                // Duvar içine taşıp fiziği bozmasını (rastgele fırlamasını) önle
                let safeX = body.position.x;
                if (safeX < bounds.left + newRadius + 10) safeX = bounds.left + newRadius + 10;
                if (safeX > bounds.right - newRadius - 10) safeX = bounds.right - newRadius - 10;
                
                const py = body.position.y;
                Composite.remove(engine.world, body);
                
                const newBall = createBall(safeX, py, newLevel);
                Composite.add(engine.world, newBall);

                playMergeSound(newLevel);
                vibrate(20);

                const popR = newRadius;
                popEffects.push({
                    x: safeX, y: py, radius: popR,
                    color: '#FFD700', gradient: ['#ffffff', '#FFD700'],
                    alpha: 1, scale: 0.5, time: 0,
                    particles: generateParticles(safeX, py, '#FFD700', 15),
                    isNew: true
                });
                
                floatingTexts.push({
                    x: safeX, y: py - 30, text: 'EVRİM!', color: '#FFD700', alpha: 1, time: 0
                });
            } else {
                activeAbility = null;
                updateEnergyUI();
                floatingTexts.push({
                    x: pos.x, y: pos.y - 30, text: 'Maksimum Seviye!', color: '#FFD700', alpha: 1, time: 0
                });
            }
        } else {
            activeAbility = null;
            updateEnergyUI();
            floatingTexts.push({
                x: pos.x, y: pos.y - 30, text: 'İptal Edildi', color: '#a0a0c0', alpha: 1, time: 0
            });
        }
    }

    // ---- BÖLÜNME YETENEĞİ (Split) ----
    function handleShrinkClick(pos) {
        const bodies = Composite.allBodies(engine.world);
        const ballBodies = bodies.filter(b => b.label.startsWith('level'));
        
        const clickedBodies = Matter.Query.point(ballBodies, pos);
        if (clickedBodies.length > 0) {
            const body = clickedBodies[0];
            const lvl = body.levelIndex;
            if (lvl > 0) {
                const cost = parseInt(abilityBtns['shrink'].dataset.cost || '30', 10);
                energy -= cost;
                activeAbility = null;
                updateEnergyUI();

                const bx = body.position.x;
                const by = body.position.y;
                const br = body.scaledRadius;

                // Parçacık patlaması
                popEffects.push({
                    x: bx, y: by, radius: br,
                    color: '#FF4757', gradient: ['#ffffff', '#FF4757'],
                    alpha: 1, scale: 0.5, time: 0,
                    particles: generateParticles(bx, by, '#FF4757', 18)
                });

                // Orijinal topu sil
                Composite.remove(engine.world, body);

                // Bir alt seviyeden 2 top oluştur
                const newLevel = lvl - 1;
                const newRadius = LEVELS[newLevel].radius * getScaleFactor() * 0.85;
                const bounds = getBasketXAtY(by);
                const offset = newRadius + 4;

                let leftX = bx - offset;
                let rightX = bx + offset;
                if (leftX < bounds.left + newRadius + 5) leftX = bounds.left + newRadius + 5;
                if (rightX > bounds.right - newRadius - 5) rightX = bounds.right - newRadius - 5;

                const ball1 = createBall(leftX, by, newLevel);
                const ball2 = createBall(rightX, by, newLevel);
                // Topları hafifçe dışa it
                Body.setVelocity(ball1, { x: -2, y: -1 });
                Body.setVelocity(ball2, { x: 2, y: -1 });
                Composite.add(engine.world, [ball1, ball2]);

                playDropSound();
                vibrate([15, 10, 15]);
                screenShake.intensity = 4;

                floatingTexts.push({
                    x: bx, y: by - 30, text: 'BÖLÜNDÜ!', color: '#FF4757', alpha: 1, time: 0, big: true
                });
            } else {
                // Level 0 topu bölünemez, yok et
                const cost = parseInt(abilityBtns['shrink'].dataset.cost || '30', 10);
                energy -= cost;
                activeAbility = null;
                updateEnergyUI();

                // Referansı silmeden önce kaydet
                const destroyX = body.position.x;
                const destroyY = body.position.y;
                const destroyR = body.scaledRadius;

                popEffects.push({
                    x: destroyX, y: destroyY, radius: destroyR,
                    color: '#ffffff', alpha: 1, scale: 0.5, time: 0,
                    particles: generateParticles(destroyX, destroyY, '#ffffff', 12)
                });
                Composite.remove(engine.world, body);
                playDropSound();

                floatingTexts.push({
                    x: destroyX, y: destroyY - 30, text: 'YOK EDİLDİ!', color: '#FF4757', alpha: 1, time: 0
                });
            }
        } else {
            activeAbility = null;
            updateEnergyUI();
            floatingTexts.push({
                x: pos.x, y: pos.y - 30, text: 'İptal Edildi', color: '#a0a0c0', alpha: 1, time: 0
            });
        }
    }

    // ---- TAKAS YETENEĞİ (Swap) ----
    function handleSwapClick(pos) {
        const bodies = Composite.allBodies(engine.world);
        const ballBodies = bodies.filter(b => b.label.startsWith('level'));
        const clickedBodies = Matter.Query.point(ballBodies, pos);

        if (clickedBodies.length > 0) {
            const body = clickedBodies[0];

            if (!swapFirstBody) {
                // İlk top seçildi
                swapFirstBody = body;
                swapFirstBody._swapHighlight = true;
                floatingTexts.push({
                    x: body.position.x, y: body.position.y - body.scaledRadius - 15,
                    text: '2. TOPU SEÇ', color: '#00FFB3', alpha: 1, time: 0, big: true
                });
            } else {
                // İlk seçilen top hala dünyada mı kontrol et (merge/bomba ile silinmiş olabilir)
                const worldBodyIds = new Set(Composite.allBodies(engine.world).map(b => b.id));
                if (!worldBodyIds.has(swapFirstBody.id)) {
                    // İlk top artık yok, iptal et
                    swapFirstBody = null;
                    activeAbility = null;
                    updateEnergyUI();
                    floatingTexts.push({
                        x: pos.x, y: pos.y - 30, text: 'Hedef Kayboldu!', color: '#FF4757', alpha: 1, time: 0
                    });
                    return;
                }

                if (swapFirstBody.id === body.id) {
                    // Aynı topa tekrar tıklandı, iptal
                    delete swapFirstBody._swapHighlight;
                    swapFirstBody = null;
                    activeAbility = null;
                    updateEnergyUI();
                    floatingTexts.push({
                        x: pos.x, y: pos.y - 30, text: 'İptal Edildi', color: '#a0a0c0', alpha: 1, time: 0
                    });
                    return;
                }

                // İkinci top seçildi - Takas yap
                const cost = parseInt(abilityBtns['swap'].dataset.cost || '15', 10);
                energy -= cost;
                activeAbility = null;
                updateEnergyUI();

                const pos1 = { x: swapFirstBody.position.x, y: swapFirstBody.position.y };
                const pos2 = { x: body.position.x, y: body.position.y };

                Body.setPosition(swapFirstBody, pos2);
                Body.setPosition(body, pos1);
                Body.setVelocity(swapFirstBody, { x: 0, y: 0 });
                Body.setVelocity(body, { x: 0, y: 0 });

                delete swapFirstBody._swapHighlight;

                // Efektler
                popEffects.push({
                    x: pos1.x, y: pos1.y, radius: 20,
                    color: '#00FFB3', alpha: 0.8, scale: 1, time: 0,
                    particles: generateParticles(pos1.x, pos1.y, '#00FFB3', 8)
                });
                popEffects.push({
                    x: pos2.x, y: pos2.y, radius: 20,
                    color: '#00FFB3', alpha: 0.8, scale: 1, time: 0,
                    particles: generateParticles(pos2.x, pos2.y, '#00FFB3', 8)
                });

                playMergeSound(2);
                vibrate(20);
                swapFirstBody = null;

                floatingTexts.push({
                    x: canvasWidth / 2, y: canvasHeight * 0.35,
                    text: 'TAKAS!', color: '#00FFB3', alpha: 1, time: 0, big: true
                });
            }
        } else {
            // Boşluğa tıklandı - iptal
            if (swapFirstBody) delete swapFirstBody._swapHighlight;
            swapFirstBody = null;
            activeAbility = null;
            updateEnergyUI();
            floatingTexts.push({
                x: pos.x, y: pos.y - 30, text: 'İptal Edildi', color: '#a0a0c0', alpha: 1, time: 0
            });
        }
    }

    function onPointerMove(e) {
        e.preventDefault();
        if (!isPointerDown) return;
        const pos = getCanvasPos(e);
        ghostX = pos.x;
    }

    function onPointerUp(e) {
        e.preventDefault();
        if (isPointerDown) {
            dropBall();
        }
        isPointerDown = false;
    }

    function handleResize() {
        resizeCanvas();
        renderCache.clear();

        if (engine) {
            const bodies = Composite.allBodies(engine.world);
            // Hem kalıcı hem geçici duvarları temizle
            const walls = bodies.filter(b => b.label === 'wall' || b.label === 'tempWall');
            for (const w of walls) {
                Composite.remove(engine.world, w);
            }
            // Geçici deprem duvarları referansını da temizle
            earthquakeTempWalls = [];
            createBasketWalls();
        }

        drawEvolutionBar();
    }

    // ---- Evolüsyon Barı ----
    function drawEvolutionBar(highlightLevel) {
        if (!evoCanvas || !evoCtx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = evoCanvas.parentElement.getBoundingClientRect();
        evoCanvas.width = rect.width * dpr;
        evoCanvas.height = 44 * dpr;
        evoCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const w = rect.width;
        const h = 44;

        evoCtx.clearRect(0, 0, w, h);

        const count = LEVELS.length;
        const padding = 10;
        const spacing = (w - padding * 2) / count;

        for (let i = 0; i < count; i++) {
            const level = LEVELS[i];
            const cx = padding + spacing * i + spacing / 2;
            const cy = h / 2;
            const r = Math.min(12, 5 + i * 0.8);

            // Highlight aktif seviye
            const isHighlight = highlightLevel === i;

            if (isHighlight) {
                evoCtx.save();
                evoCtx.shadowColor = level.color;
                evoCtx.shadowBlur = 12;
            }

            // Top
            const grd = evoCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
            grd.addColorStop(0, level.gradient[0]);
            grd.addColorStop(1, level.gradient[1]);

            evoCtx.beginPath();
            evoCtx.arc(cx, cy, r, 0, Math.PI * 2);
            evoCtx.fillStyle = grd;
            evoCtx.globalAlpha = isHighlight ? 1 : 0.5;
            evoCtx.fill();

            if (isHighlight) {
                evoCtx.restore();
            }

            // Sayı
            evoCtx.globalAlpha = isHighlight ? 1 : 0.5;
            evoCtx.fillStyle = '#fff';
            evoCtx.font = `bold ${Math.max(6, r * 0.6)}px 'Outfit', sans-serif`;
            evoCtx.textAlign = 'center';
            evoCtx.textBaseline = 'middle';
            evoCtx.fillText(String(i + 1), cx, cy + 0.5);

            // Bağlantı ok
            if (i < count - 1) {
                evoCtx.globalAlpha = 0.2;
                evoCtx.strokeStyle = '#6c63ff';
                evoCtx.lineWidth = 1;
                evoCtx.beginPath();
                evoCtx.moveTo(cx + r + 2, cy);
                evoCtx.lineTo(cx + spacing - r - 2, cy);
                evoCtx.stroke();
            }

            evoCtx.globalAlpha = 1;
        }
    }

    // ---- Ekran Sarsıntısı ----
    function updateScreenShake(dt) {
        if (screenShake.intensity > 0.1) {
            screenShake.x = (Math.random() - 0.5) * screenShake.intensity * 2;
            screenShake.y = (Math.random() - 0.5) * screenShake.intensity * 2;
            screenShake.intensity *= 0.85;
        } else {
            screenShake.x = 0;
            screenShake.y = 0;
            screenShake.intensity = 0;
        }
    }

    // ---- Canvas Arka Plan ----
    function drawCanvasGrid() {
        ctx.save();
        ctx.strokeStyle = 'rgba(108, 99, 255, 0.025)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        const gridSize = 25;
        for (let x = 0; x <= canvasWidth; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
        }
        for (let y = 0; y <= canvasHeight; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    // ---- Ana Oyun Döngüsü ----
    let lastTime = 0;

    function gameLoop(timestamp) {
        const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 1 / 60;
        lastTime = timestamp;

        // Fizik güncelle
        if (gameStarted && !gameOver) {
            // Artan zorluk
            gameTime += dt;
            gravityScale = 0.0015 + gameTime * GRAVITY_INCREASE_RATE; // 0.0015 başlangıç hızı
            engine.gravity.scale = gravityScale;

            // Durağan topları uyandır — havada kalma sorununu önler
            wakeStuckBalls();

            // Drop cooldown (frame-based, restart-safe)
            if (dropCooldownTimer > 0) {
                dropCooldownTimer -= dt;
                if (dropCooldownTimer <= 0) {
                    dropCooldownTimer = 0;
                    canDrop = true;
                }
            }

            // Alt-adımlama (sub-stepping): Büyük tek adım yerine küçük sabit adımlar
            // Bu, topların birbirine girmesini ve fizik kararsızlığını önler
            const SUB_STEPS = 4;
            const stepMs = (dt * 1000) / SUB_STEPS;
            for (let step = 0; step < SUB_STEPS; step++) {
                // Her sub-step arasında merged set'i temizle (aynı frame'de farklı
                // sub-step'lerde yeni collision'lar doğru algılansın)
                mergedThisFrame.clear();
                Engine.update(engine, stepMs);
            }
            clampBallsToBasket();
            resolveOverlaps();

            // Ertelenmiş sepet genişletme (collision handler içinde değil, güvenli zamanda)
            if (pendingBasketExpansion) {
                pendingBasketExpansion = false;
                calculateBasket();
                const allB = Composite.allBodies(engine.world);
                const walls = allB.filter(b => b.label === 'wall');
                for (const w of walls) Composite.remove(engine.world, w);
                createBasketWalls();
                renderCache.clear();
            }

            // Yetenek Timerları
            // Zaman Dondurma (eski SlowMo)
            if (slowMoTimer > 0) {
                slowMoTimer -= dt;
                if (slowMoTimer <= 0) {
                    slowMoTimer = 0;
                    unfreezeBalls();
                }
            }

            // Kaos Topu Kontrolü
            if (blackholeTimer > 0) {
                blackholeTimer -= dt;
                updateChaosBall(dt);
                if (blackholeTimer <= 0) {
                    blackholeTimer = 0;
                    removeChaosBall();
                }
            }

            // Deprem kapağı zamanlayıcısı
            if (earthquakeTimer > 0) {
                earthquakeTimer -= dt;
                if (earthquakeTimer <= 0) {
                    earthquakeTimer = 0;
                    earthquakeGracePeriod = 1.5;
                    // Kapak kaldırılmadan önce üstteki topları merkeze doğru it
                    if (earthquakeTempWalls.length > 0) {
                        const allBodies = Composite.allBodies(engine.world);
                        for (let j = 0; j < allBodies.length; j++) {
                            const b = allBodies[j];
                            if (b.label.startsWith('level') && b.position.y < basketTopY) {
                                const cx = canvasWidth / 2;
                                const dx = cx - b.position.x;
                                Body.setVelocity(b, { x: dx * 0.1, y: 2 });
                            }
                        }
                        try { Composite.remove(engine.world, earthquakeTempWalls); } catch(e) {}
                        earthquakeTempWalls = [];
                    }
                }
            }

            // Deprem sonrası tolerans süresi
            if (earthquakeGracePeriod > 0) {
                earthquakeGracePeriod -= dt;
                if (earthquakeGracePeriod <= 0) earthquakeGracePeriod = 0;
            }

            // Kombo timer
            if (comboTimer > 0) {
                comboTimer -= dt;
                if (comboTimer <= 0) {
                    comboCount = 0;
                    comboTimer = 0;
                }
            }

            // Mıknatıs timerı
            if (magnetTimer > 0) {
                magnetTimer -= dt;
                updateMagnet(dt);
                if (magnetTimer <= 0) magnetTimer = 0;
            }

            // Pasif enerji rejenerasyonu (saniyede +0.4)
            energyRegenAccum += dt * 0.4;
            if (energyRegenAccum >= 1) {
                const regenAmount = Math.floor(energyRegenAccum);
                addEnergy(regenAmount);
                energyRegenAccum -= regenAmount;
            }
        }


        // Merged set temizle
        mergedThisFrame.clear();

        // Ekran sarsıntısı
        updateScreenShake(dt);

        // Canvas temizle ve sarsıntı uygula
        ctx.save();
        ctx.translate(screenShake.x, screenShake.y);
        ctx.clearRect(-10, -10, canvasWidth + 20, canvasHeight + 20);

        // Arka plan
        drawCanvasGrid();

        // Sepet
        renderBasket();


        // Toplar
        renderBalls();

        // Ghost / önizleme
        drawGhost();

        // Yetenek Görsel Efektleri (Canvas içi overlay ile performans/HTML hatası çözümü)
        if (gameStarted && !gameOver) {
            if (slowMoTimer > 0) {
                // Buz efekti - dondurulan topların etrafında parıltı
                ctx.fillStyle = 'rgba(0, 200, 255, 0.06)';
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                ctx.save();
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = '#00E5FF';
                ctx.font = "bold 11px 'Outfit', sans-serif";
                ctx.textAlign = 'center';
                ctx.fillText('DONDURULDU ' + Math.ceil(slowMoTimer) + 's', canvasWidth / 2, basketTopY - 12);
                ctx.restore();
                // Donmuş topların etrafında buz halkası
                const worldIds = new Set(Composite.allBodies(engine.world).map(b => b.id));
                for (let i = 0; i < frozenBalls.length; i++) {
                    const fb = frozenBalls[i];
                    if (!fb._wasFrozen || !worldIds.has(fb.id)) continue;
                    ctx.save();
                    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([3, 3]);
                    ctx.beginPath();
                    ctx.arc(fb.position.x, fb.position.y, fb.scaledRadius + 4, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();
                }
            }
            if (blackholeTimer > 0) {
                ctx.fillStyle = 'rgba(150, 0, 255, 0.04)';
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                // Kaos topu görsel çizimi
                const allCB = Composite.allBodies(engine.world);
                const cb = allCB.find(b => b._isChaos);
                if (cb) {
                    ctx.save();
                    const cbx = cb.position.x;
                    const cby = cb.position.y;
                    const cbr = cb.scaledRadius;
                    const pulse = 1 + Math.sin(Date.now() / 120) * 0.15;
                    // Glow
                    ctx.shadowColor = '#B340FF';
                    ctx.shadowBlur = 15;
                    // Gradient gövde
                    const cbGrad = ctx.createRadialGradient(cbx - cbr * 0.3, cby - cbr * 0.3, cbr * 0.1, cbx, cby, cbr * pulse);
                    cbGrad.addColorStop(0, '#ffffff');
                    cbGrad.addColorStop(0.4, '#DDA0FF');
                    cbGrad.addColorStop(1, '#8800CC');
                    ctx.fillStyle = cbGrad;
                    ctx.beginPath();
                    ctx.arc(cbx, cby, cbr * pulse, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    // Soru işareti
                    ctx.fillStyle = '#ffffff';
                    ctx.font = "bold " + Math.round(cbr * 1.2) + "px 'Outfit', sans-serif";
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('?', cbx, cby + 1);
                    ctx.restore();
                }
                // Süre göstergesi
                ctx.save();
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = '#B340FF';
                ctx.font = "bold 11px 'Outfit', sans-serif";
                ctx.textAlign = 'center';
                ctx.fillText('KAOS ' + Math.ceil(blackholeTimer) + 's', canvasWidth / 2, basketTopY - 12);
                ctx.restore();
            }
            if (magnetTimer > 0) {
                ctx.fillStyle = 'rgba(0, 120, 255, 0.06)'; // Mavimsi mıknatıs efekti
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                drawMagnetLines();
                // Mıknatıs kalan süre göstergesi
                ctx.save();
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = '#00AAFF';
                ctx.font = "bold 11px 'Outfit', sans-serif";
                ctx.textAlign = 'center';
                ctx.fillText('MIKNATIS ' + Math.ceil(magnetTimer) + 's', canvasWidth / 2, basketTopY - 12);
                ctx.restore();
            }
            // Takas hedefleme - seçili topu vurgula
            if (activeAbility === 'swap' && swapFirstBody) {
                // swapFirstBody hala dünyada mı kontrol et (merge/bomba ile silinmiş olabilir)
                const swapInWorld = Composite.allBodies(engine.world).some(b => b.id === swapFirstBody.id);
                if (swapInWorld) {
                    ctx.save();
                    ctx.strokeStyle = '#00FFB3';
                    ctx.lineWidth = 3;
                    ctx.shadowColor = '#00FFB3';
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.arc(swapFirstBody.position.x, swapFirstBody.position.y, swapFirstBody.scaledRadius + 6, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                } else {
                    // Top artık yok, seçimi temizle
                    delete swapFirstBody._swapHighlight;
                    swapFirstBody = null;
                    activeAbility = null;
                    updateEnergyUI();
                }
            }
        }

        // Mevcut + Sıradaki top gösterimi (sağ üst köşe)
        if (gameStarted && !gameOver) {
            drawBallPreviews();
            drawComboIndicator();
        }

        // Pop efektleri
        renderPopEffects(dt);

        // Floating text
        renderFloatingTexts(dt);

        ctx.restore(); // Sarsıntı bitti

        // Sepetten taşma kontrolü
        if (gameStarted && !gameOver) {
            checkOverflow();
        }

        requestAnimationFrame(gameLoop);
    }

    // ---- Rounded Rectangle Helper ----
    function drawRoundedRect(context, x, y, w, h, r) {
        context.moveTo(x + r, y);
        context.lineTo(x + w - r, y);
        context.arcTo(x + w, y, x + w, y + r, r);
        context.lineTo(x + w, y + h - r);
        context.arcTo(x + w, y + h, x + w - r, y + h, r);
        context.lineTo(x + r, y + h);
        context.arcTo(x, y + h, x, y + h - r, r);
        context.lineTo(x, y + r);
        context.arcTo(x, y, x + r, y, r);
        context.closePath();
    }

    // ---- Başlat ----
    window.addEventListener('DOMContentLoaded', init);

})();
