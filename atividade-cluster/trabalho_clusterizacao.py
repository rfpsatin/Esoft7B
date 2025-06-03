# Trabalho de Clusterização com K-means e preparação para KNN

import numpy as np
from sklearn.preprocessing import LabelEncoder

class Registro:
    def __init__(self, id, dados, categoria=None, is_centroide=False):
        self.id = id
        self.dados = dados  # Lista de atributos numéricos
        self.categoria = categoria  # Pode ser uma string
        self.is_centroide = is_centroide

    def __repr__(self):
        return f"{self.id}: {self.dados} {'(C)' if self.is_centroide else ''}"

class Cluster:
    def __init__(self, registros=None):
        self.registros = registros or []
        self.centroide = None
        if self.registros:
            self.recalcular_centroide()

    def adicionar_registro(self, registro):
        self.registros.append(registro)
        self.recalcular_centroide()

    def recalcular_centroide(self):
        dados = [r.dados for r in self.registros]
        self.centroide = np.mean(dados, axis=0).tolist()

    def dispersao_maxima(self):
        return max([np.linalg.norm(np.array(r.dados) - np.array(self.centroide)) for r in self.registros])

    def reorganizar(self):
        self.recalcular_centroide()

class KMeansSimples:
    def __init__(self):
        self.clusters = []

    def inicializar_clusters(self, registros):
        for r in registros:
            r.is_centroide = True
            self.clusters.append(Cluster([r]))

    def adicionar_registro(self, registro):
        distancias = [np.linalg.norm(np.array(registro.dados) - np.array(c.centroide)) for c in self.clusters]
        cluster_mais_proximo = self.clusters[np.argmin(distancias)]
        registro.is_centroide = False
        cluster_mais_proximo.adicionar_registro(registro)

    def verificar_dispersao_e_criar_cluster(self, limiar):
        for cluster in self.clusters:
            dispersoes = [np.linalg.norm(np.array(r.dados) - np.array(cluster.centroide)) for r in cluster.registros]
            elementos_distantes = [r for r, d in zip(cluster.registros, dispersoes) if d > limiar]
            if elementos_distantes:
                novo_cluster = Cluster(elementos_distantes)
                for r in elementos_distantes:
                    cluster.registros.remove(r)
                cluster.reorganizar()
                self.clusters.append(novo_cluster)

    def imprimir_clusters(self):
        for i, c in enumerate(self.clusters):
            print(f"Cluster {i+1} (centroide: {c.centroide}):")
            for r in c.registros:
                print(f"  - {r}")

class PreparadorParaKNN:
    def __init__(self):
        self.label_encoder = LabelEncoder()

    def codificar_categoricos(self, registros):
        categorias = [r.categoria for r in registros if r.categoria is not None]
        if categorias:
            codificados = self.label_encoder.fit_transform(categorias)
            for r, val in zip([r for r in registros if r.categoria is not None], codificados):
                r.dados.append(val)  # Adiciona ao final da lista de dados

# Exemplo de uso
r1 = Registro("A", [1.0, 2.0], categoria="cliente")
r2 = Registro("B", [8.0, 9.0], categoria="empresa")
r3 = Registro("C", [2.0, 2.5], categoria="cliente")
r4 = Registro("D", [8.5, 9.5], categoria="empresa")

kmeans = KMeansSimples()
kmeans.inicializar_clusters([r1, r2])
kmeans.adicionar_registro(r3)
kmeans.adicionar_registro(r4)
kmeans.verificar_dispersao_e_criar_cluster(limiar=2.5)
kmeans.imprimir_clusters()

preparador = PreparadorParaKNN()
preparador.codificar_categoricos([r1, r2, r3, r4])
