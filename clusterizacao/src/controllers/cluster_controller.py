from src.models.cluster import Cluster
from src.services.kmeans import k_means_sequencial
from src.services.dispersao import analisar_dispersao

def realizar_clusterizacao(clusters, elementos):
    if len(elementos) < 2:
        print("É necessário pelo menos 2 elementos para realizar a clusterização.")
        return

    k_means_sequencial(elementos)
    limite = 2.5 
    analisar_dispersao(clusters, limite)
