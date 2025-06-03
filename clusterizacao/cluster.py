import math
from elemento import Elemento

def distancia_euclidiana(p1, p2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))

class Cluster:
    def __init__(self, id):
        self.id = id
        self.elementos = []
        self.centroide = None

    def adicionar(self, elemento):
        self.elementos.append(elemento)
        self.atualizar_centroide()

    def remover(self, elemento):
        self.elementos.remove(elemento)
        self.atualizar_centroide()

    def editar_elemento(self, nome, nova_idade=None, nova_falta=None, nova_nota=None):
        for e in self.elementos:
            if e.nome.lower() == nome.lower():
                if nova_idade is not None:
                    e.idade = nova_idade
                if nova_falta is not None:
                    e.falta = nova_falta
                if nova_nota is not None:
                    e.nota = nova_nota
                self.atualizar_centroide()
                return True
        return False

    def atualizar_centroide(self):
        if not self.elementos:
            self.centroide = None
            return
        for e in self.elementos:
            e.is_centroide = False
        soma = [0, 0, 0]
        for e in self.elementos:
            v = e.vetor()
            soma[0] += v[0]
            soma[1] += v[1]
            soma[2] += v[2]
        n = len(self.elementos)
        media = [soma[0]/n, soma[1]/n, soma[2]/n]
        self.centroide = media
        mais_proximo = min(self.elementos, key=lambda e: distancia_euclidiana(e.vetor(), media))
        mais_proximo.is_centroide = True

    def __repr__(self):
        return f"Cluster {self.id} - Centroide: {self.centroide}\nElementos:\n  " + "\n  ".join(str(e) for e in self.elementos)

def k_means_sequencial(elementos):
    clusters = []
    cluster1 = Cluster(1)
    cluster1.adicionar(elementos[0])
    clusters.append(cluster1)
    print(f"Ponto {elementos[0]} definido como centroide do Cluster 1")

    cluster2 = Cluster(2)
    cluster2.adicionar(elementos[1])
    clusters.append(cluster2)
    print(f"Ponto {elementos[1]} definido como centroide do Cluster 2")

    for elem in elementos[2:]:
        distancias = [distancia_euclidiana(elem.vetor(), c.centroide) for c in clusters]
        idx_min = distancias.index(min(distancias))
        clusters[idx_min].adicionar(elem)
        print(f"Ponto {elem} atribuído ao Cluster {clusters[idx_min].id}. Novo centroide: {[round(x,2) for x in clusters[idx_min].centroide]}")

    return clusters

def analisar_dispersao(clusters, limite, min_tamanho_novo_cluster=1):
    removidos_por_cluster = {}

    for cluster in clusters:
        removidos_por_cluster[cluster.id] = []

    for cluster in clusters:
        for elemento in list(cluster.elementos):
            dist = distancia_euclidiana(elemento.vetor(), cluster.centroide)
            if dist > limite:
                outro_cluster, dist_outro = None, float('inf')
                for c in clusters:
                    if c != cluster:
                        d = distancia_euclidiana(elemento.vetor(), c.centroide)
                        if d < dist_outro:
                            outro_cluster = c
                            dist_outro = d
                if dist_outro < dist:
                    removidos_por_cluster[cluster.id].append(elemento)
                    print(f"Elemento {elemento.nome} será removido do Cluster {cluster.id} (dist {dist:.2f}) e é mais próximo do Cluster {outro_cluster.id} (dist {dist_outro:.2f})")

    novos_clusters = []
    for cluster_id, elementos_removidos in removidos_por_cluster.items():
        if len(elementos_removidos) >= min_tamanho_novo_cluster:
            cluster_novo = Cluster(len(clusters) + len(novos_clusters) + 1)
            cluster_original = next(c for c in clusters if c.id == cluster_id)
            for e in elementos_removidos:
                cluster_original.remover(e)
                cluster_novo.adicionar(e)
            novos_clusters.append(cluster_novo)

    if novos_clusters:
        clusters.extend(novos_clusters)
        print(f"\n{len(novos_clusters)} novo(s) cluster(es) criado(s) com base na dispersão.")
    else:
        print("\nNenhum novo cluster criado após análise de dispersão.")

    for c in clusters:
        c.atualizar_centroide()
