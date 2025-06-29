from src.controllers.cadastro_controller import realizar_cadastro
from src.controllers.cluster_controller import realizar_clusterizacao
from src.utils.limpar_tela import limpar_tela

def main():
    limpar_tela()
    print("=== Sistema de Clusterização K-means com limite dinâmico ===")
    
    clusters, elementos = realizar_cadastro()  
    realizar_clusterizacao(clusters, elementos)  

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nExecução interrompida pelo usuário. Até logo!")
