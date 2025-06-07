class Elemento:
    def __init__(self, nome, idade, falta, nota):
        self.nome = nome
        self.idade = idade
        self.falta = falta
        self.nota = nota
        self.is_centroide = False

    def vetor(self):
        return [self.idade, self.falta, self.nota]

    def __repr__(self):
        flag = " (Centroide)" if self.is_centroide else ""
        return f"{self.nome}: [{self.idade}, {self.falta}, {self.nota}]{flag}"
