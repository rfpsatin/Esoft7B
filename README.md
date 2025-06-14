# Projeto de Clustering e KNN - Tópicos em Engenharia de Software

**Participantes:**  
Anna Júlia Duarte Prando — R.A: 22045748-2  
João Pedro dos Santos Lussani — R.A: 22014550-2  
Wesley dos Santos David — R.A: 22171156-2

**Curso:** Engenharia de Software — 7º Semestre — UniCesumar  
**Professor:** Ricardo Satin  
**Disciplina:** Tópicos em Engenharia de Software

---

## Apresentação

Este projeto consiste em um sistema de agrupamento (clustering) e classificação (KNN) de clientes, desenvolvido em Node.js/TypeScript para ser executado via terminal. O objetivo é demonstrar técnicas de agrupamento de dados e classificação utilizando conceitos de centroide, distância euclidiana e K-Nearest Neighbors (KNN).

---

## O que o programa faz

- **Agrupa clientes em dois clusters** com base em seus atributos.
- **Calcula o centroide** (média dos atributos) de cada cluster.
- **Insere novos clientes** automaticamente no cluster mais próximo (menor distância euclidiana ao centroide).
- **Recalcula o centroide** do cluster após cada inserção.
- **Permite consultar os centroides** e o valor geral (soma dos atributos) de cada cluster.
- **Executa o algoritmo KNN**: dado um cliente e um valor K, retorna os K clientes mais próximos (de qualquer cluster), mostrando a qual cluster cada vizinho pertence.
- **Salva novos clientes** na base de dados (`clientes.mock.ts`), garantindo persistência para execuções futuras.

---

## Estrutura do Projeto

- `src/clientes/clientes.mock.ts` — Base de dados dos clientes (mock).
- `src/clientes/cluster.ts` — Classe `Cluster` e tipo `Cliente`.
- `src/clientes/cluster-manager.ts` — Classe `ClusterManager` (gerencia clusters, inserção e KNN).
- `src/clientes/cli.ts` — Interface de linha de comando (terminal).

---

## Como funciona

1. **Inicialização:**  
   O programa carrega os clientes do mock e divide em dois clusters. Cada cluster calcula seu centroide inicial.

2. **Inserção de cliente:**  
   Ao adicionar um novo cliente, o programa calcula a distância dele para o centroide de cada cluster e o insere no cluster mais próximo. O centroide desse cluster é recalculado.

3. **Consulta de centroides:**  
   Mostra a média (centroide) e a soma total dos atributos de cada cluster, além do número de elementos.

4. **KNN:**  
   Permite informar um cliente e um valor K, retornando os K clientes mais próximos (de qualquer cluster), mostrando a qual cluster pertencem e a distância.

5. **Persistência:**  
   Todo novo cliente inserido é salvo no arquivo `clientes.mock.ts`, garantindo que a base de dados seja atualizada.

---

## Como rodar o programa

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm (gerenciador de pacotes)
- TypeScript instalado globalmente ou via projeto

### Instalação

1. Clone o repositório:

   ```sh
   git clone <url-do-repositorio>
   cd <pasta-do-projeto>
   ```

2. Instale as dependências:

   ```sh
   npm install
   ```

3. Compile o projeto:
   ```sh
   npx tsc
   ```

### Execução

Execute o programa via terminal:

```sh
node dist/src/clientes/cli.js
```

Ou, se preferir rodar direto sem compilar:

```sh
npx ts-node src/clientes/cli.ts
```

---

## Comandos disponíveis no terminal

- **Adicionar cliente:**  
  Insere um novo cliente, que será automaticamente classificado no cluster mais próximo.

- **Mostrar centroides:**  
  Exibe a média (centroide) e a soma total dos atributos de cada cluster, além do número de elementos.

- **Executar KNN:**  
  Permite informar os dados de um cliente e o valor de K, retornando os K clientes mais próximos e a qual cluster pertencem.

- **Sair:**  
  Encerra o programa.

---

## Observações

- O arquivo `clientes.mock.ts` é atualizado automaticamente com cada novo cliente inserido.
- O programa utiliza distância euclidiana para classificação e KNN.
- Os dados categóricos são convertidos para valores numéricos por meio de mapeamento interno.
- O centroide de cada cluster é recalculado usando a média dos atributos dos clientes presentes.

---
