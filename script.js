// BAD ALIENS! - script.js corrigido com imagens, sons, fundo e funcionalidades completas

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const somTiro = document.getElementById("somTiro");
const somExplosao = document.getElementById("somExplosao");
const somFundo = document.getElementById("somFundo");
const somBeep = document.getElementById("somBeep");
const somGameOver = document.getElementById("somGameOver");

const fundo = new Image();
fundo.src = "assets/fundo.png";

let nave = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 80,
  largura: 50,
  altura: 50,
  img: new Image()
};
nave.img.src = "assets/nave.png";

let tiros = [];
let inimigos = [];
let teclas = {};
let pontuacao = 0;
let tempoRestante = 60;
let intervaloInimigos, intervaloTempo;
let velocidadeInimigo = 2;
let estadoDoJogo = "inicio";
let contador = 5;

function desenharNave() {
  ctx.drawImage(nave.img, nave.x, nave.y, nave.largura, nave.altura);
}

function desenharTiros() {
  ctx.fillStyle = "red";
  tiros.forEach((tiro) => ctx.fillRect(tiro.x, tiro.y, tiro.largura, tiro.altura));
}

function desenharInimigos() {
  inimigos.forEach((inimigo) => {
    if (!inimigo.img) {
      inimigo.img = new Image();
      inimigo.img.src = "assets/inimigo.png";
    }
    ctx.drawImage(inimigo.img, inimigo.x, inimigo.y, inimigo.largura, inimigo.altura);
  });
}

function moverNave() {
  if (teclas["ArrowLeft"] && nave.x > 0) nave.x -= 5;
  if (teclas["ArrowRight"] && nave.x < canvas.width - nave.largura) nave.x += 5;
}

function moverTiros() {
  tiros.forEach((tiro) => (tiro.y -= 8));
  tiros = tiros.filter((tiro) => tiro.y > 0);
}

function moverInimigos() {
  inimigos.forEach((inimigo) => (inimigo.y += velocidadeInimigo));
  inimigos = inimigos.filter((inimigo) => inimigo.y < canvas.height);
}

function verificarColisoes() {
  for (let i = inimigos.length - 1; i >= 0; i--) {
    for (let j = tiros.length - 1; j >= 0; j--) {
      const inimigo = inimigos[i];
      const tiro = tiros[j];
      if (
        tiro.x < inimigo.x + inimigo.largura &&
        tiro.x + tiro.largura > inimigo.x &&
        tiro.y < inimigo.y + inimigo.altura &&
        tiro.y + tiro.altura > inimigo.y
      ) {
        somExplosao.play();
        inimigos.splice(i, 1);
        tiros.splice(j, 1);
        pontuacao += 10;
        break;
      }
    }
  }
}

function gerarInimigo() {
  const x = Math.random() * (canvas.width - 40);
  inimigos.push({ x: x, y: -40, largura: 40, altura: 40 });
}

function atualizarTela() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(fundo, 0, 0, canvas.width, canvas.height);
  desenharNave();
  desenharTiros();
  desenharInimigos();
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Pontos: " + pontuacao, 10, 20);
  ctx.fillText("Tempo: " + tempoRestante, 700, 20);
}

function loopJogo() {
  if (estadoDoJogo === "jogando") {
    moverNave();
    moverTiros();
    moverInimigos();
    verificarColisoes();
  } else if (estadoDoJogo === "preparando") {
    moverNave();
  }
  atualizarTela();
  requestAnimationFrame(loopJogo);
}

function iniciarJogo() {
  estadoDoJogo = "jogando";
  somFundo.volume = 1.0;
  somFundo.play();
  
  intervaloInimigos = setInterval(gerarInimigo, 1000);
  intervaloTempo = setInterval(() => {
    tempoRestante--;
    if (tempoRestante === 40 || tempoRestante === 20) velocidadeInimigo *= 1.1;
    if (tempoRestante <= 0) finalizarJogo();
  }, 1000);
}

function finalizarJogo() {
  estadoDoJogo = "encerrado";
  clearInterval(intervaloInimigos);
  clearInterval(intervaloTempo);
  somFundo.pause();
  somFundo.currentTime = 0;
  somGameOver.play();

  let nome = prompt("Fim de jogo! Digite seu nome (max 30 caracteres):").substring(0, 30);
  salvarRanking(nome, pontuacao);
  mostrarRanking();
  document.getElementById("jogarNovamente").style.display = "block";
}

function salvarRanking(nome, pontos) {
  let ranking = JSON.parse(localStorage.getItem("rankingBadAliens")) || [];
  ranking.push({ nome, pontos });
  ranking.sort((a, b) => b.pontos - a.pontos);
  ranking = ranking.slice(0, 30);
  localStorage.setItem("rankingBadAliens", JSON.stringify(ranking));
}

function mostrarRanking() {
  let ranking = JSON.parse(localStorage.getItem("rankingBadAliens")) || [];
  let html = "<h3>Ranking Top 30</h3><ol>";
  ranking.forEach((jogador) => {
    html += `<li>${jogador.nome}: ${jogador.pontos} pts</li>`;
  });
  html += "</ol>";
  document.getElementById("ranking").innerHTML = html;
}

function reiniciarJogo() {
  location.reload();
}

// Eventos
window.addEventListener("keydown", (e) => {
  teclas[e.key] = true;
  if (e.key === " " && estadoDoJogo === "jogando") {
    tiros.push({ x: nave.x + nave.largura / 2 - 2.5, y: nave.y, largura: 5, altura: 10 });
    somTiro.volume = 0.3;
    somTiro.play();
  }
});

window.addEventListener("keyup", (e) => (teclas[e.key] = false));

// Iniciar com contagem regressiva

document.getElementById("botaoIniciar").addEventListener("click", () => {
  document.getElementById("botaoIniciar").style.display = "none";
  document.getElementById("preparacao").innerText = "Prepare-se para a batalha";
  estadoDoJogo = "preparando";

  setTimeout(() => {
    const intervaloContagem = setInterval(() => {
      if (contador > 0) {
        document.getElementById("preparacao").innerText = contador;
        somBeep.play();
        contador--;
      } else {
        clearInterval(intervaloContagem);
        document.getElementById("preparacao").innerText = "";
        iniciarJogo();
      }
    }, 1000);
  }, 1000);
});

loopJogo();
