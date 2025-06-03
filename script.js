let alunos = [];
let clusters = [];
let centroides = [];
let iteracao = 0;

class Aluno {
    constructor(nome, notaMatematica, notaPortugues) {
        this.nome = nome;
        this.notaMatematica = notaMatematica;
        this.notaPortugues = notaPortugues;
        this.cluster = -1;
    }
}

function gerarDados() {
    const nomes = [
        'Ana Silva', 'Bruno Costa', 'Carla Santos', 'Daniel Oliveira', 'Elena Ferreira',
        'Felipe Lima', 'Gabriela Souza', 'Henrique Alves', 'Isabela Rocha', 'João Pereira',
        'Larissa Dias', 'Mateus Ribeiro', 'Natália Castro', 'Pedro Martins', 'Rafaela Gomes',
        'Samuel Torres', 'Tatiana Cardoso', 'Victor Barbosa', 'Yasmin Pinto', 'Zeca Moreira'
    ];

    alunos = [];
    for (let i = 0; i < 20; i++) {
        const nome = nomes[i];
        const notaMatematica = Math.round((Math.random() * 10) * 10) / 10;
        const notaPortugues = Math.round((Math.random() * 10) * 10) / 10;
        alunos.push(new Aluno(nome, notaMatematica, notaPortugues));
    }

    resetar();
    console.log('Novos alunos gerados:', alunos);
}

function calcularDistancia(ponto1, ponto2) {
    const dx = ponto1.notaMatematica - ponto2.notaMatematica;
    const dy = ponto1.notaPortugues - ponto2.notaPortugues;
    return Math.sqrt(dx * dx + dy * dy);
}

function inicializarCentroides() {
    centroides = [];
    
    centroides.push({
        notaMatematica: Math.round((Math.random() * 10) * 10) / 10,
        notaPortugues: Math.round((Math.random() * 10) * 10) / 10
    });

    centroides.push({
        notaMatematica: Math.round((Math.random() * 10) * 10) / 10,
        notaPortugues: Math.round((Math.random() * 10) * 10) / 10
    });

    console.log('Centroides iniciais:', centroides);
}

function atribuirClusters() {
    let mudancas = false;

    for (let aluno of alunos) {
        let menorDistancia = Infinity;
        let clusterMaisProximo = -1;

        for (let i = 0; i < centroides.length; i++) {
            const distancia = calcularDistancia(aluno, centroides[i]);
            
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                clusterMaisProximo = i;
            }
        }

        if (aluno.cluster !== clusterMaisProximo) {
            mudancas = true;
            aluno.cluster = clusterMaisProximo;
        }
    }

    return mudancas;
}

function recalcularCentroides() {
    for (let i = 0; i < centroides.length; i++) {
        const alunosDoCluster = alunos.filter(aluno => aluno.cluster === i);
        
        if (alunosDoCluster.length > 0) {
            const somaMatematica = alunosDoCluster.reduce((soma, aluno) => soma + aluno.notaMatematica, 0);
            const somaPortugues = alunosDoCluster.reduce((soma, aluno) => soma + aluno.notaPortugues, 0);
            
            centroides[i].notaMatematica = Math.round((somaMatematica / alunosDoCluster.length) * 10) / 10;
            centroides[i].notaPortugues = Math.round((somaPortugues / alunosDoCluster.length) * 10) / 10;
        }
    }
}

function executarClustering() {
    if (alunos.length === 0) {
        alert('Primeiro gere os dados dos alunos!');
        return;
    }

    inicializarCentroides();
    iteracao = 0;
    let maxIteracoes = 50;
    let convergiu = false;

    console.log('Iniciando clustering...');

    while (!convergiu && iteracao < maxIteracoes) {
        iteracao++;
        console.log(`Iteração ${iteracao}`);

        const houveMudancas = atribuirClusters();
        
        recalcularCentroides();
        
        if (!houveMudancas) {
            convergiu = true;
            console.log(`Convergiu na iteração ${iteracao}`);
        }

        console.log('Centroides atualizados:', centroides);
    }

    organizarClusters();
    mostrarResultados();
}

function organizarClusters() {
    clusters = [[], []];
    
    for (let aluno of alunos) {
        if (aluno.cluster === 0) {
            clusters[0].push(aluno);
        } else if (aluno.cluster === 1) {
            clusters[1].push(aluno);
        }
    }
}

function mostrarResultados() {
    const resultsDiv = document.getElementById('results');
    const iterationInfo = document.getElementById('iterationInfo');
    
    iterationInfo.innerHTML = `Clustering concluído em ${iteracao} iterações`;
    
    let html = '';
    
    for (let i = 0; i < 2; i++) {
        html += `
            <div class="cluster cluster${i + 1}">
                <h3>Cluster ${i + 1}</h3>
                <div class="centroid">
                    <strong>Centroide:</strong><br>
                    Matemática: ${centroides[i].notaMatematica}<br>
                    Português: ${centroides[i].notaPortugues}
                </div>
                <div><strong>Alunos (${clusters[i].length}):</strong></div>
        `;
        
        for (let aluno of clusters[i]) {
            html += `
                <div class="student">
                    <strong>${aluno.nome}</strong><br>
                    Mat: ${aluno.notaMatematica} | Port: ${aluno.notaPortugues}
                </div>
            `;
        }
        
        html += '</div>';
    }
    
    resultsDiv.innerHTML = html;
}

function resetar() {
    clusters = [];
    centroides = [];
    iteracao = 0;
    
    for (let aluno of alunos) {
        aluno.cluster = -1;
    }
    
    document.getElementById('results').innerHTML = '';
    document.getElementById('iterationInfo').innerHTML = '';
}

gerarDados();
