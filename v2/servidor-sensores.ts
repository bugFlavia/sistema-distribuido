import {Sensor} from './sensor.ts';
import {Talhao} from './talhao.ts';
import {Conexao, enviar, receber, type Leitura, type Lote, type Mensagem} from './protocolo.ts';
import * as net from 'node:net';
import { Buffer } from 'node:buffer';

const porta: number = 3000;
const servico: string = 'localhost';

const sensores: Sensor[] = [
    new Sensor(1, "Sensor de Umidade", "Umidade", "Percentagem", 30, 90),
    new Sensor(2, "Sensor de Temperatura", "Temperatura", "Graus Celsius", 24, 40),
    new Sensor(3, "Sensor de Luminosidade", "Luminosidade", "Lux", 0, 100)
];

const sensores_novos: Sensor[] = [
    new Sensor(1, "Sensor de Umidade", "Umidade", "Percentagem", 30, 90),
    new Sensor(2, "Sensor de Temperatura", "Temperatura", "Graus Celsius", 24, 40),
    new Sensor(3, "Sensor de Luminosidade", "Luminosidade", "Lux", 0, 100)
];

const talhoes: Talhao[] = [
    new Talhao(1, "Talhão 1", sensores),
    new Talhao(2, "Talhão 2", sensores_novos)
]

const filas = new Map<number, Leitura[]>();
let contador = 0;

setInterval(() => {
    for (const talhao of talhoes) {
        if (!filas.has(talhao.id)) filas.set(talhao.id, []);
        for (const sensor of talhao.sensores) {
            filas.get(talhao.id)!.push({
                talhaoId: talhao.id,
                sensorId: sensor.id,
                tipo: sensor.tipo,
                unidade: sensor.unidade,
                valores: [sensor.lerValor()]
            });
        }
    }
}, 1000);

const server: net.Server = net.createServer((socket: net.Socket) => {
    socket.on('data', (dados: Buffer) => {
        for (const linha of dados.toString().split('\n')) {
            if (!linha) continue;
            const mensagemRecebida: Mensagem = receber(linha);
            if(!('pedido' in mensagemRecebida)) continue;
            for (const [talhaoId, leituras] of filas) {
                if (leituras.length === 0) continue;
                contador++;
                const lote: Lote = {
                    id: contador,
                    talhaoId,
                    leituras,
                    timestamp: new Date().toISOString()
                };
                enviar(socket, lote);
            }
            filas.clear();
        }
    });
    socket.on('error', (err: Error) => {
        console.error(`Erro no socket: ${err.message}`);
    })
});

server.listen(porta, servico, () => {
    console.log(`Servidor escutando em ${servico}:${porta}`);
});