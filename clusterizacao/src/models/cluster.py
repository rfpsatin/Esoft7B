import math
from src.models.elemento import Elemento

def distancia_euclidiana(p1, p2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))

class Cluster:
    def __init__(self, id):
        self.id = id
        self.elementos = []
        self.centroide = None

    def adicionar(self, elemento):
        self.elementos.append(elemento)
        self.atualizar_centroide()

    def remover(self, elemento):
        self.elementos.remove(elemento)
        self.atualizar_centroide()

    def editar_elemento(self, nome, nova_idade=None, nova_falta=None, nova_nota=None):
        for e in self.elementos:
            if e.nome.lower() == nome.lower():
                if nova_idade is not None:
                    e.idade = nova_idade
                if nova_falta is not None:
                    e.falta = nova_falta
                if nova_nota is not None:
                    e.nota = nova_nota
                self.atualizar_centroide()
                return True
        return False

    def atualizar_centroide(self):
        if not self.elementos:
            self.centroide = None
            return
        for e in self.elementos:
            e.is_centroide = False
        soma = [0, 0, 0]
        for e in self.elementos:
            v = e.vetor()
            soma[0] += v[0]
            soma[1] += v[1]
            soma[2] += v[2]
        n = len(self.elementos)
        media = [soma[0] / n, soma[1] / n, soma[2] / n]
        self.centroide = media
        mais_proximo = min(self.elementos, key=lambda e: distancia_euclidiana(e.vetor(), media))
        mais_proximo.is_centroide = True

    def __repr__(self):
        return f"Cluster {self.id} - Centroide: {self.centroide}\nElementos:\n  " + "\n  ".join(str(e) for e in self.elementos)
