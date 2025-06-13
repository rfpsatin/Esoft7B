import math
import uuid
from typing import List, Union

# estrutura de dados

class Elemento:
    def __init__(self, atributos: List[Union[float, str]], id=None):
        self.id = id or str(uuid.uuid4())
        self.atributos = atributos
        self.is_centroid = False

    def __repr__(self):
        return f"{'C' if self.is_centroid else ' '} {self.atributos}"

# codificação e distância

def encode(atributos):
    """Converte atributos categóricos (strings) para valores numéricos."""
    return [float(ord(x)) if isinstance(x, str) else x for x in atributos]

def distancia(a: Elemento, b: Elemento) -> float:
    """Calcula distância euclidiana entre dois elementos."""
    a_vals = encode(a.atributos)
    b_vals = encode(b.atributos)
    return math.sqrt(sum((ai - bi) ** 2 for ai, bi in zip(a_vals, b_vals)))

# atribuição de elementos e calculo de distancias / reorganização e recálculo de centroides

class Cluster:
    def __init__(self, elemento: Elemento):
        self.elementos = [elemento]
        self.centroide = elemento
        elemento.is_centroid = True

    def atualizar_centroide(self):
        num_atributos = len(self.elementos[0].atributos)
        soma = [0] * num_atributos
        for elem in self.elementos:
            valores = encode(elem.atributos)
            soma = [s + v for s, v in zip(soma, valores)]
        media = [s / len(self.elementos) for s in soma]
        self.centroide = Elemento(media)
        self.centroide.is_centroid = True

    def adicionar_elemento(self, elemento: Elemento):
        self.elementos.append(elemento)
        self.atualizar_centroide()

    def remover_elemento(self, elemento: Elemento):
        self.elementos.remove(elemento)
        self.atualizar_centroide()

    def dispersao(self):
        return max(distancia(elem, self.centroide) for elem in self.elementos)

    def __repr__(self):
        return f"Cluster com {len(self.elementos)} elementos:\n" + "\n".join(map(str, self.elementos))

# análise de dispersão e criação de novos clusters

class ClusterManager:
    def __init__(self):
        self.clusters = []

    def inserir_elemento(self, elemento: Elemento):
        if len(self.clusters) < 2:
            self.clusters.append(Cluster(elemento))
            print(f"Elemento {elemento.atributos} iniciou novo cluster.")
        else:
            distancias = [(cluster, distancia(elemento, cluster.centroide)) for cluster in self.clusters]
            melhor_cluster = min(distancias, key=lambda x: x[1])[0]
            melhor_cluster.adicionar_elemento(elemento)
            print(f"Inserido em cluster com centroide {melhor_cluster.centroide.atributos}")

    def reorganizar_clusters(self, limiar_distancia=5.0):
        novos_clusters = []
        for cluster in self.clusters:
            for elemento in cluster.elementos[:]:  # cópia da lista
                d = distancia(elemento, cluster.centroide)
                if d > limiar_distancia:
                    proximos = [(c, distancia(elemento, c.centroide)) for c in self.clusters if c != cluster]
                    if proximos:
                        melhor, d_melhor = min(proximos, key=lambda x: x[1])
                        if d_melhor < d:
                            cluster.remover_elemento(elemento)
                            melhor.adicionar_elemento(elemento)
                            print(f"Elemento {elemento.atributos} movido para outro cluster.")

        for cluster in self.clusters:
            if cluster.dispersao() > limiar_distancia:
                mais_distante = max(cluster.elementos, key=lambda x: distancia(x, cluster.centroide))
                cluster.remover_elemento(mais_distante)
                novos_clusters.append(Cluster(mais_distante))
                print(f"Criado novo cluster com {mais_distante.atributos}.")
        self.clusters.extend(novos_clusters)

    def mostrar_clusters(self):
        for i, cluster in enumerate(self.clusters):
            print(f"\nCluster {i+1}:\n{cluster}")


# EXEMPLO DE USO 

if __name__ == "__main__":
    print("=== INICIALIZAÇÃO ===")
    cm = ClusterManager()

    print("\n=== INSERÇÃO DE ELEMENTOS NUMÉRICOS ===")
    cm.inserir_elemento(Elemento([1.0, 2.0]))
    cm.inserir_elemento(Elemento([10.0, 12.0]))
    cm.inserir_elemento(Elemento([1.2, 2.1]))
    cm.inserir_elemento(Elemento([9.9, 12.2]))
    cm.inserir_elemento(Elemento([50.0, 60.0]))  # Disperso

    print("\n=== REORGANIZAÇÃO E CRIAÇÃO DE NOVOS CLUSTERS ===")
    cm.reorganizar_clusters()

    print("\n=== CLUSTERS FINAIS ===")
    cm.mostrar_clusters()

    print("\n=== INSERÇÃO DE ELEMENTOS CATEGÓRICOS ===")
    cm.inserir_elemento(Elemento(["A", 1.0]))
    cm.inserir_elemento(Elemento(["B", 2.0]))
    cm.mostrar_clusters()
