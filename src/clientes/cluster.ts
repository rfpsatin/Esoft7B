import { clientesMock } from './clientes.mock';

type Cliente = {
  formacaoEducacional: string;
  idade: number;
  estado: string;
  regiao: string;
  scoreSerasa: number;
  ticketMedio: number;
};

class Cluster {
  elementos: Cliente[];
  centroide: number[] = [];

  constructor() {
    // Inicializa o cluster com os clientes do mock
    this.elementos = [...clientesMock];
    this.calcularCentroide();
  }

  adicionar(cliente: Cliente) {
    this.elementos.push(cliente);
    this.calcularCentroide();
  }

  private transformar(cliente: Cliente): number[] {
    const formacaoMap = { 'fundamental': 1, 'medio': 2, 'superior': 3 };
    const estadoMap = { 'SP': 1, 'RJ': 2, 'MG': 3, 'RS': 4 };
    const regiaoMap = { 'sudeste': 1, 'sul': 2, 'norte': 3, 'nordeste': 4, 'centro-oeste': 5 };
    return [
      formacaoMap[cliente.formacaoEducacional] || 0,
      cliente.idade,
      estadoMap[cliente.estado] || 0,
      regiaoMap[cliente.regiao] || 0,
      cliente.scoreSerasa,
      cliente.ticketMedio,
    ];
  }

  calcularCentroide() {
    if (this.elementos.length === 0) return;
    const soma = this.elementos
      .map(e => this.transformar(e))
      .reduce((acc, val) => acc.map((x, i) => x + val[i]));
    this.centroide = soma.map(x => x / this.elementos.length);
  }

  distancia(a: number[], b: number[]) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }

  extremos() {
    return this.elementos
      .map(e => ({
        cliente: e,
        distancia: this.distancia(this.transformar(e), this.centroide),
      }))
      .sort((a, b) => b.distancia - a.distancia);
  }

  knn(cliente: Cliente, k: number) {
    const alvo = this.transformar(cliente);
    return this.elementos
      .map(e => ({
        cliente: e,
        distancia: this.distancia(this.transformar(e), alvo),
      }))
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, k);
  }
}

export { Cluster, Cliente };