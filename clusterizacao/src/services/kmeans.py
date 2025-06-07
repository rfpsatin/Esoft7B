from src.models.cluster import Cluster, distancia_euclidiana

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
