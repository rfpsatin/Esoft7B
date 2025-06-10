import { clientesMock } from './clientes.mock';

export type Cliente = {
  formacaoEducacional: string;
  idade: number;
  estado: string;
  regiao: string;
  scoreSerasa: number;
  ticketMedio: number;
};

export class Cluster {
  elementos: Cliente[] = [];
  centroide: number[] = [];

  constructor(elementos: Cliente[] = []) {
    this.elementos = [...elementos];
    this.calcularCentroide();
  }

  adicionar(cliente: Cliente) {
    this.elementos.push(cliente);
    this.calcularCentroide();
  }

  private transformar(cliente: Cliente): number[] {
    const formacaoMap = {
      'Ensino Fundamental Completo': 1,
      'Ensino Médio Incompleto': 2,
      'Ensino Médio Completo': 3,
      'Ensino Superior Incompleto': 4,
      'Ensino Superior Completo': 5,
      'Pós-Graduação': 6
    };
    const estadoMap = {
      'AC': 1, 'AL': 2, 'AP': 3, 'AM': 4, 'BA': 5, 'CE': 6, 'DF': 7, 'ES': 8, 'GO': 9, 'MA': 10,
      'MT': 11, 'MS': 12, 'MG': 13, 'PA': 14, 'PB': 15, 'PR': 16, 'PE': 17, 'PI': 18, 'RJ': 19,
      'RN': 20, 'RS': 21, 'RO': 22, 'RR': 23, 'SC': 24, 'SP': 25, 'SE': 26, 'TO': 27
    };
    const regiaoMap = {
      'Norte': 1,
      'Nordeste': 2,
      'Centro-Oeste': 3,
      'Sudeste': 4,
      'Sul': 5
    };
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
    const atributos = this.elementos.map(e => this.transformar(e));
    const centroide: number[] = [];
    for (let i = 0; i < atributos[0].length; i++) {
      const valores = atributos.map(a => a[i]);
      const media = valores.reduce((acc, v) => acc + v, 0) / valores.length;
      centroide.push(media);
    }
    this.centroide = centroide;
  }

  distancia(cliente: Cliente) {
    const a = this.transformar(cliente);
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - this.centroide[i]) ** 2, 0));
  }
}