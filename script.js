let balance = parseInt(localStorage.getItem('balance')) || 100;
let holds = [false, false, false];
const symbols = ['🍎', '🍋', '🍒', '🔔', '💎', '7️⃣'];
const moneyEmojis = ['💸', '💰', '💵', '🤑', '🪙'];
const targetGoal = 1000;
const betAmount = 10;
const holdFee = 10;
let isSpinning = false;

// SOUNDS
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(f, t, d, v = 0.1) {
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = t; o.frequency.setValueAtTime(f, audioCtx.currentTime);
    g.gain.setValueAtTime(v, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + d);
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + d);
}

function updateUI() {
    document.getElementById('balance').innerText = balance;
    const percent = Math.min((balance / targetGoal) * 100, 100);
    document.getElementById('progress-bar').style.width = percent + "%";
    
    if (balance >= targetGoal) {
        victory();
    } else if (balance < 10 && !isSpinning) {
        document.getElementById('result').innerText = "GAME OVER! Reset to try again.";
    }
    localStorage.setItem('balance', balance);
}

function victory() {
    document.getElementById('result').innerText = "🏆 GRAND CHAMPION! 🏆";
    document.getElementById('game-ui').style.borderColor = "gold";
    document.getElementById('game-ui').style.boxShadow = "0 0 100px gold";
    confetti({ particleCount: 400, spread: 100, origin: { y: 0.6 } });
    setInterval(() => {
        confetti({ particleCount: 20, angle: Math.random() * 360, colors: ['#ffd700', '#ffffff'] });
    }, 300);
}

function toggleHold(i) {
    if (isSpinning || balance < holdFee && !holds[i]) return;
    holds[i] = !holds[i];
    balance += holds[i] ? -holdFee : holdFee;
    document.getElementById(`hold${i}`).classList.toggle('hold-active');
    playSound(400, 'sine', 0.1);
    updateUI();
}

function spinSlots() {
    if (isSpinning || balance < betAmount || balance >= targetGoal) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    balance -= betAmount;
    updateUI();
    isSpinning = true;

    const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    reels.forEach(r => r.classList.add('spinning'));

    let spinInterval = setInterval(() => {
        playSound(120, 'square', 0.05, 0.02);
        reels.forEach((r, i) => {
            if (!holds[i]) r.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        });
    }, 80);

    setTimeout(() => {
        clearInterval(spinInterval);
        isSpinning = false;
        reels.forEach(r => r.classList.remove('spinning'));

        // HARD MODE: 15% Win Rate
        const allowWin = Math.random() < 0.15;

        if (allowWin) {
            const winSym = holds.some(h => h) ? reels[holds.indexOf(true)].innerText : symbols[Math.floor(Math.random() * symbols.length)];
            reels.forEach(r => r.innerText = winSym);
            balance += 50; 
            document.getElementById('result').innerText = "BIG WIN! +$50";
            playSound(600, 'triangle', 0.5);
            confetti({ particleCount: 100, spread: 70 });
        } else {
            reels[0].innerText = symbols[Math.floor(Math.random() * symbols.length)];
            reels[1].innerText = symbols[Math.floor(Math.random() * symbols.length)];
            let s3 = symbols[Math.floor(Math.random() * symbols.length)];
            while (s3 === reels[0].innerText && reels[0].innerText === reels[1].innerText) {
                s3 = symbols[Math.floor(Math.random() * symbols.length)];
            }
            reels[2].innerText = s3;
            document.getElementById('result').innerText = "Bad luck... try again.";
        }

        holds = [false, false, false];
        document.querySelectorAll('.hold-btn').forEach(btn => btn.classList.remove('hold-active'));
        updateUI();
    }, 1800);
}

// Background Rain
setInterval(() => {
    const item = document.createElement('div');
    item.className = 'money-item';
    item.innerText = moneyEmojis[Math.floor(Math.random() * moneyEmojis.length)];
    item.style.left = Math.random() * 100 + "vw";
    item.style.fontSize = Math.random() * 20 + 20 + "px";
    const dur = Math.random() * 2 + 3;
    item.style.animationDuration = dur + "s";
    document.getElementById('money-rain').appendChild(item);
    setTimeout(() => item.remove(), dur * 1000);
}, 100);

function resetGame() { localStorage.clear(); location.reload(); }
updateUI();