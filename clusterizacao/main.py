import os
from elemento import Elemento
from cluster import Cluster, distancia_euclidiana, analisar_dispersao

def limpar_tela():
    os.system('cls' if os.name == 'nt' else 'clear')

def entrada_limite():
    while True:
        try:
            limite = float(input("Defina o limite máximo de distância para dispersão (ex: 2.5): ").strip())
            if limite <= 0:
                print("Digite um valor positivo.")
                continue
            return limite
        except ValueError:
            print("Valor inválido, digite um número válido.")

def exibir_clusters(clusters):
    print("\n--- Resultado dos Clusters ---")
    for cluster in clusters:
        centroide_formatado = [round(x, 2) for x in cluster.centroide] if cluster.centroide else None
        print(f"Cluster {cluster.id} - Centroide: {centroide_formatado}")
        for elem in cluster.elementos:
            flag = " (Centroide)" if elem.is_centroide else ""
            print(f"  {elem.nome}: [{elem.idade}, {elem.falta}, {elem.nota}]{flag}")
        print()

def main():
    limpar_tela()
    print("=== Sistema de Clusterização K-means com limite dinâmico ===")
    limite = entrada_limite()

    clusters = []
    elementos = []

    print("\nDigite os dados dos alunos: nome, idade, %falta (ex: 0.25), média da nota")
    print("Digite 'fim' para encerrar o cadastro.")

    while True:
        entrada = input("Digite os valores separados por espaço (ex: João 19 0.25 6.2): ").strip()
        if entrada.lower() == 'fim':
            break
        try:
            nome, idade, falta, nota = entrada.split()
            elemento = Elemento(nome, float(idade), float(falta), float(nota))
            elementos.append(elemento)

            if len(elementos) == 1:
                c1 = Cluster(1)
                c1.adicionar(elemento)
                clusters.append(c1)
                print(f"Ponto {elemento} definido como centroide do Cluster 1")

            elif len(elementos) == 2:
                c2 = Cluster(2)
                c2.adicionar(elemento)
                clusters.append(c2)
                print(f"Ponto {elemento} definido como centroide do Cluster 2")

            else:
                distancias = [distancia_euclidiana(elemento.vetor(), c.centroide) for c in clusters]
                idx_min = distancias.index(min(distancias))
                clusters[idx_min].adicionar(elemento)
                print(f"Ponto {elemento} atribuído ao Cluster {clusters[idx_min].id}. Novo centroide: {[round(x, 2) for x in clusters[idx_min].centroide]}")

                analisar_dispersao(clusters, limite)
                print(f"Clusters atualizados após análise de dispersão com limite {limite}.")

            exibir_clusters(clusters)

        except Exception as e:
            print(f"Entrada inválida! Erro: {e}. Digite corretamente ou 'fim' para sair.")

    print("\nCadastro encerrado. Resultado final dos clusters:")
    exibir_clusters(clusters)

if __name__ == "__main__":
    main()
