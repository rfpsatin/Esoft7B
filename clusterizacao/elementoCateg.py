class ElementoCateg:
    def __init__(self, valor_str):
        self.valor_str = valor_str
        self.valor_num = None
        self.is_centroide = False
    def vetor(self):
        return [self.valor_num, 0, 0]
    def __repr__(self):
        flag = " (Centroide)" if self.is_centroide else ""
        return f"{self.valor_str}: [{self.valor_num}]{flag}"