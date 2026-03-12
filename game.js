// ==========================================
//  MERGE GUYS v2 - Jel Fiziği + Sepet + Kombo
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

    // ---- Top Seviyeleri (10 seviye) - Canlı Renkler ----
    const LEVELS = [
        { label: 'level0',  radius: 14,  score: 2,    color: '#FF6B8A', gradient: ['#FFB3C6', '#FF4D78'], name: 'Tiny' },
        { label: 'level1',  radius: 21,  score: 4,    color: '#4DC9FF', gradient: ['#8BDFFF', '#00AAFF'], name: 'Small' },
        { label: 'level2',  radius: 29,  score: 8,    color: '#5BFF7F', gradient: ['#98FFB3', '#00E640'], name: 'Medium' },
        { label: 'level3',  radius: 38,  score: 16,   color: '#FFB340', gradient: ['#FFCF7A', '#FF9500'], name: 'Large' },
        { label: 'level4',  radius: 48,  score: 32,   color: '#C86EFF', gradient: ['#DDA0FF', '#A033FF'], name: 'X-Large' },
        { label: 'level5',  radius: 58,  score: 64,   color: '#FF6EB4', gradient: ['#FFA0D0', '#FF2D90'], name: 'Huge' },
        { label: 'level6',  radius: 68,  score: 128,  color: '#FFE034', gradient: ['#FFF082', '#FFCC00'], name: 'Giant' },
        { label: 'level7',  radius: 78,  score: 256,  color: '#34FFD5', gradient: ['#7AFFE8', '#00E6B0'], name: 'Mega' },
        { label: 'level8',  radius: 88,  score: 512,  color: '#FF5252', gradient: ['#FF8A8A', '#FF0A0A'], name: 'Ultra' },
        { label: 'level9',  radius: 98,  score: 1024, color: '#7C6BFF', gradient: ['#B0A5FF', '#5040E0'], name: 'Supreme' }
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

    // Jel wobble verileri
    let wobbleData = new Map(); // bodyId -> { offsets: [], phase: number }

    // Web Audio API
    let audioCtx = null;
    let bgMusic = null;

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

    // ---- Ses Sistemi (Prosedürel Web Audio + Arkaplan Müziği) ----
    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Arka plan müziğini (dark.mp3) başlat
            bgMusic = new Audio('dark.mp3');
            bgMusic.loop = true;
            bgMusic.volume = 0.4; // Müziğin de çok patlamaması için %40 seviyesine aldık
            bgMusic.play().catch(e => console.log('Müzik otomatik başlatılamadı:', e));

        } catch (e) {
            audioCtx = null;
        }
    }

    function playDropSound() {
        if (!audioCtx) return;
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
    }

    function playMergeSound(levelIndex) {
        if (!audioCtx) return;
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
    }

    function playComboSound(combo) {
        if (!audioCtx) return;
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
    }

    function playGameOverSound() {
        if (!audioCtx) return;
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
        basketTopLeft = margin;
        basketTopRight = canvasWidth - margin;
        const topWidth = basketTopRight - basketTopLeft;
        const bottomWidth = topWidth * BASKET_NARROW_RATIO;
        const centerX = canvasWidth / 2;
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
            gravity: { x: 0, y: 1.0, scale: gravityScale }
        });

        createBasketWalls();

        // Collision detection - Birleştirme
        Events.on(engine, 'collisionStart', handleCollisions);
    }

    function createBasketWalls() {
        const wallOptions = {
            isStatic: true,
            friction: 0.4,
            restitution: 0.15,
            render: { visible: false },
            label: 'wall'
        };

        // Sol eğimli duvar - açı hesabı ile rectangle
        const leftDx = basketBottomLeft - basketTopLeft;
        const leftDy = (basketBottomY + 30) - (basketTopY - 50);
        const leftLen = Math.sqrt(leftDx * leftDx + leftDy * leftDy);
        const leftAngle = Math.atan2(leftDy, leftDx) - Math.PI / 2;
        const leftCx = (basketTopLeft + basketBottomLeft) / 2;
        const leftCy = ((basketTopY - 50) + (basketBottomY + 30)) / 2;
        const leftWall = Bodies.rectangle(leftCx, leftCy, BASKET_WALL_THICKNESS, leftLen, {
            ...wallOptions,
            angle: leftAngle
        });

        // Sağ eğimli duvar - açı hesabı ile rectangle
        const rightDx = basketBottomRight - basketTopRight;
        const rightDy = (basketBottomY + 30) - (basketTopY - 50);
        const rightLen = Math.sqrt(rightDx * rightDx + rightDy * rightDy);
        const rightAngle = Math.atan2(rightDy, rightDx) - Math.PI / 2;
        const rightCx = (basketTopRight + basketBottomRight) / 2;
        const rightCy = ((basketTopY - 50) + (basketBottomY + 30)) / 2;
        const rightWall = Bodies.rectangle(rightCx, rightCy, BASKET_WALL_THICKNESS, rightLen, {
            ...wallOptions,
            angle: rightAngle
        });

        // Alt duvar
        const bottomWall = Bodies.rectangle(
            canvasWidth / 2, basketBottomY + BASKET_WALL_THICKNESS / 2,
            canvasWidth, BASKET_WALL_THICKNESS,
            wallOptions
        );

        Composite.add(engine.world, [leftWall, rightWall, bottomWall]);
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

                    const levelIndex = parseInt(bodyA.label.replace('level', ''), 10);

                    if (levelIndex >= LEVELS.length - 1) {
                        continue;
                    }

                    const midX = (bodyA.position.x + bodyB.position.x) / 2;
                    const midY = (bodyA.position.y + bodyB.position.y) / 2;

                    // Eski topları sil
                    Composite.remove(engine.world, bodyA);
                    Composite.remove(engine.world, bodyB);
                    wobbleData.delete(bodyA.id);
                    wobbleData.delete(bodyB.id);

                    const newLevel = levelIndex + 1;
                    const newBall = createBall(midX, midY, newLevel);
                    Composite.add(engine.world, newBall);

                    // Kombo
                    comboCount++;
                    comboTimer = COMBO_TIMEOUT;
                    if (comboCount > maxCombo) maxCombo = comboCount;

                    // Skor: kombo çarpanı ile
                    const comboMultiplier = comboCount > 1 ? comboCount : 1;
                    const earnedScore = LEVELS[newLevel].score * comboMultiplier;
                    score += earnedScore;
                    scoreValueEl.textContent = score;

                    // Floating text
                    let text = '+' + earnedScore;
                    if (comboCount > 1) {
                        text += ' x' + comboCount;
                    }
                    floatingTexts.push({
                        x: midX,
                        y: midY - 20,
                        text: text,
                        color: LEVELS[newLevel].color,
                        alpha: 1,
                        time: 0,
                        isCombo: comboCount > 1
                    });

                    // Kombo floating text
                    if (comboCount >= 3) {
                        floatingTexts.push({
                            x: canvasWidth / 2,
                            y: basketTopY + 40,
                            text: L.combo + ' x' + comboCount + '!',
                            color: '#FFD700',
                            alpha: 1,
                            time: 0,
                            isCombo: true,
                            big: true
                        });
                        playComboSound(comboCount);
                        vibrate([30, 20, 30]);
                    }

                    // Geliştirilmiş pop efekti (readme2: pop animasyonu ile fizik motoruna yer aç)
                    const popR = LEVELS[newLevel].radius * getScaleFactor() * 0.85;
                    popEffects.push({
                        x: midX,
                        y: midY,
                        radius: popR,
                        color: LEVELS[newLevel].color,
                        gradient: LEVELS[newLevel].gradient,
                        alpha: 1,
                        scale: 0.5,
                        time: 0,
                        particles: generateParticles(midX, midY, LEVELS[newLevel].color, 14 + newLevel * 3),
                        isNew: true  // Büyüme animasyonu flag
                    });
                    // İkinci halka - dışa doğru yayılma
                    popEffects.push({
                        x: midX,
                        y: midY,
                        radius: popR * 0.6,
                        color: '#ffffff',
                        alpha: 0.8,
                        scale: 1,
                        time: 0
                    });

                    // Ekran sarsıntısı - büyük toplarda daha güçlü
                    screenShake.intensity = Math.min(12, 3 + newLevel * 1.2);

                    // Ses
                    playMergeSound(newLevel);
                    vibrate(15 + newLevel * 5);

                    // Evolüsyon barını güncelle
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

    // ---- Top Oluşturma (Soft-Body Jel Fiziği - readme2.md uyumlu) ----
    function createBall(x, y, levelIndex) {
        const level = LEVELS[levelIndex];
        const scaleFactor = getScaleFactor();
        const scaledRadius = level.radius * scaleFactor * 0.85;

        // readme2.md parametreleri: düşük friction, yüksek restitution
        const ball = Bodies.circle(x, y, scaledRadius, {
            label: level.label,
            restitution: 0.25,     // Zıplama azaltıldı (çok zıplıyordu)
            friction: 0.1,         
            frictionAir: 0.002,    // Hava direnci 1-2 tık artırıldı (0.001 -> 0.002)
            density: 0.0015 - (levelIndex * 0.0001), // KÜÇÜK TOP OPTİMİZASYONU: Küçük toplar oransal olarak daha ağır (dens) olup, deliklere sızarlar
            slop: 0.08,            // Yumuşak çarpışma toleransı
            render: { visible: false },
            collisionFilter: { group: 0, category: 0x0001, mask: 0xFFFF }
        });

        ball.levelIndex = levelIndex;
        ball.scaledRadius = scaledRadius;
        ball.spawnTime = Date.now();

        // Soft-body hull noktaları (readme2: dış parçacıklar + merkez)
        const pointCount = 16;
        const springOffsets = [];
        const springVelocities = [];
        for (let i = 0; i < pointCount; i++) {
            springOffsets.push(0);
            springVelocities.push(0);
        }
        wobbleData.set(ball.id, {
            offsets: springOffsets,
            velocities: springVelocities,
            phase: Math.random() * Math.PI * 2,
            impactForce: 0,
            lastVx: 0,
            lastVy: 0
        });

        return ball;
    }

    // ---- Soft-Body Spring-Damper Simülasyonu (Katı hal %60, Akışkan %40) ----
    function updateWobble(dt) {
        // %40 akışkanlık ayarları
        const STIFFNESS = 0.8;   // Yaylanma sertliği artırıldı
        const DAMPING = 0.25;    // Titreşimin daha çabuk sönmesi sağlandı

        const bodies = Composite.allBodies(engine.world);

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (!body.label.startsWith('level')) continue;

            const data = wobbleData.get(body.id);
            if (!data) continue;

            const vx = body.velocity.x;
            const vy = body.velocity.y;
            const dvx = vx - data.lastVx;
            const dvy = vy - data.lastVy;
            const impactMag = Math.sqrt(dvx * dvx + dvy * dvy);

            // Impact yönünü hesapla (Çarpışma sarsıntısı)
            if (impactMag > 0.5) {
                const impactAngle = Math.atan2(dvy, dvx);
                // Kuvvet ciddi oranda düşürüldü - sadece hafif bir jöle dalgalanması kalsın
                const force = Math.min(body.scaledRadius * 0.03, impactMag * 0.08);
                data.impactForce = force;
                const pointCount = data.offsets.length;
                for (let j = 0; j < pointCount; j++) {
                    const ptAngle = (Math.PI * 2 / pointCount) * j;
                    const alignment = Math.cos(ptAngle - impactAngle);
                    data.velocities[j] += alignment * force * 1.5; // Titreme şiddeti azaltıldı
                }
            }

            // Aerodinamik akışkanlık (Süzülme / Uçuş esnemesi)
            // Sadece hıza bağlı değil, aynı zamanda hareket yönüne göre noktaları esnetir
            const speed = Math.sqrt(vx * vx + vy * vy);
            if (speed > 1.0) {
                const moveAngle = Math.atan2(vy, vx);
                const aeroFactor = Math.min(speed * 0.12, body.scaledRadius * 0.35);

                const pointCount = data.offsets.length;
                for (let j = 0; j < pointCount; j++) {
                    // Noktanın dünya eksenindeki açısını bul (vücut dönüşünü hesaba kat)
                    const localAngle = (Math.PI * 2 / pointCount) * j;
                    const worldAngle = body.angle + localAngle;
                    
                    const Math_PI = Math.PI;
                    let diff = (worldAngle - moveAngle) % (Math_PI * 2);
                    if (diff < -Math_PI) diff += Math_PI * 2;
                    if (diff > Math_PI) diff -= Math_PI * 2;
                    
                    const alignment = Math.cos(diff);
                    
                    let aeroForce = 0;
                    if (alignment > 0) {
                        // Rüzgara karşı olan taraf (aşağı) : içe doğru basılır
                        aeroForce = -alignment * aeroFactor * 0.6;
                    } else {
                        // Rüzgardan kaçan taraf (yukarı kuyruk) : dışa doğru süzülür (damla efekti)
                        aeroForce = -alignment * aeroFactor * 1.5;
                    }
                    
                    // Yan yüzeyler: rüzgara paralel, yassılaşır (daralma)
                    const sideSquash = (1 - Math.abs(alignment)) * aeroFactor * -0.5;

                    // Akışkan süzülme kuvveti
                    data.velocities[j] += (aeroForce + sideSquash) * dt * 40;
                }
            }

            // Spring-damper her nokta için
            const pointCount = data.offsets.length;
            data.phase += dt * 6;

            for (let j = 0; j < pointCount; j++) {
                // Yay kuvveti: hedef = 0 (doğal pozisyon)
                const springForce = -STIFFNESS * data.offsets[j];
                // Sönümleme kuvveti
                const dampForce = -DAMPING * data.velocities[j];
                // Toplam ivme
                data.velocities[j] += (springForce + dampForce) * dt * 60;
                data.offsets[j] += data.velocities[j] * dt * 60;

                // Idle wobble (hafif nefes alma efekti - çok ufak)
                data.offsets[j] += Math.sin(data.phase + j * 1.3) * 0.03;
            }

            data.impactForce *= 0.9;
            data.lastVx = vx;
            data.lastVy = vy;
        }
    }

    // ---- Ghost / Önizleme ----
    function drawGhost() {
        if (!canDrop || gameOver || !gameStarted) return;

        const level = LEVELS[currentBallLevel];
        const scaleFactor = getScaleFactor();
        const scaledRadius = level.radius * scaleFactor * 0.85;

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

        const grd = ctx.createRadialGradient(
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
        if (!canDrop || gameOver || !gameStarted) return;

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
        currentBallLevel = nextBallLevel;
        pickNextBall();

        playDropSound();
        vibrate(8);

        // Kombo sıfırlama zamanlaması (yeni top bırakıldığında)
        if (comboTimer <= 0) {
            comboCount = 0;
        }

        setTimeout(() => {
            canDrop = true;
        }, dropCooldown);
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

    // ---- Topları Çiz (Soft-Body Hull + Gülen Surat) ----
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
            const data = wobbleData.get(body.id);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // ---- Jel Gölge ----
            ctx.beginPath();
            const shadowGrd = ctx.createRadialGradient(0, r * 0.35, r * 0.2, 0, r * 0.35, r * 1.4);
            shadowGrd.addColorStop(0, 'rgba(0,0,0,0.18)');
            shadowGrd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.arc(0, r * 0.35, r * 1.4, 0, Math.PI * 2);
            ctx.fillStyle = shadowGrd;
            ctx.fill();

            // ---- Hull (Dış Kabuk) - readme2: bezierCurveTo ile yumuşak eğri ----
            ctx.beginPath();
            const pointCount = data ? data.offsets.length : 16;
            const hullPoints = [];
            for (let j = 0; j < pointCount; j++) {
                const a = (Math.PI * 2 / pointCount) * j;
                const offset = data ? data.offsets[j] : 0;
                const hr = r + offset;
                hullPoints.push({ x: Math.cos(a) * hr, y: Math.sin(a) * hr });
            }

            // readme2.md: context.beginPath() + bezierCurveTo ile yumuşak eğri
            ctx.moveTo(hullPoints[0].x, hullPoints[0].y);
            for (let j = 0; j < pointCount; j++) {
                const curr = hullPoints[j];
                const next = hullPoints[(j + 1) % pointCount];
                const next2 = hullPoints[(j + 2) % pointCount];
                const cpx = next.x;
                const cpy = next.y;
                const endx = (next.x + next2.x) / 2;
                const endy = (next.y + next2.y) / 2;
                ctx.quadraticCurveTo(cpx, cpy, endx, endy);
            }
            ctx.closePath();

            // readme2.md: İçini gradyan ile doldur - derinlik algısı
            const grd = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.05, 0, 0, r);
            grd.addColorStop(0, level.gradient[0]);
            grd.addColorStop(1, level.gradient[1]);
            ctx.fillStyle = grd;
            ctx.fill();

            // Soft glow kenar
            ctx.strokeStyle = level.color + '55';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // ---- Jel İç Yansıma (büyük parlama) ----
            ctx.beginPath();
            ctx.ellipse(-r * 0.15, -r * 0.28, r * 0.5, r * 0.22, -0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.32)';
            ctx.fill();

            // Küçük spot
            ctx.beginPath();
            ctx.arc(-r * 0.3, -r * 0.38, r * 0.1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fill();

            // ---- Gülen Surat ----
            drawSmileyFace(r, level);

            ctx.restore();
        }
    }

    // ---- Gülen Surat Çizimi ----
    function drawSmileyFace(r, level) {
        if (r < 12) return; // Çok küçük toplarda çizme

        const faceScale = r * 0.012;

        // Gözler
        const eyeY = -r * 0.12;
        const eyeSpacing = r * 0.24;
        const eyeR = Math.max(1.5, r * 0.08);

        // Göz beyazı
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing, eyeY, eyeR * 1.3, eyeR * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(eyeSpacing, eyeY, eyeR * 1.3, eyeR * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Göz bebekleri
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(-eyeSpacing + eyeR * 0.15, eyeY + eyeR * 0.15, eyeR * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing + eyeR * 0.15, eyeY + eyeR * 0.15, eyeR * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Göz parıltısı
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.arc(-eyeSpacing - eyeR * 0.15, eyeY - eyeR * 0.2, eyeR * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing - eyeR * 0.15, eyeY - eyeR * 0.2, eyeR * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Gülümseme
        const mouthY = r * 0.15;
        const mouthW = r * 0.28;
        ctx.beginPath();
        ctx.arc(0, mouthY - r * 0.05, mouthW, 0.15, Math.PI - 0.15, false);
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = Math.max(1.2, r * 0.04);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Yanaklar (pembe blush)
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#FF6B8A';
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing - r * 0.1, mouthY - r * 0.05, r * 0.1, r * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(eyeSpacing + r * 0.1, mouthY - r * 0.05, r * 0.1, r * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
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

    // ---- Sepetten Taşma Kontrolü (Game Over) ----
    function checkOverflow() {
        if (gameOver) return;

        const bodies = Composite.allBodies(engine.world);

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (!body.label.startsWith('level')) continue;

            const x = body.position.x;
            const y = body.position.y;
            const r = body.scaledRadius;

            // KURAL 1: Top ekranın en altından tamamen düştüyse
            if (y > canvasHeight + r) {
                triggerGameOver();
                return;
            }

            // KURAL 2: Top sepet üst seviyesinin (basketTopY) daha aşağısına inmişse
            // VE sepet sınırlarının dışındaysa (sepetin yanlarından düşüyorsa)
            if (y > basketTopY) {
                const bounds = getBasketXAtY(y);
                // Topun merkezi, sepet duvarlarının dışındaysa
                if (x < bounds.left - r * 0.5 || x > bounds.right + r * 0.5) {
                    triggerGameOver();
                    return;
                }
            }
            
            // Eğer y <= basketTopY ise, toplar havada süzülüyordur veya tepeye yığılmıştır.
            // Bu durumda oyunu BİTİRMİYORUZ, ta ki sağdan/soldan dökülüp düşene kadar.
        }
    }

    // ---- Game Over ----
    function triggerGameOver() {
        gameOver = true;
        gameStarted = false;

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

        gameOverOverlay.classList.remove('hidden');
    }

    // ---- Oyun Yeniden Başlatma ----
    function restartGame() {
        Composite.clear(engine.world);
        Engine.clear(engine);

        score = 0;
        scoreValueEl.textContent = '0';
        gameOver = false;
        gameStarted = true;
        canDrop = true;
        mergedThisFrame.clear();
        popEffects = [];
        floatingTexts = [];
        wobbleData.clear();
        comboCount = 0;
        comboTimer = 0;
        maxCombo = 0;
        gameTime = 0;
        gravityScale = 0.001;
        screenShake = { x: 0, y: 0, intensity: 0 };

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
    }

    function getCanvasPos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvasWidth / rect.width),
            y: (e.clientY - rect.top) * (canvasHeight / rect.height)
        };
    }

    function onPointerDown(e) {
        e.preventDefault();
        isPointerDown = true;
        const pos = getCanvasPos(e);
        ghostX = pos.x;
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

        if (engine) {
            const bodies = Composite.allBodies(engine.world);
            const walls = bodies.filter(b => b.label === 'wall');
            for (const w of walls) {
                Composite.remove(engine.world, w);
            }
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

        const gridSize = 25;
        for (let x = 0; x <= canvasWidth; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }
        for (let y = 0; y <= canvasHeight; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }
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

            Engine.update(engine, dt * 1000);

            // Kombo timer
            if (comboTimer > 0) {
                comboTimer -= dt;
                if (comboTimer <= 0) {
                    comboCount = 0;
                    comboTimer = 0;
                }
            }
        }

        // Jel wobble güncelle
        updateWobble(dt);

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
