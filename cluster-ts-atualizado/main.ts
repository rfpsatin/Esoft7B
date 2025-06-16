import * as fs from 'fs';
import * as readline from 'readline';

interface Registro {
  nome: string;
  falta: number;
  nota: number;
  sexo: 'Feminino' | 'Masculino';
  trabalha: boolean;
  isCentroide?: boolean;
}

interface Centroide {
  falta: number;
  nota: number;
  sexo: number;
  trabalha: number;
}

class Cluster {
  public name: string;
  public points: Registro[] = [];
  public centroid: Centroide = { falta: 0, nota: 0, sexo: 0, trabalha: 0 };

  constructor(name: string) {
    this.name = name;
  }

  addPoint(point: Registro): void {
    point.isCentroide = false;
    this.points.push(point);
    this.updateCentroid();
  }

  removePointByName(nome: string): void {
    this.points = this.points.filter(p => p.nome !== nome);
    this.updateCentroid();
  }

  updateCentroid(): void {
    const total = this.points.length;
    if (total === 0) {
      this.centroid = { falta: 0, nota: 0, sexo: 0, trabalha: 0 };
      return;
    }

    const sumFalta = this.points.reduce((acc, p) => acc + p.falta, 0);
    const sumNota = this.points.reduce((acc, p) => acc + p.nota, 0);
    const sumSexo = this.points.reduce((acc, p) => acc + (p.sexo === 'Feminino' ? 1 : 0), 0);
    const sumTrabalho = this.points.reduce((acc, p) => acc + (p.trabalha ? 1 : 0), 0);

    this.centroid = {
      falta: sumFalta / total,
      nota: sumNota / total,
      sexo: sumSexo / total,
      trabalha: sumTrabalho / total
    };

    let minDist = Infinity;
    let closest: Registro | null = null;
    for (const p of this.points) {
      const d = this.distanceTo(p);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    }
    this.points.forEach(p => p.isCentroide = false);
    if (closest) closest.isCentroide = true;
  }

  distanceTo(point: Registro): number {
    const df = this.centroid.falta - point.falta;
    const dn = this.centroid.nota - point.nota;
    const ds = this.centroid.sexo - (point.sexo === 'Feminino' ? 1 : 0);
    const dt = this.centroid.trabalha - (point.trabalha ? 1 : 0);
    return Math.sqrt(df * df + dn * dn + ds * ds + dt * dt);
  }

  hasPoint(nome: string): boolean {
    return this.points.some(p => p.nome === nome);
  }
}

let registros: Registro[] = JSON.parse(fs.readFileSync('./registros.json', 'utf-8'));
const c1 = new Cluster('C1');
const c2 = new Cluster('C2');
let c3: Cluster | null = null;

function addToNearestCluster(point: Registro): void {
  if (c1.points.length === 0) {
    point.isCentroide = true;
    c1.addPoint(point);
    console.log(`C1 estava vazio. Adicionado:`, point);
    return;
  }
  if (c2.points.length === 0) {
    point.isCentroide = true;
    c2.addPoint(point);
    console.log(`C2 estava vazio. Adicionado:`, point);
    return;
  }

  const distC1 = c1.distanceTo(point);
  const distC2 = c2.distanceTo(point);

  if (distC1 < distC2) {
    c1.addPoint(point);
    console.log(`Adicionado a C1:`, point);
  } else {
    c2.addPoint(point);
    console.log(`Adicionado a C2:`, point);
  }
}

function removeFromClusters(nome: string): void {
  if (c1.hasPoint(nome)) {
    c1.removePointByName(nome);
    console.log(`${nome} removido de C1`);
  } else if (c2.hasPoint(nome)) {
    c2.removePointByName(nome);
    console.log(`${nome} removido de C2`);
  } else if (c3 && c3.hasPoint(nome)) {
    c3.removePointByName(nome);
    console.log(`${nome} removido de C3`);
  } else {
    console.log(`Registro ${nome} não encontrado.`);
  }
}

function verificarDispersao(limiar: number): void {
  const candidatos: Registro[] = [];
  for (const p of c1.points) {
    if (c1.distanceTo(p) > limiar) candidatos.push(p);
  }
  for (const p of c2.points) {
    if (c2.distanceTo(p) > limiar) candidatos.push(p);
  }

  if (candidatos.length === 0) {
    console.log("Nenhum ponto se encaixa para novo cluster.");
    return;
  }

  c3 = new Cluster('C3');
  for (const p of candidatos) {
    removeFromClusters(p.nome);
    c3.addPoint(p);
  }

  console.log(`Criado novo cluster C3 com ${c3.points.length} elementos:`);
  console.log(c3.points.map(p => `${p.nome}`));
  c1.updateCentroid();
  c2.updateCentroid();
}

registros.forEach(addToNearestCluster);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });


function kMeans(data: Registro[], k: number, maxIter = 100): Cluster[] {
  const clusters: Cluster[] = [];
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  for (let i = 0; i < k; i++) {
    const cluster = new Cluster('Cluster ' + (i + 1));
    cluster.centroid = {
      falta: shuffled[i].falta,
      nota: shuffled[i].nota,
      sexo: shuffled[i].sexo === 'Feminino' ? 1 : 0,
      trabalha: shuffled[i].trabalha ? 1 : 0
    };
    clusters.push(cluster);
  }

  for (let iter = 0; iter < maxIter; iter++) {
    clusters.forEach(c => c.points = []);
    for (const p of data) {
      let minDist = Infinity;
      let closestCluster = clusters[0];
      for (const cluster of clusters) {
        const d = Math.sqrt(
          Math.pow(cluster.centroid.falta - p.falta, 2) +
          Math.pow(cluster.centroid.nota - p.nota, 2) +
          Math.pow(cluster.centroid.sexo - (p.sexo === 'Feminino' ? 1 : 0), 2) +
          Math.pow(cluster.centroid.trabalha - (p.trabalha ? 1 : 0), 2)
        );
        if (d < minDist) {
          minDist = d;
          closestCluster = cluster;
        }
      }
      closestCluster.points.push(p);
    }
    clusters.forEach(c => c.updateCentroid());
  }

  return clusters;
}

function knnClassify(data: Registro[], input: Registro, k: number): Registro[] {
  const distances = data.map(p => ({
    point: p,
    distance: Math.sqrt(
      Math.pow(p.falta - input.falta, 2) +
      Math.pow(p.nota - input.nota, 2) +
      Math.pow((p.sexo === 'Feminino' ? 1 : 0) - (input.sexo === 'Feminino' ? 1 : 0), 2) +
      Math.pow((p.trabalha ? 1 : 0) - (input.trabalha ? 1 : 0), 2)
    )
  }));
  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k).map(d => d.point);
}

function showMenu(): void {
  console.log("\n📊 MENU:");
  console.log("1 - Ver centróides");
  console.log("2 - Adicionar novo registro");
  console.log("3 - Remover registro");
  console.log("4 - Ver membros dos clusters");
  console.log("5 - Limpar tela");
  console.log("6 - Análise de dispersão e novo cluster");
  console.log("7 - Executar K-Means");
  console.log("8 - Executar KNN para novo registro");
  console.log("0 - Sair");
  rl.question("Escolha uma opção: ", handleMenu);
}

function handleMenu(option: string): void {
  switch (option.trim()) {
    case '1':
      console.log("Centroide C1:", c1.centroid);
      console.log("Centroide C2:", c2.centroid);
      if (c3) console.log("Centroide C3:", c3.centroid);
      break;
    case '2':
      rl.question("Nome: ", (nome: any) => {
        rl.question("Faltas: ", (faltaStr: string) => {
          rl.question("Nota: ", (notaStr: string) => {
            rl.question("Sexo (F/M): ", (sexoInput: string) => {
              rl.question("Trabalha? (S/N): ", (trabalhaInput: string) => {
                const falta = parseFloat(faltaStr);
                const nota = parseFloat(notaStr);
                const sexo = sexoInput.trim().toUpperCase() === 'F' ? 'Feminino' : 'Masculino';
                const trabalha = trabalhaInput.trim().toUpperCase() === 'S';
                const novo: Registro = { nome, falta, nota, sexo, trabalha };
                registros.push(novo);
                addToNearestCluster(novo);
                showMenu();
              });
            });
          });
        });
      });
      return;
    case '3':
      rl.question("Nome para remover: ", (nome: string) => {
        registros = registros.filter(r => r.nome !== nome);
        removeFromClusters(nome);
        showMenu();
      });
      return;
    case '4':
      const format = (p: Registro) => `${p.nome} (${p.sexo}, Trabalha: ${p.trabalha ? 'Sim' : 'Não'}${p.isCentroide ? ', Centroide' : ''})`;
      console.log("C1:", c1.points.map(format));
      console.log("C2:", c2.points.map(format));
      if (c3) console.log("C3:", c3.points.map(format));
      break;
    case '5':
      console.clear();
      break;
    case '6':
      rl.question("Informe o limiar de distância: ", (limiarStr: string) => {
        verificarDispersao(parseFloat(limiarStr));
        showMenu();
      });
      return;
    case '7':
      const clusters = kMeans(registros, 3);
      clusters.forEach((c, i) => {
        console.log(`\nCluster ${i + 1} (Total: ${c.points.length}):`);
        c.points.forEach(p => console.log(` - ${p.nome}`));
      });
      break;
    case '8':
      rl.question("Faltas: ", (faltaStr: string) => {
        rl.question("Nota: ", (notaStr: string) => {
          rl.question("Sexo (F/M): ", (sexoInput: string) => {
            rl.question("Trabalha? (S/N): ", (trabalhaInput: string) => {
              const falta = parseFloat(faltaStr);
              const nota = parseFloat(notaStr);
              const sexo = sexoInput.trim().toUpperCase() === 'F' ? 'Feminino' : 'Masculino';
              const trabalha = trabalhaInput.trim().toUpperCase() === 'S';
              const input: Registro = { nome: 'Novo', falta, nota, sexo, trabalha };
              const vizinhos = knnClassify(registros, input, 3);
              console.log(`\n3 Vizinhos mais próximos:`);
              vizinhos.forEach(v => {
                console.log(` - ${v.nome} | Falta: ${v.falta}, Nota: ${v.nota}, Sexo: ${v.sexo}, Trabalha: ${v.trabalha}`);
              });
              showMenu();
            });
          });
        });
      });
      return;
    case '0':
      console.log("Saindo...");
      rl.close();
      return;
    default:
      console.log("Opção inválida.");
  }
  showMenu();
}

showMenu();