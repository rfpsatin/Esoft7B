from src.models.elemento import Elemento
from src.models.elementoCateg import ElementoCateg
from src.models.cluster import Cluster, distancia_euclidiana
from src.utils.menu import menu_acao
from src.utils.limpar_tela import limpar_tela

string_to_num = {}

def _input_float(msg):
    val = input(msg).strip()
    if val == '':
        return None
    try:
        return float(val)
    except ValueError:
        print("Valor inválido. Mantendo valor atual.")
        return None

def exibir_clusters(clusters):
    print("\n--- Resultado dos Clusters ---")
    for cluster in clusters:
        centroide_formatado = [round(x, 2) for x in cluster.centroide] if cluster.centroide else None
        print(f"Cluster {cluster.id} - Centroide: {centroide_formatado}")
        for elem in cluster.elementos:
            flag = " (Centroide)" if elem.is_centroide else ""
            if hasattr(elem, 'nome'):
                print(f"  {elem.nome}: [{elem.idade}, {elem.falta}, {elem.nota}]{flag}")
            elif hasattr(elem, 'valor_str'):
                print(f"  {elem.valor_str}: [{elem.valor_num}]{flag}")
        print()

def atribuir_a_cluster(elemento, clusters, limite):
    total_elementos = sum(len(c.elementos) for c in clusters) + 1
    if total_elementos == 1:
        c1 = Cluster(1)
        c1.adicionar(elemento)
        clusters.append(c1)
        print(f"Ponto {elemento} definido como centroide do Cluster 1")
    elif total_elementos == 2:
        c2 = Cluster(2)
        c2.adicionar(elemento)
        clusters.append(c2)
        print(f"Ponto {elemento} definido como centroide do Cluster 2")
    else:
        cluster_vazio = next((c for c in clusters if not c.elementos), None)
        if cluster_vazio:
            cluster_vazio.adicionar(elemento)
            print(f"Ponto {elemento} atribuído ao Cluster {cluster_vazio.id} (reutilizado cluster vazio). Novo centroide: {[round(x, 2) for x in cluster_vazio.centroide]}")
        else:
            distancias = [distancia_euclidiana(elemento.vetor(), c.centroide) for c in clusters]
            min_dist = min(distancias)
            idx_min = distancias.index(min_dist)
            if min_dist > limite and len(clusters) < 3:
                novo_cluster = Cluster(len(clusters) + 1)
                novo_cluster.adicionar(elemento)
                clusters.append(novo_cluster)
                print(f"Ponto {elemento} criou o Cluster {novo_cluster.id} como centroide (distância {min_dist:.2f} > limite {limite})")
            else:
                clusters[idx_min].adicionar(elemento)
                print(f"Ponto {elemento} atribuído ao Cluster {clusters[idx_min].id}. Novo centroide: {[round(x, 2) for x in clusters[idx_min].centroide]}")

def realizar_cadastro():
    limite = 0
    clusters = []
    elementos = []
    elementos_categ = []

    while True:
        acao = menu_acao()
        if acao == '1':
            limpar_tela()
            if limite == 0: 
                limite = float(input("Defina o limite máximo de distância para dispersão (ex: 2.5): ").strip())

            entrada = input("Digite os valores separados por espaço (ex: João 19 0.25 6.2): ").strip()
            try:
                nome, idade, falta, nota = entrada.split()
                elemento = Elemento(nome, float(idade), float(falta), float(nota))
                elementos.append(elemento)
                atribuir_a_cluster(elemento, clusters, limite)
                exibir_clusters(clusters)
            except Exception as e:
                print(f"Entrada inválida! Erro: {e}. Digite corretamente.")
                
        elif acao == '2':
            nome = input("Digite o nome do aluno a ser removido: ").strip()
            encontrado = False
            for cluster in clusters[:]:
                for elem in list(cluster.elementos):
                    if hasattr(elem, 'nome') and elem.nome.lower() == nome.lower():
                        cluster.remover(elem)
                        elementos.remove(elem)
                        print(f"Aluno {nome} removido do Cluster {cluster.id}.")
                        if not cluster.elementos:
                            clusters.remove(cluster) 
                        encontrado = True
                        break
                if encontrado:
                    break
            if not encontrado:
                print(f"Aluno {nome} não encontrado em nenhum cluster.")
            exibir_clusters(clusters)

        elif acao == '3':
            nome = input("Digite o nome do aluno a ser editado: ").strip()
            nova_idade = _input_float("Nova idade (ou Enter para manter): ")
            nova_falta = _input_float("Nova %falta (ou Enter para manter): ")
            nova_nota = _input_float("Nova nota (ou Enter para manter): ")
            for cluster in clusters:
                for elem in list(cluster.elementos):
                    if hasattr(elem, 'nome') and elem.nome.lower() == nome.lower():
                        if nova_idade is not None:
                            elem.idade = nova_idade
                        if nova_falta is not None:
                            elem.falta = nova_falta
                        if nova_nota is not None:
                            elem.nota = nova_nota
                        cluster.remover(elem)
                        atribuir_a_cluster(elem, clusters, limite)
                        print(f"Aluno {nome} editado e reatribuído ao cluster mais próximo.")
                        break
                else:
                    continue
                break
            else:
                print(f"Aluno {nome} não encontrado em nenhum cluster.")
            exibir_clusters(clusters)

        elif acao == '4':
            limpar_tela()
            valor_str = input("Digite a string categórica (apenas uma palavra): ").strip()
            if not valor_str.isalpha():
                print("Apenas uma palavra (letras) é permitida.")
                continue
            if valor_str not in string_to_num:
                string_to_num[valor_str] = len(string_to_num)
            elemento_categ = ElementoCateg(valor_str)
            elemento_categ.valor_num = string_to_num[valor_str]
            elementos_categ.append(elemento_categ)
            atribuir_a_cluster(elemento_categ, clusters, limite)
            print("\nMapeamento atual de strings categóricas:")
            for s, n in string_to_num.items():
                print(f"  {s} -> {n}")
            exibir_clusters(clusters)

        elif acao == '5':
            limpar_tela()
            print("\nCadastro encerrado. Resultado final dos clusters:")
            exibir_clusters(clusters)
            return clusters, elementos + elementos_categ
        else:
            print("Opção inválida. Tente novamente.")
