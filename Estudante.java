class Estudante {
    double idade;
    double presenca;
    double medianaNota;
    int comportamento;

    Estudante(double idade, double presenca, double medianaNota, String comportamentoStr) {
        this.idade = idade;
        this.presenca = presenca;
        this.medianaNota = medianaNota;
        this.comportamento = switch (comportamentoStr.toUpperCase()) {
            case "PREGUIÇOSO" -> 0;
            case "ESFORÇADO" -> 1;
            case "POSSUI_DOM" -> 2;
            default -> throw new IllegalArgumentException("Comportamento inválido: " + comportamentoStr);
        };
    }

    Estudante(double idade, double presenca, double medianaNota, int comportamento) {
        this.idade = idade;
        this.presenca = presenca;
        this.medianaNota = medianaNota;
        this.comportamento = comportamento;
    }

    double distanceTo(Estudante other) {
        double pesoIdade = 8.0;
        double pesoPresenca = 80.0;
        double pesoNota = 8.0;
        double pesoComportamento = 2.0;

        double diffIdade = (this.idade - other.idade) / pesoIdade;
        double diffPresenca = (this.presenca - other.presenca) / pesoPresenca;
        double diffNota = (this.medianaNota - other.medianaNota) / pesoNota;
        double diffComportamento = (this.comportamento - other.comportamento) / pesoComportamento;

        return Math.sqrt(diffIdade * diffIdade + diffPresenca * diffPresenca +
                diffNota * diffNota + diffComportamento * diffComportamento);
    }

    @Override
    public String toString() {
        String comportamentoStr = switch (comportamento) {
            case 0 -> "PREGUIÇOSO";
            case 1 -> "ESFORÇADO";
            case 2 -> "POSSUI_DOM";
            default -> "DESCONHECIDO";
        };
        return String.format("Idade: %.1f, Presença: %.1f%%, Nota: %.1f, Comportamento: %s",
                idade, presenca, medianaNota, comportamentoStr);
    }
}
