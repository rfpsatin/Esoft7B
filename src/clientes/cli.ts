import * as readline from 'readline';
import { Cluster, Cliente } from './cluster';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const cluster = new Cluster();

function menu() {
    console.log('\n--- MENU ---');
    console.log('1. Adicionar cliente');
    console.log('2. Listar clientes');
    console.log('3. Mostrar centroide');
    console.log('4. Mostrar extremos (distância ao centroide)');
    console.log('5. Executar KNN');
    console.log('6. Sair');
    rl.question('Escolha uma opção: ', (opcao) => {
        switch (opcao) {
            case '1':
                adicionarCliente();
                break;
            case '2':
                listarClientes();
                break;
            case '3':
                mostrarCentroide();
                break;
            case '4':
                mostrarExtremos();
                break;
            case '5':
                executarKNN();
                break;
            case '6':
                rl.close();
                break;
            default:
                menu();
        }
    });
}

function adicionarCliente() {
    rl.question('Formação educacional (fundamental/medio/superior): ', (formacaoEducacional) => {
        rl.question('Idade: ', (idade) => {
            rl.question('Estado (SP/RJ/MG/RS): ', (estado) => {
                rl.question('Região (sudeste/sul/norte/nordeste/centro-oeste): ', (regiao) => {
                    rl.question('Score Serasa: ', (scoreSerasa) => {
                        rl.question('Ticket Médio: ', (ticketMedio) => {
                            const cliente: Cliente = {
                                formacaoEducacional,
                                idade: Number(idade),
                                estado,
                                regiao,
                                scoreSerasa: Number(scoreSerasa),
                                ticketMedio: Number(ticketMedio),
                            };
                            cluster.adicionar(cliente);
                            console.log('Cliente adicionado!');
                            menu();
                        });
                    });
                });
            });
        });
    });
}

function listarClientes() {
    if (cluster.elementos.length === 0) {
        console.log('Nenhum cliente cadastrado.');
    } else {
        console.log('\n--- Lista de Clientes ---');
        cluster.elementos.forEach((c, i) => {
            console.log(`\nCliente #${i}`);
            console.log(`  Formação Educacional: ${c.formacaoEducacional}`);
            console.log(`  Idade: ${c.idade}`);
            console.log(`  Estado: ${c.estado}`);
            console.log(`  Região: ${c.regiao}`);
            console.log(`  Score Serasa: ${c.scoreSerasa}`);
            console.log(`  Ticket Médio: ${c.ticketMedio}`);
        });
        console.log('------------------------\n');
    }
    menu();
}

function mostrarCentroide() {
    if (cluster.centroide.length === 0) {
        console.log('Centroide não calculado (adicione clientes primeiro).');
    } else {
        console.log('\n--- Centroide ---');
        console.log(cluster.centroide.map((v, i) => `Atributo ${i + 1}: ${v.toFixed(2)}`).join('\n'));
        console.log('-----------------\n');
    }
    menu();
}

function mostrarExtremos() {
    if (cluster.elementos.length === 0) {
        console.log('Nenhum cliente cadastrado.');
        menu();
        return;
    }
    const extremos = cluster.extremos();
    console.log('\n--- Cliente mais distante do centroide ---');
    console.log(extremos[0].cliente);
    console.log('Distância:', extremos[0].distancia.toFixed(2));
    console.log('\n--- Cliente mais próximo do centroide ---');
    console.log(extremos[extremos.length - 1].cliente);
    console.log('Distância:', extremos[extremos.length - 1].distancia.toFixed(2));
    console.log('-----------------------------------------\n');
    menu();
}

function executarKNN() {
    if (cluster.elementos.length === 0) {
        console.log('Nenhum cliente cadastrado.');
        menu();
        return;
    }
    rl.question('Índice do cliente para comparar: ', (indice) => {
        const idx = Number(indice);
        if (isNaN(idx) || idx < 0 || idx >= cluster.elementos.length) {
            console.log('Índice inválido.');
            menu();
            return;
        }
        rl.question('Valor de K: ', (kStr) => {
            const k = Number(kStr);
            if (isNaN(k) || k <= 0) {
                console.log('Valor de K inválido.');
                menu();
                return;
            }
            const resultado = cluster.knn(cluster.elementos[idx], k);
            console.log(`\n--- Os ${k} mais próximos do cliente #${idx} ---`);
            resultado.forEach((r, i) => {
                console.log(`\nVizinho #${i + 1}`);
                console.log(r.cliente);
                console.log('Distância:', r.distancia.toFixed(2));
            });
            console.log('------------------------------------------\n');
            menu();
        });
    });
}

menu();