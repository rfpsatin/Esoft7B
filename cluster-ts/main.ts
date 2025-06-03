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
    const dist = c1.distanceTo(p);
    if (dist > limiar) {
      candidatos.push(p);
    }
  }

  for (const p of c2.points) {
    const dist = c2.distanceTo(p);
    if (dist > limiar) {
      candidatos.push(p);
    }
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

function showMenu(): void {
  console.log("\n📊 MENU:");
  console.log("1 - Ver centróides");
  console.log("2 - Adicionar novo registro");
  console.log("3 - Remover registro");
  console.log("4 - Ver membros dos clusters");
  console.log("5 - Limpar tela");
  console.log("6 - Análise de dispersão e novo cluster");
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
      rl.question("Nome: ", nome => {
        rl.question("Faltas: ", faltaStr => {
          rl.question("Nota: ", notaStr => {
            rl.question("Sexo (F/M): ", sexoInput => {
              rl.question("Trabalha? (S/N): ", trabalhaInput => {
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
      rl.question("Nome para remover: ", nome => {
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
      rl.question("Informe o limiar de distância: ", limiarStr => {
        const limiar = parseFloat(limiarStr);
        verificarDispersao(limiar);
        showMenu();
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