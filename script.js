let balance = 100, debt = 0, currentBet = 10, sideBetActive = false, isSpinning = false, holds = new Array(9).fill(false);
const TARGET = 10000, symbols = ['🍎', '🍋', '🍒', '🔔', '💎', '7️⃣'];

// Money Rain
setInterval(() => {
    const m = document.createElement('div'); m.className = 'money-item';
    m.innerText = ['💸', '💰', '💵', '💎'][Math.floor(Math.random() * 4)];
    m.style.left = Math.random() * 100 + 'vw'; m.style.animationDuration = (Math.random() * 2 + 1) + 's';
    document.getElementById('money-rain').appendChild(m);
    setTimeout(() => m.remove(), 3000);
}, 200);

function setBet(amt) { currentBet = amt; updateUI(); }
function toggleHold(i) {
    if (isSpinning) return;
    if (holds[i]) { holds[i] = false; balance += 10; document.getElementById(`s${i}`).classList.remove('held'); }
    else { if (balance < 10) return alert("Insufficient funds!"); holds[i] = true; balance -= 10; document.getElementById(`s${i}`).classList.add('held'); }
    updateUI();
}
function placeSideBet() { sideBetActive = !sideBetActive; updateUI(); }
function takeLoan() { balance += 50; debt += 50; updateUI(); }
function payDebt() {
    if (debt === 0) return alert("No debt!");
    if (balance < 50) return alert("Need $50!");
    balance -= 50; debt -= 50; updateUI();
}

function spin() {
    if (isSpinning || balance < currentBet) return;
    if (sideBetActive && balance < (currentBet + 200)) return alert("Not enough for side bet!");
    isSpinning = true; balance -= currentBet; if(sideBetActive) balance -= 200;
    document.querySelectorAll('.slot').forEach((s, i) => { if (!holds[i]) s.classList.add('spinning'); });
    setTimeout(() => {
        document.querySelectorAll('.slot').forEach((s, i) => {
            s.classList.remove('spinning');
            if (!holds[i]) s.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        });
        checkWins(); isSpinning = false; holds.fill(false);
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('held'));
        updateUI();
    }, 800);
}

function checkWins() {
    let win = 0; const g = Array.from(document.querySelectorAll('.slot')).map(s => s.innerText);
    [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].forEach(l => {
        if (g[l[0]]==g[l[1]] && g[l[1]]==g[l[2]]) win += (g[l[0]]=='💎'?500:g[l[0]]=='7️⃣'?300:150);
    });
    if(sideBetActive && g[4]=='7️⃣') win += 300;
    if(win > 0) { balance += win; document.getElementById('win-text').innerHTML = `WON $${win}!`; document.getElementById('win-modal').style.display = 'block'; }
    if(balance >= TARGET) { confetti(); alert("BIG WINNER!"); location.reload(); }
}

function updateUI() { 
    document.getElementById('bal-text').innerText = `BAL: $${balance}`;
    document.getElementById('debt-text').innerText = `DEBT: $${debt}`;
    document.getElementById('bet-text').innerText = `BET: $${currentBet}`;
    document.getElementById('side-text').innerText = `SIDE: ${sideBetActive ? "ON" : "OFF"}`;
    let progress = debt > 0 ? 0 : Math.min((balance/TARGET)*100, 100);
    document.getElementById('progress-bar').style.width = progress + '%';
    document.getElementById('progress-bar').style.backgroundColor = debt > 0 ? '#f00' : '#0f0';
    document.querySelector('.side-panel').style.boxShadow = debt > 0 ? '0 0 25px #f00' : '0 0 15px rgba(255, 215, 0, 0.3)';
}
updateUI();
