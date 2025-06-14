import * as readline from 'readline';
import { ClusterManager } from './cluster-manager';
import { Cliente } from './cluster';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const manager = new ClusterManager();

function menu() {
    console.log('\n--- MENU ---');
    console.log('1. Adicionar cliente');
    console.log('2. Mostrar centroides');
    console.log('3. Executar KNN');
    console.log('4. Sair');
    rl.question('Escolha uma opção: ', (opcao) => {
        switch (opcao) {
            case '1':
                adicionarCliente();
                break;
            case '2':
                manager.mostrarCentroides();
                menu();
                break;
            case '3':
                executarKNN();
                break;
            case '4':
                rl.close();
                break;
            default:
                menu();
        }
    });
}

function adicionarCliente() {
    rl.question('Formação educacional: ', (formacaoEducacional) => {
        rl.question('Idade: ', (idade) => {
            rl.question('Estado: ', (estado) => {
                rl.question('Região: ', (regiao) => {
                    rl.question('Score Serasa: ', (scoreSerasa) => {
                        rl.question('Ticket Médio: ', (ticketMedio) => {
                            manager.inserir({
                                formacaoEducacional,
                                idade: Number(idade),
                                estado,
                                regiao,
                                scoreSerasa: Number(scoreSerasa),
                                ticketMedio: Number(ticketMedio),
                            });
                            console.log('Cliente inserido no cluster mais próximo!');
                            menu();
                        });
                    });
                });
            });
        });
    });
}

function executarKNN() {
    rl.question('Idade: ', (idade) => {
        rl.question('Formação educacional: ', (formacaoEducacional) => {
            rl.question('Estado: ', (estado) => {
                rl.question('Região: ', (regiao) => {
                    rl.question('Score Serasa: ', (scoreSerasa) => {
                        rl.question('Ticket Médio: ', (ticketMedio) => {
                            rl.question('Valor de K: ', (kStr) => {
                                const cliente: Cliente = {
                                    formacaoEducacional,
                                    idade: Number(idade),
                                    estado,
                                    regiao,
                                    scoreSerasa: Number(scoreSerasa),
                                    ticketMedio: Number(ticketMedio),
                                };
                                const k = Number(kStr);
                                const vizinhos = manager.knn(cliente, k);
                                console.log(`\n${k} vizinhos mais próximos:`);
                                vizinhos.forEach((v, i) => {
                                    console.log(`\nVizinho #${i + 1} (Cluster ${v.cluster}):`);
                                    console.log(v.cliente);
                                    console.log('Distância:', v.distancia.toFixed(2));
                                });
                                menu();
                            });
                        });
                    });
                });
            });
        });
    });
}

menu();