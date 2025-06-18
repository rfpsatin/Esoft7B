import * as fs from 'fs';
import * as path from 'path';
import { Cluster, Cliente } from './cluster';
import { clientesMock } from './clientes.mock';

export class ClusterManager {
  clusters: Cluster[];

  constructor() {
    const meio = Math.ceil(clientesMock.length / 2);
    this.clusters = [new Cluster(), new Cluster()];
    clientesMock.slice(0, meio).forEach(cliente => this.clusters[0].adicionar(cliente));
    clientesMock.slice(meio).forEach(cliente => this.clusters[1].adicionar(cliente));
    this.criarClustersDinamicamente(); // Chama logo após carregar a base
  }

  inserir(cliente: Cliente) {
    const distancias = this.clusters.map(cluster => cluster.distancia(cliente));
    const idx = distancias.indexOf(Math.min(...distancias));
    this.clusters[idx].adicionar(cliente);
    this.salvarClienteNoMock(cliente);
    this.criarClustersDinamicamente(); // Chama rotina dinâmica após cada inserção
  }

  private salvarClienteNoMock(cliente: Cliente) {
    const mockPath = path.resolve(__dirname, 'clientes.mock.ts');
    let conteudo = fs.readFileSync(mockPath, 'utf-8');
    const pos = conteudo.lastIndexOf(']');
    if (pos !== -1) {
      const clienteStr = `,\n    ${JSON.stringify(cliente, null, 4)}`;
      conteudo = conteudo.slice(0, pos) + clienteStr + conteudo.slice(pos);
      fs.writeFileSync(mockPath, conteudo, 'utf-8');
    }
  }

  mostrarCentroides() {
    this.clusters.forEach((cluster, i) => {
      console.log(`\n--- Cluster ${i + 1} ---`);
      console.log('Centroide (média dos atributos):');
      cluster.centroide.forEach((v, j) => {
        console.log(`  Atributo ${j + 1}: ${v.toFixed(2)}`);
      });
      console.log('Total de elementos:', cluster.elementos.length);
    });
  }

  knn(cliente: Cliente, k: number) {
    const todos: { cliente: Cliente; cluster: number }[] = [];
    this.clusters.forEach((cluster, idx) => {
      cluster.elementos.forEach(c => todos.push({ cliente: c, cluster: idx + 1 }));
    });

    const clusterTemp = new Cluster();
    return todos
      .map(obj => ({
        ...obj,
        distancia: clusterTemp.distanciaEntreClientes(cliente, obj.cliente)
      }))
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, k);
  }
  /**
   * Cria clusters dinamicamente com base na proximidade dos elementos.
   * Se dois elementos de clusters diferentes estão mais próximos entre si do que de seus centroides,
   * eles são agrupados em um novo cluster.
   */
  criarClustersDinamicamente() {
    let mudou = false;

    // Para cada par de clusters diferentes
    for (let i = 0; i < this.clusters.length; i++) {
      for (let j = i + 1; j < this.clusters.length; j++) {
        const clusterA = this.clusters[i];
        const clusterB = this.clusters[j];

        // Para cada elemento de A, compare com cada elemento de B
        for (const elemA of clusterA.elementos) {
          for (const elemB of clusterB.elementos) {
            const distAB = clusterA.distanciaEntreClientes(elemA, elemB);
            const distAcentroide = clusterA.distancia(elemA);
            const distBcentroide = clusterB.distancia(elemB);

            // Se estão mais próximos entre si do que de seus centroides
            if (distAB < distAcentroide && distAB < distBcentroide) {
              // Cria novo cluster com esses dois elementos
              const novoCluster = new Cluster([elemA, elemB]);
              this.clusters.push(novoCluster);

              // Remove dos clusters originais
              clusterA.elementos = clusterA.elementos.filter(e => e !== elemA);
              clusterB.elementos = clusterB.elementos.filter(e => e !== elemB);

              // Recalcula centroides
              clusterA.calcularCentroide();
              clusterB.calcularCentroide();
              novoCluster.calcularCentroide();

              mudou = true;
              break;
            }
          }
          if (mudou) break;
        }
        if (mudou) break;
      }
      if (mudou) break;
    }

    // Se houve mudança, repete para garantir que todos os pares sejam verificados
    if (mudou) {
      this.criarClustersDinamicamente();
    }
  }
}