let alunos = [];
let centroides = [];
let clusters = [];

const turmaMap = {};

class Aluno {
  constructor(nome, mat, port, turma) {
    this.nome = nome;
    this.mat = mat;
    this.port = port;
    this.turma = turma;
    this.cluster = null;
  }

  vetor() {
    return [this.mat, this.port, converterTurma(this.turma)];
  }
}

function converterTurma(turma) {
  if (!(turma in turmaMap)) {
    turmaMap[turma] = Object.keys(turmaMap).length;
  }
  return turmaMap[turma];
}

function distancia(a, b) {
  const va = a.vetor(), vb = b.vetor();
  return Math.sqrt(va.reduce((acc, val, i) => acc + (val - vb[i]) ** 2, 0));
}

function adicionarAluno() {
  const nome = document.getElementById('nome').value;
  const mat = parseFloat(document.getElementById('mat').value);
  const port = parseFloat(document.getElementById('port').value);
  const turma = document.getElementById('turma').value;

  if (!nome || isNaN(mat) || isNaN(port) || !turma) return alert("Preencha todos os campos");

  const novo = new Aluno(nome, mat, port, turma);
  alunos.push(novo);

  if (alunos.length <= 2) {
    novo.cluster = alunos.length - 1;
    centroides[novo.cluster] = novo;
  } else {
    atribuirCluster(novo);
    verificarDispersao();
  }

  atualizarClusters();
  recalcularCentroides();
  mostrarClusters();
}

function atribuirCluster(aluno) {
  let menor = Infinity, cid = 0;
  for (let i = 0; i < centroides.length; i++) {
    let d = distancia(aluno, centroides[i]);
    if (d < menor) {
      menor = d;
      cid = i;
    }
  }
  aluno.cluster = cid;
}

function atualizarClusters() {
  clusters = Array(centroides.length).fill().map(() => []);
  for (const aluno of alunos) {
    clusters[aluno.cluster].push(aluno);
  }
}

function recalcularCentroides() {
  centroides = clusters.map(grupo => {
    if (grupo.length === 0) return null;
    let sum = [0, 0, 0];
    for (let a of grupo) {
      let v = a.vetor();
      for (let i = 0; i < v.length; i++) sum[i] += v[i];
    }
    let len = grupo.length;
    return new Aluno("C", sum[0]/len, sum[1]/len, getTurmaPorValor(sum[2]/len));
  });
}

function getTurmaPorValor(val) {
  let entries = Object.entries(turmaMap);
  let closest = entries.reduce((a, b) => Math.abs(b[1] - val) < Math.abs(a[1] - val) ? b : a);
  return closest[0];
}

function verificarDispersao() {
  let limiar = 4.0;
  let novosClusters = [];

  for (let i = 0; i < clusters.length; i++) {
    let grupo = clusters[i];
    let centroid = centroides[i];
    for (let aluno of grupo) {
      let d = distancia(aluno, centroid);
      let proxC = i;
      let menor = d;
      for (let j = 0; j < centroides.length; j++) {
        if (j !== i) {
          let dj = distancia(aluno, centroides[j]);
          if (dj < menor) {
            menor = dj;
            proxC = j;
          }
        }
      }

      if (d > limiar && proxC !== i) {
        aluno.cluster = centroides.length + novosClusters.length;
        novosClusters.push([aluno]);
        alunos = alunos.filter(a => a !== aluno);
      }
    }
  }

  for (let nc of novosClusters) {
    centroides.push(nc[0]);
    alunos.push(nc[0]);
  }
}

function mostrarClusters() {
  const div = document.getElementById('clusters');
  div.innerHTML = '';

  atualizarClusters();

  for (let i = 0; i < clusters.length; i++) {
    let c = clusters[i];
    if (!c || c.length === 0) continue;

    let html = `<div class="cluster">
      <h3>Cluster ${i + 1}</h3>
      <div class="centroid">
        <strong>Centroide:</strong><br>
        Mat: ${centroides[i].mat.toFixed(1)} | Port: ${centroides[i].port.toFixed(1)} | Turma: ${centroides[i].turma}
      </div>`;
    for (let aluno of c) {
      html += `<div class="student">${aluno.nome} - Mat: ${aluno.mat}, Port: ${aluno.port}, Turma: ${aluno.turma}</div>`;
    }
    html += `</div>`;
    div.innerHTML += html;
  }
}