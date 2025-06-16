import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

public class Main {

    private static List<Estudante> inicializarCentroides(List<Estudante> estudantes, int qtdClusters) {

        List<Estudante> centroides = new ArrayList<>();
        centroides.add(estudantes.get(0));

        for (int i = 1; i < qtdClusters; i++) {
            double[] distancias = new double[estudantes.size()];
            double somaDistancias = 0.0;

            for (int j = 0; j < estudantes.size(); j++) {
                double minDist = Double.MAX_VALUE;
                for (Estudante centroide : centroides) {
                    minDist = Math.min(minDist, estudantes.get(j).distanceTo(centroide));
                }
                distancias[j] = minDist * minDist;
                somaDistancias += distancias[j];
            }

            double soma = 0.0;
            for (int j = 0; j < estudantes.size(); j++) {
                soma += distancias[j];
                if (soma >= somaDistancias) {
                    centroides.add(estudantes.get(j));
                    break;
                }
            }
        }

        return centroides;
    }

    public static List<Cluster> clusterize(List<Estudante> estudantes, int qtdClusters, int maxIterations) {
        qtdClusters = Math.min(qtdClusters, estudantes.size());
        List<Cluster> clusters = new ArrayList<>();

        List<Estudante> centroidesIniciais = inicializarCentroides(estudantes, qtdClusters);
        for (Estudante centroide : centroidesIniciais) {
            clusters.add(new Cluster(centroide));
        }

        for (int iter = 0; iter < maxIterations; iter++) {
            for (Cluster c : clusters) {
                c.membros.clear();
            }

            for (Estudante estudante : estudantes) {
                Cluster clusterMaisProximo = null;
                double distanciaMinima = Double.MAX_VALUE;

                for (Cluster cluster : clusters) {
                    double distance = estudante.distanceTo(cluster.centroide);
                    if (distance < distanciaMinima) {
                        distanciaMinima = distance;
                        clusterMaisProximo = cluster;
                    }
                }
                if (clusterMaisProximo != null) {
                    clusterMaisProximo.membros.add(estudante);
                }
            }

            for (int i = 0; i < clusters.size(); i++) {
                if (clusters.get(i).membros.isEmpty()) {
                    Estudante pontoMaisDistante = encontrarPontoMaisDistante(estudantes, clusters);
                    clusters.set(i, new Cluster(pontoMaisDistante));
                    clusters.get(i).membros.add(pontoMaisDistante);
                    for (int j = 0; j < clusters.size(); j++) {
                        if (j != i) {
                            clusters.get(j).membros.remove(pontoMaisDistante);
                        }
                    }
                }
            }

            for (Cluster cluster : clusters) {
                cluster.atualizarCentroide();
            }
        }

        return clusters;
    }

    private static Estudante encontrarPontoMaisDistante(List<Estudante> estudantes, List<Cluster> clusters) {
        Estudante pontoMaisDistante = null;
        double maxDistanciaMinima = -1;

        for (Estudante estudante : estudantes) {
            double minDistancia = Double.MAX_VALUE;
            for (Cluster cluster : clusters) {
                if (!cluster.membros.isEmpty()) {
                    minDistancia = Math.min(minDistancia, estudante.distanceTo(cluster.centroide));
                }
            }
            if (minDistancia > maxDistanciaMinima) {
                maxDistanciaMinima = minDistancia;
                pontoMaisDistante = estudante;
            }
        }

        return pontoMaisDistante != null ? pontoMaisDistante : estudantes.get(0);
    }

    public static void imprimirDados(List<Cluster> clusters) {
        System.out.println("\nEstatísticas dos Clusters:");
        System.out.println("═".repeat(60));

        for (int i = 0; i < clusters.size(); i++) {
            Cluster c = clusters.get(i);


            System.out.printf("Cluster %d (%d membros)",
                    i + 1, c.membros.size());
            System.out.println("   Centroide: " + c.centroide);

            if (!c.membros.isEmpty()) {
                System.out.println("   Membros:");
                for (Estudante s : c.membros) {
                    System.out.println("     • " + s);
                }
            } else {
                System.out.println("   (Cluster vazio)");
            }
            System.out.println();
        }
        System.out.println("═".repeat(60));
    }

    public static void main(String[] args) {
        List<Estudante> alunos = List.of(
                new Estudante(17, 82.5, 7.5, "ESFORÇADO"),
                new Estudante(18, 65.0, 5.0, "PREGUIÇOSO"),
                new Estudante(16, 95.0, 8.9, "POSSUI_DOM"),
                new Estudante(17, 88.0, 6.5, "ESFORÇADO"),
                new Estudante(19, 50.0, 4.0, "PREGUIÇOSO"),
                new Estudante(15, 98.0, 9.5, "POSSUI_DOM"),
                new Estudante(18, 78.0, 7.0, "ESFORÇADO"),
                new Estudante(20, 95.0, 9.5, "PREGUIÇOSO"),
                new Estudante(16, 92.0, 8.2, "POSSUI_DOM"),
                new Estudante(17, 75.0, 6.8, "ESFORÇADO")
        );

        System.out.println("═".repeat(60));

        int qtdClusters = 3;
        int maxIteracoes = 500;

        System.out.printf("\nEXECUTANDO CLUSTERIZAÇÃO FINAL (K=%d, Max Iter=%d):%n",
                qtdClusters, maxIteracoes);
        List<Cluster> clustersFinais = clusterize(alunos, qtdClusters, maxIteracoes);

        imprimirDados(clustersFinais);

        // KNN
        clustersFinais.sort(Comparator.comparing(cluster -> (cluster.centroide.sumAllAtributes())));
        Map<Cluster, String> sortedTypedClusters = Map.ofEntries(
                Map.entry(clustersFinais.getFirst(), "PESSIMO"),
                Map.entry(clustersFinais.get(1), "MEIA BOMBA"),
                Map.entry(clustersFinais.get(2), "OTIMO")
        );
        Estudante estudanteKnn = new Estudante(19, 50.0, 4.0, "PREGUIÇOSO");
        Cluster closestCluster = clustersFinais.getFirst();
        for (Cluster cluster : clustersFinais) {
            if (estudanteKnn.distanceTo(cluster.centroide) < estudanteKnn.distanceTo(closestCluster.centroide)) {
                closestCluster = cluster;
            }
        }
        System.out.printf("\nO NOVO ESTUDANTE EH: %s", sortedTypedClusters.get(closestCluster));
    }
}
