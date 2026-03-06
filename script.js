let balance = 100, debt = 0, seconds = 0, holds = [false, false, false];
const symbols = ['🍎', '🍋', '🍒', '🔔', '💎', '7️⃣'];
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let timerInterval = setInterval(() => { seconds++; }, 1000);

function playSound(type, freq, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}

function toggleHold(i) {
    if (balance < 10) return alert("Need $10 to hold!");
    balance -= 10; holds[i] = !holds[i];
    document.getElementById(`r${i + 1}`).classList.toggle('held');
    playSound('square', 150, 0.1); updateUI();
}

function spin() {
    if (balance < 10) return alert("Insufficient funds!");
    balance -= 10; playSound('sawtooth', 300, 0.5);
    const slots = document.querySelectorAll('.slot');
    slots.forEach((s, i) => { if (!holds[i]) s.classList.add('spinning'); });

    setTimeout(() => {
        slots.forEach((s, i) => {
            s.classList.remove('spinning');
            if (!holds[i]) s.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        });
        playSound('sine', 500, 0.2);
        if (balance >= 1000) win();
        holds = [false, false, false];
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('held'));
        updateUI();
    }, 1000);
}

function win() {
    clearInterval(timerInterval);
    confetti({particleCount: 500});
    let scores = JSON.parse(localStorage.getItem('casinoScores') || "[]");
    scores.push(seconds); scores.sort((a, b) => a - b);
    localStorage.setItem('casinoScores', JSON.stringify(scores.slice(0, 5)));
    displayScores();
}

function displayScores() {
    const scores = JSON.parse(localStorage.getItem('casinoScores') || "[]");
    document.getElementById('score-list').innerHTML = scores.map(s => `<li>${s} seconds</li>`).join('');
}

setInterval(() => { if(debt > 0) { balance = Math.max(0, balance - Math.ceil(debt*0.05)); updateUI(); } }, 10000);
setInterval(() => {
    const m = document.createElement('div');
    m.className = 'money-item'; m.innerText = ['💸', '💰', '💵', '💎'][Math.floor(Math.random()*4)];
    m.style.left = Math.random() * 100 + 'vw';
    m.style.animationDuration = (Math.random() * 2 + 1) + 's';
    document.getElementById('money-rain').appendChild(m);
    setTimeout(() => m.remove(), 3000);
}, 100);

function takeLoan() { balance += 50; debt += 50; playSound('sine', 100, 0.3); updateUI(); }
function updateUI() {
    document.getElementById('balance').innerText = balance;
    document.getElementById('debt-box').innerText = debt > 0 ? `DEBT: $${debt}` : "";
    document.getElementById('progress-bar').style.width = Math.min((balance/1000)*100, 100) + '%';
}
displayScores(); updateUI();
