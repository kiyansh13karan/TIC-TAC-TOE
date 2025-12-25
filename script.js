/**
 * ANTIGRAVITY & SPACE SCI-FI TIC-TAC-TOE // ZERO-G PROTOCOL
 * Core Game Engine, 3D Canvas Physics, Web Audio & Quantum AI
 */

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. DOM ELEMENT REFERENCES
    // ==========================================
    const boxes = document.querySelectorAll(".box");
    const resetBtn = document.querySelector("#reset");
    const newGameBtn = document.querySelector("#newgame");
    const clearScoresBtn = document.querySelector("#clear-scores-btn");
    const modeToggleBtn = document.querySelector("#mode-toggle-btn");
    const modeLabel = document.querySelector("#mode-label");
    const audioToggleBtn = document.querySelector("#audio-toggle-btn");
    const audioIcon = document.querySelector("#audio-icon");
    const audioLabel = document.querySelector("#audio-label");
    
    // Panels & Badges
    const panelX = document.querySelector("#panel-x");
    const panelO = document.querySelector("#panel-o");
    const badgeX = document.querySelector("#badge-x");
    const badgeO = document.querySelector("#badge-o");
    const statusValX = document.querySelector("#status-val-x");
    const statusValO = document.querySelector("#status-val-o");
    
    // Center Board & SVG Laser
    const boardScene = document.querySelector("#board-scene");
    const zeroGBoard = document.querySelector("#zero-g-board");
    const winLaserSvg = document.querySelector("#win-laser-svg");
    const winLaserLine = document.querySelector("#win-laser-line");
    const matrixStatusText = document.querySelector("#matrix-status-text");

    // Telemetry & Battery Progress
    const turnProgressText = document.querySelector("#turn-progress-text");
    const batterySegments = document.querySelectorAll(".battery-segment");
    const scoreXEl = document.querySelector("#score-x");
    const scoreOEl = document.querySelector("#score-o");
    const scoreTiesEl = document.querySelector("#score-ties");
    const streakXEl = document.querySelector("#streak-x");
    const barXEl = document.querySelector("#bar-x");
    const barOEl = document.querySelector("#bar-o");

    // Modal
    const msgContainer = document.querySelector("#msg-container");
    const msg = document.querySelector("#msg");
    const modalMovesCount = document.querySelector("#modal-moves-count");
    const modalRoundCount = document.querySelector("#modal-round-count");

    // ==========================================
    // 2. STATE VARIABLES
    // ==========================================
    // turnO: false = Player X's turn, true = Player O's turn
    let turnO = false;
    let gameActive = true;
    let moveCount = 0;
    let vsAI = false;
    let audioEnabled = true;

    // Scores & Telemetry
    let scores = {
        x: 0,
        o: 0,
        ties: 0,
        streakX: 0,
        rounds: 1
    };

    // Load persisted scores if available
    try {
        const savedScores = localStorage.getItem("antigravity_ttt_scores");
        if (savedScores) {
            scores = { ...scores, ...JSON.parse(savedScores) };
        }
    } catch (e) {
        console.warn("Storage not accessible:", e);
    }

    // Winning index configurations
    const winPatterns = [
        [0, 1, 2], // Row 1
        [3, 4, 5], // Row 2
        [6, 7, 8], // Row 3
        [0, 3, 6], // Col 1
        [1, 4, 7], // Col 2
        [2, 5, 8], // Col 3
        [0, 4, 8], // Diagonal TL to BR
        [2, 4, 6]  // Diagonal TR to BL
    ];

    // ==========================================
    // 3. SYNTHESIZED PROCEDURAL WEB AUDIO ENGINE
    // ==========================================
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playSound(type) {
        if (!audioEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        if (type === "clickX") {
            // High-tech laser chirp for X (Cyan)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === "clickO") {
            // Deep resonant plasma pulse for O (Pink)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.exponentialRampToValueAtTime(1160, now + 0.14);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.18);
        } else if (type === "hover") {
            // Subtle digital micro-tick
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1400, now);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === "win") {
            // Ascending triumphal cosmic chord
            const freqs = [392.00, 493.88, 587.33, 783.99, 987.77];
            freqs.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.12, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.65);
            });
        } else if (type === "draw") {
            // Quantum glitch / stalemate frequency
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(90, now + 0.3);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        } else if (type === "reset") {
            // Power-down de-energize sweep
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    }

    // Audio Button Handler
    audioToggleBtn.addEventListener("click", () => {
        audioEnabled = !audioEnabled;
        if (audioEnabled) {
            audioIcon.textContent = "🔊";
            audioLabel.textContent = "AUDIO: ON";
            audioToggleBtn.style.borderColor = "var(--neon-cyan)";
            playSound("hover");
        } else {
            audioIcon.textContent = "🔇";
            audioLabel.textContent = "AUDIO: OFF";
            audioToggleBtn.style.borderColor = "rgba(255, 255, 255, 0.2)";
        }
    });

    // ==========================================
    // 4. GAME PLAY & TURN MANAGEMENT
    // ==========================================

    function updateTurnIndicators() {
        if (!turnO) {
            // Player X's Turn
            panelX.classList.add("active-glow-cyan");
            panelO.classList.remove("active-glow-pink");
            
            badgeX.classList.remove("inactive");
            badgeX.querySelector(".status-txt").textContent = "ACTIVE TURN";
            statusValX.textContent = "ENGAGED";
            
            badgeO.classList.add("inactive");
            badgeO.querySelector(".status-txt").textContent = "STANDBY";
            statusValO.textContent = "STANDBY";

            matrixStatusText.textContent = vsAI ? "PILOT X TURN" : "PILOT X TURN";
            matrixStatusText.style.color = "var(--neon-cyan)";
        } else {
            // Player O's Turn
            panelO.classList.add("active-glow-pink");
            panelX.classList.remove("active-glow-cyan");
            
            badgeO.classList.remove("inactive");
            badgeO.querySelector(".status-txt").textContent = vsAI ? "AI THINKING" : "ACTIVE TURN";
            statusValO.textContent = vsAI ? "COMPUTING" : "ENGAGED";

            badgeX.classList.add("inactive");
            badgeX.querySelector(".status-txt").textContent = "STANDBY";
            statusValX.textContent = "STANDBY";

            matrixStatusText.textContent = vsAI ? "AI CORE SCANNING" : "PILOT O TURN";
            matrixStatusText.style.color = "var(--neon-pink)";
        }

        // Update Battery / Turn Meter
        const currentStep = Math.min(moveCount + 1, 9);
        turnProgressText.textContent = `TURN ${currentStep} // 9`;
        
        batterySegments.forEach((segment, idx) => {
            if (idx < moveCount) {
                segment.classList.add("active");
                if (idx % 2 !== 0) {
                    segment.classList.add("even-move");
                } else {
                    segment.classList.remove("even-move");
                }
            } else {
                segment.classList.remove("active", "even-move");
            }
        });
    }

    function updateScoreDisplay() {
        scoreXEl.textContent = String(scores.x).padStart(2, "0");
        scoreOEl.textContent = String(scores.o).padStart(2, "0");
        scoreTiesEl.textContent = `STALEMATES: ${scores.ties}`;
        streakXEl.textContent = `STREAK: ${scores.streakX}`;

        const totalWins = scores.x + scores.o;
        if (totalWins > 0) {
            const xPercent = Math.round((scores.x / totalWins) * 100);
            barXEl.style.width = `${xPercent}%`;
            barOEl.style.width = `${100 - xPercent}%`;
        } else {
            barXEl.style.width = "50%";
            barOEl.style.width = "50%";
        }

        try {
            localStorage.setItem("antigravity_ttt_scores", JSON.stringify(scores));
        } catch (e) {
            // ignore
        }
    }

    // Attach click events to the 9 board cells
    boxes.forEach((box, index) => {
        box.addEventListener("mouseenter", () => {
            if (!box.disabled && gameActive) {
                playSound("hover");
            }
        });

        box.addEventListener("click", () => {
            if (!gameActive || box.disabled) return;
            handleCellSelection(box, index);
        });
    });

    function handleCellSelection(box, index) {
        moveCount++;

        if (!turnO) {
            // Player X Move
            box.innerHTML = `<span class="symbol-x">✕</span>`;
            box.setAttribute("data-player", "X");
            box.disabled = true;
            playSound("clickX");
            
            if (checkWinners()) {
                return;
            }

            if (moveCount === 9) {
                handleDraw();
                return;
            }

            turnO = true;
            updateTurnIndicators();

            // If vs AI mode, trigger AI move
            if (vsAI && gameActive) {
                disableAllEmptyBoxes(true);
                setTimeout(() => {
                    makeAIMove();
                    disableAllEmptyBoxes(false);
                }, 420);
            }
        } else {
            // Player O Move
            box.innerHTML = `<span class="symbol-o">◯</span>`;
            box.setAttribute("data-player", "O");
            box.disabled = true;
            playSound("clickO");

            if (checkWinners()) {
                return;
            }

            if (moveCount === 9) {
                handleDraw();
                return;
            }

            turnO = false;
            updateTurnIndicators();
        }
    }

    function disableAllEmptyBoxes(disable) {
        boxes.forEach((b) => {
            if (!b.getAttribute("data-player")) {
                b.disabled = disable;
            }
        });
    }

    // ==========================================
    // 5. QUANTUM AI CORE (MINIMAX)
    // ==========================================
    function makeAIMove() {
        if (!gameActive) return;

        const boardState = Array.from(boxes).map((b) => b.getAttribute("data-player") || "");
        const bestMoveIndex = getBestMove(boardState);

        if (bestMoveIndex !== -1 && bestMoveIndex !== undefined) {
            const targetBox = boxes[bestMoveIndex];
            targetBox.disabled = false;
            handleCellSelection(targetBox, bestMoveIndex);
        }
    }

    function getBestMove(board) {
        // Smart tactical AI with minimax evaluation
        let bestScore = -Infinity;
        let move = -1;

        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, 0, false, -Infinity, Infinity);
                board[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }

        // Fallback: choose center or corners
        if (move === -1) {
            const available = board.map((v, i) => v === "" ? i : null).filter((v) => v !== null);
            if (available.length > 0) {
                return available[Math.floor(Math.random() * available.length)];
            }
        }

        return move;
    }

    function minimax(board, depth, isMaximizing, alpha, beta) {
        const winner = checkSimulatedWinner(board);
        if (winner === "O") return 10 - depth;
        if (winner === "X") return depth - 10;
        if (!board.includes("")) return 0;

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === "") {
                    board[i] = "O";
                    let evaluation = minimax(board, depth + 1, false, alpha, beta);
                    board[i] = "";
                    maxEval = Math.max(maxEval, evaluation);
                    alpha = Math.max(alpha, evaluation);
                    if (beta <= alpha) break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === "") {
                    board[i] = "X";
                    let evaluation = minimax(board, depth + 1, true, alpha, beta);
                    board[i] = "";
                    minEval = Math.min(minEval, evaluation);
                    beta = Math.min(beta, evaluation);
                    if (beta <= alpha) break;
                }
            }
            return minEval;
        }
    }

    function checkSimulatedWinner(board) {
        for (let p of winPatterns) {
            const [a, b, c] = p;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    // ==========================================
    // 6. WIN & DRAW RESOLUTION
    // ==========================================
    function checkWinners() {
        for (let pattern of winPatterns) {
            const [i1, i2, i3] = pattern;
            const b1 = boxes[i1];
            const b2 = boxes[i2];
            const b3 = boxes[i3];

            const p1 = b1.getAttribute("data-player");
            const p2 = b2.getAttribute("data-player");
            const p3 = b3.getAttribute("data-player");

            if (p1 && p1 === p2 && p2 === p3) {
                handleVictory(p1, pattern);
                return true;
            }
        }
        return false;
    }

    function drawWinningLaser(pattern) {
        const boardRect = zeroGBoard.getBoundingClientRect();
        const startBoxRect = boxes[pattern[0]].getBoundingClientRect();
        const endBoxRect = boxes[pattern[2]].getBoundingClientRect();

        const x1 = ((startBoxRect.left + startBoxRect.width / 2) - boardRect.left);
        const y1 = ((startBoxRect.top + startBoxRect.height / 2) - boardRect.top);
        const x2 = ((endBoxRect.left + endBoxRect.width / 2) - boardRect.left);
        const y2 = ((endBoxRect.top + endBoxRect.height / 2) - boardRect.top);

        winLaserSvg.setAttribute("viewBox", `0 0 ${boardRect.width} ${boardRect.height}`);
        winLaserLine.setAttribute("x1", x1);
        winLaserLine.setAttribute("y1", y1);
        winLaserLine.setAttribute("x2", x2);
        winLaserLine.setAttribute("y2", y2);

        winLaserSvg.classList.add("active");
    }

    function handleVictory(winner, winningPattern) {
        gameActive = false;
        playSound("win");

        // Highlight winning tiles
        winningPattern.forEach((idx) => {
            boxes[idx].classList.add("winning-tile");
        });

        // Draw animated laser beam across winning cells
        drawWinningLaser(winningPattern);

        // Update Scores
        if (winner === "X") {
            scores.x++;
            scores.streakX++;
        } else {
            scores.o++;
            scores.streakX = 0;
        }
        updateScoreDisplay();

        // Lock all boxes
        boxes.forEach((b) => b.disabled = true);

        // Show Modal after brief cinematic pause
        setTimeout(() => {
            msg.innerHTML = `VICTORY TRANSMISSION // PILOT <span class="${winner === 'X' ? 'neon-cyan' : 'neon-pink'}">${winner}</span> DOMINATES THE SECTOR`;
            modalMovesCount.textContent = moveCount;
            modalRoundCount.textContent = scores.rounds;
            msgContainer.classList.remove("hide");
        }, 750);
    }

    function handleDraw() {
        gameActive = false;
        playSound("draw");
        scores.ties++;
        scores.streakX = 0;
        updateScoreDisplay();

        boxes.forEach((b) => b.disabled = true);

        setTimeout(() => {
            msg.innerHTML = `STALEMATE // QUANTUM EQUILIBRIUM REACHED`;
            modalMovesCount.textContent = "9";
            modalRoundCount.textContent = scores.rounds;
            msgContainer.classList.remove("hide");
        }, 600);
    }

    // ==========================================
    // 7. RESET & NEW ROUND ACTIONS
    // ==========================================
    function resetGame(fullReset = false) {
        playSound("reset");
        gameActive = true;
        moveCount = 0;
        turnO = false; // Player X always opens

        if (fullReset) {
            scores.rounds = 1;
        }

        // Clear board cells
        boxes.forEach((box) => {
            box.disabled = false;
            box.innerHTML = "";
            box.removeAttribute("data-player");
            box.classList.remove("winning-tile");
        });

        // Hide laser beam and modal
        winLaserSvg.classList.remove("active");
        msgContainer.classList.add("hide");

        updateTurnIndicators();
        updateScoreDisplay();
    }

    resetBtn.addEventListener("click", () => resetGame(false));
    newGameBtn.addEventListener("click", () => {
        scores.rounds++;
        resetGame(false);
    });

    clearScoresBtn.addEventListener("click", () => {
        scores = { x: 0, o: 0, ties: 0, streakX: 0, rounds: 1 };
        updateScoreDisplay();
        resetGame(true);
    });

    // Mode Toggle (2P Local vs AI)
    modeToggleBtn.addEventListener("click", () => {
        vsAI = !vsAI;
        playSound("hover");
        if (vsAI) {
            modeLabel.textContent = "MODE: VS AI CORE";
            modeToggleBtn.style.borderColor = "var(--neon-pink)";
            document.querySelector("#status-val-o").textContent = "AI ARMED";
        } else {
            modeLabel.textContent = "MODE: 2P LOCAL";
            modeToggleBtn.style.borderColor = "var(--neon-cyan)";
            document.querySelector("#status-val-o").textContent = "STANDBY";
        }
        resetGame(false);
    });

    // ==========================================
    // 8. 3D GYROSCOPIC MOUSE PARALLAX TILT
    // ==========================================
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;

        // Subtle zero-g physical tilt range: ±10 deg
        targetTiltX = (mouseY - 0.5) * -16;
        targetTiltY = (mouseX - 0.5) * 16;
    });

    // ==========================================
    // 9. COSMIC CANVAS: ZERO-G STARFIELD & PARTICLES
    // ==========================================
    const canvas = document.querySelector("#cosmic-canvas");
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initCosmos();
    });

    const stars = [];
    const dustParticles = [];
    const NUM_STARS = 140;
    const NUM_DUST = 45;

    function initCosmos() {
        stars.length = 0;
        dustParticles.length = 0;

        for (let i = 0; i < NUM_STARS; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 0.4,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinkleDir: Math.random() > 0.5 ? 1 : -1,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                color: Math.random() > 0.6 ? "#00f3ff" : (Math.random() > 0.5 ? "#ff00aa" : "#ffffff")
            });
        }

        for (let i = 0; i < NUM_DUST; i++) {
            dustParticles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 22 + 10,
                alpha: Math.random() * 0.08 + 0.02,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                hue: Math.random() > 0.5 ? 190 : 310 // cyan or magenta
            });
        }
    }

    initCosmos();

    // Render Loop (60 FPS)
    let orbitAngle = 0;

    function renderCosmos() {
        ctx.clearRect(0, 0, width, height);

        // Smooth Lerp for 3D Board Tilt
        currentTiltX += (targetTiltX - currentTiltX) * 0.06;
        currentTiltY += (targetTiltY - currentTiltY) * 0.06;

        if (zeroGBoard) {
            zeroGBoard.style.transform = `rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
        }

        // Draw Ambient Floating Dust Particles (Zero-G Clouds)
        dustParticles.forEach((dust) => {
            dust.x += dust.vx;
            dust.y += dust.vy;

            if (dust.x < -50) dust.x = width + 50;
            if (dust.x > width + 50) dust.x = -50;
            if (dust.y < -50) dust.y = height + 50;
            if (dust.y > height + 50) dust.y = -50;

            const grad = ctx.createRadialGradient(dust.x, dust.y, 0, dust.x, dust.y, dust.radius);
            grad.addColorStop(0, `hsla(${dust.hue}, 100%, 70%, ${dust.alpha})`);
            grad.addColorStop(1, `hsla(${dust.hue}, 100%, 50%, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(dust.x, dust.y, dust.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Rotating Digital Orbit Rings
        orbitAngle += 0.002;
        const centerX = width * 0.5 + (mouseX - 0.5) * 40;
        const centerY = height * 0.45 + (mouseY - 0.5) * 40;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(orbitAngle);

        // Outer Orbit Ring
        ctx.strokeStyle = "rgba(0, 243, 255, 0.07)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([12, 18]);
        ctx.beginPath();
        ctx.arc(0, 0, 320, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Orbit Ring
        ctx.strokeStyle = "rgba(255, 0, 170, 0.05)";
        ctx.setLineDash([8, 25]);
        ctx.beginPath();
        ctx.arc(0, 0, 240, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // Draw Zero-G Stars with Parallax
        const parallaxOffsetX = (mouseX - 0.5) * 20;
        const parallaxOffsetY = (mouseY - 0.5) * 20;

        stars.forEach((star) => {
            star.x += star.vx;
            star.y += star.vy;

            if (star.x < 0) star.x = width;
            if (star.x > width) star.x = 0;
            if (star.y < 0) star.y = height;
            if (star.y > height) star.y = 0;

            // Twinkle
            star.alpha += star.twinkleSpeed * star.twinkleDir;
            if (star.alpha > 0.95) {
                star.alpha = 0.95;
                star.twinkleDir = -1;
            } else if (star.alpha < 0.2) {
                star.alpha = 0.2;
                star.twinkleDir = 1;
            }

            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.alpha;
            ctx.beginPath();
            ctx.arc(star.x + parallaxOffsetX * (star.size * 0.5), star.y + parallaxOffsetY * (star.size * 0.5), star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1.0;
        requestAnimationFrame(renderCosmos);
    }

    renderCosmos();

    // Initial setup
    updateTurnIndicators();
    updateScoreDisplay();
});
