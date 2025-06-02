from math import sqrt
from typing import List, Dict, Optional

# ===== REGISTRO E CLUSTER =====

class Registro:
    def __init__(self, id: int, atributos_numericos: List[float], atributos_categoricos: Optional[List[str]] = None, is_centroide: bool = False):
        self.id = id
        self.atributos_numericos = atributos_numericos
        self.atributos_categoricos = atributos_categoricos or []
        self.is_centroide = is_centroide
        self.cluster = None

    def __repr__(self):
        return f'Registro({self.id}, Num={self.atributos_numericos}, Cat={self.atributos_categoricos}, Centroide={self.is_centroide})'

class Cluster:
    def __init__(self, id: int):
        self.id = id
        self.registros: List[Registro] = []

    def adicionar(self, registro: Registro):
        registro.cluster = self.id
        self.registros.append(registro)

    def remover(self, registro_id: int):
        self.registros = [r for r in self.registros if r.id != registro_id]

    def atualizar_registro(self, registro_id: int, novos_atributos: List[float]):
        for r in self.registros:
            if r.id == registro_id:
                r.atributos_numericos = novos_atributos
                break

    def obter_centroide_virtual(self) -> Optional[List[float]]:
        if not self.registros:
            return None
        n = len(self.registros[0].atributos_numericos)
        soma = [0.0] * n
        for r in self.registros:
            for i in range(n):
                soma[i] += r.atributos_numericos[i]
        media = [x / len(self.registros) for x in soma] if self.registros else [0.0] * n
        return media

# ===== UTILIDADES =====

def distancia(v1: List[float], v2: List[float], tipo: str = 'euclidiana') -> float:
    if tipo == 'euclidiana':
        return sqrt(sum((a - b) ** 2 for a, b in zip(v1, v2)))
    elif tipo == 'manhattan':
        return sum(abs(a - b) for a, b in zip(v1, v2))
    else:
        raise ValueError("Tipo de distância não suportado.")

def atualizar_centroide_real(cluster: Cluster, tipo_distancia: str = 'euclidiana'):
    centroide_virtual = cluster.obter_centroide_virtual()
    if not centroide_virtual:
        return
    menor_dist = float('inf')
    novo_centroide = None
    for r in cluster.registros:
        r.is_centroide = False
        dist = distancia(r.atributos_numericos, centroide_virtual, tipo_distancia)
        if dist < menor_dist:
            menor_dist = dist
            novo_centroide = r
    if novo_centroide:
        novo_centroide.is_centroide = True

def reorganizar_cluster(cluster: Cluster, tipo_distancia: str = 'euclidiana'):
    centroide = next((r for r in cluster.registros if r.is_centroide), None)
    if centroide:
        cluster.registros.sort(key=lambda r: distancia(r.atributos_numericos, centroide.atributos_numericos, tipo_distancia))

def atribuir_ao_cluster(registro: Registro, clusters: List[Cluster], tipo_distancia: str = 'euclidiana'):
    menor_distancia = float('inf')
    cluster_mais_proximo = None
    for cluster in clusters:
        centroide = cluster.obter_centroide_virtual()
        if centroide is None:
            continue
        dist = distancia(registro.atributos_numericos, centroide, tipo_distancia)
        if dist < menor_distancia:
            menor_distancia = dist
            cluster_mais_proximo = cluster
    if cluster_mais_proximo:
        cluster_mais_proximo.adicionar(registro)

# ===== DISPERSÃO E NOVOS CLUSTERS =====

def verificar_dispersao(clusters: List[Cluster], limiar_distancia: float, tipo_distancia: str = 'euclidiana'):
    candidatos = []
    for cluster in clusters:
        centroide = next((r for r in cluster.registros if r.is_centroide), None)
        if not centroide:
            continue
        for r in cluster.registros:
            if r.is_centroide:
                continue
            dist = distancia(r.atributos_numericos, centroide.atributos_numericos, tipo_distancia)
            if dist > limiar_distancia:
                candidatos.append((r, cluster, dist))
    return candidatos

def encontrar_cluster_mais_proximo(registro: Registro, clusters: List[Cluster], cluster_atual_id: int, tipo_distancia: str = 'euclidiana'):
    menor_dist = float('inf')
    melhor_cluster = None
    for cluster in clusters:
        if cluster.id == cluster_atual_id:
            continue
        centroide = next((r for r in cluster.registros if r.is_centroide), None)
        if centroide:
            dist = distancia(registro.atributos_numericos, centroide.atributos_numericos, tipo_distancia)
            if dist < menor_dist:
                menor_dist = dist
                melhor_cluster = cluster
    return melhor_cluster

def criar_cluster_a_partir_dispersos(clusters: List[Cluster], candidatos, proximo_id: int, tipo_distancia: str = 'euclidiana'):
    novo_cluster = Cluster(proximo_id)
    for registro, cluster_origem, _ in candidatos:
        outro_cluster = encontrar_cluster_mais_proximo(registro, clusters, cluster_origem.id, tipo_distancia)
        if outro_cluster:
            cluster_origem.remover(registro.id)
            novo_cluster.adicionar(registro)
    if novo_cluster.registros:
        clusters.append(novo_cluster)
        atualizar_centroide_real(novo_cluster, tipo_distancia)
        reorganizar_cluster(novo_cluster, tipo_distancia)

# ===== CATEGÓRICOS -> NUMÉRICOS =====

def codificar_atributos(lista_registros: List[Registro]):
    colunas = list(zip(*(r.atributos_categoricos for r in lista_registros)))
    colunas_convertidas = []
    mapeamentos = []
    for col in colunas:
        valores_unicos = list(set(col))
        mapa = {valor: i for i, valor in enumerate(valores_unicos)}
        colunas_convertidas.append([mapa[v] for v in col])
        mapeamentos.append(mapa)
    registros_convertidos = list(zip(*colunas_convertidas))
    return registros_convertidos, mapeamentos

# ===== NORMALIZAÇÃO =====

def normalizar_atributos(lista_registros: List[Registro]):
    if not lista_registros:
        return
    n = len(lista_registros[0].atributos_numericos)
    mins = [min(r.atributos_numericos[i] for r in lista_registros) for i in range(n)]
    maxs = [max(r.atributos_numericos[i] for r in lista_registros) for i in range(n)]
    for r in lista_registros:
        r.atributos_numericos = [(r.atributos_numericos[i] - mins[i]) / (maxs[i] - mins[i] + 1e-8) for i in range(n)]

# ===== EXIBIÇÃO =====

def exibir_clusters(clusters: List[Cluster]):
    for c in clusters:
        print(f"\nCluster {c.id}:")
        for r in c.registros:
            print(r)

# ===== USO =====

if __name__ == "__main__":
    # Inicialização
    r1 = Registro(1, [2.0, 3.0], ["Alto", "Azul"], True)
    r2 = Registro(2, [8.0, 7.0], ["Baixo", "Verde"], True)
    c1 = Cluster(1)
    c2 = Cluster(2)
    c1.adicionar(r1)
    c2.adicionar(r2)
    clusters = [c1, c2]

    # Novo registro
    r3 = Registro(3, [4.0, 4.5], ["Alto", "Verde"])
    atribuir_ao_cluster(r3, clusters)

    # Atualiza e reorganiza
    for c in clusters:
        atualizar_centroide_real(c)
        reorganizar_cluster(c)

    # Verifica dispersão
    candidatos = verificar_dispersao(clusters, limiar_distancia=3.0)
    criar_cluster_a_partir_dispersos(clusters, candidatos, proximo_id=3)

    # Exibe
    exibir_clusters(clusters)

    # Categóricos para numéricos
    registros_cat = [
        Registro(10, [5.2], ["Alto", "Azul"]),
        Registro(11, [4.9], ["Baixo", "Verde"]),
        Registro(12, [6.1], ["Alto", "Azul"]),
    ]
    convertidos, mapas = codificar_atributos(registros_cat)
    for i, r in enumerate(registros_cat):
        print(f"\nOriginal: {r.atributos_categoricos} → Convertido: {convertidos[i]}")

    # Normalização
    normalizar_atributos([r1, r2, r3])
    print("\nAtributos normalizados:")
    for r in [r1, r2, r3]:
        print(r)
