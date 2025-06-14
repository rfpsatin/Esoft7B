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
  }

  inserir(cliente: Cliente) {
    const distancias = this.clusters.map(cluster => cluster.distancia(cliente));
    const idx = distancias.indexOf(Math.min(...distancias));
    this.clusters[idx].adicionar(cliente);
    this.salvarClienteNoMock(cliente); 
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
}