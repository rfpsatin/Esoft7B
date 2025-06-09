from src.models.cluster import distancia_euclidiana

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
