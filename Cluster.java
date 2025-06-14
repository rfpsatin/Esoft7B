import java.util.ArrayList;
import java.util.List;

class Cluster {
    Estudante centroide;
    List<Estudante> membros = new ArrayList<>();

    Cluster(Estudante centroide) {
        this.centroide = new Estudante(centroide.idade, centroide.presenca,
                centroide.medianaNota, centroide.comportamento);
    }

    void atualizarCentroide() {
        if (membros.isEmpty()) return;

        double somaIdade = 0, somaPresenca = 0, somaNota = 0;
        double somaComportamento = 0;

        for (Estudante s : membros) {
            somaIdade += s.idade;
            somaPresenca += s.presenca;
            somaNota += s.medianaNota;
            somaComportamento += s.comportamento;
        }

        int n = membros.size();
        centroide = new Estudante(
                somaIdade / n,
                somaPresenca / n,
                somaNota / n,
                (int) Math.round(somaComportamento / n)
        );
    }
}
