import {Sensor} from './sensor.ts';
import {Talhao} from './talhao.ts';
import {Conexao, type Leitura, type Lote} from './protocolo.ts';

const gateway = 'localhost';
const porta = 3000;

const sensores: Sensor[] = [
    new Sensor(1, "Sensor de Umidade", "Umidade", "Percentagem", 30, 90),
    new Sensor(2, "Sensor de Temperatura", "Temperatura", "Graus Celsius", 24, 40),
    new Sensor(3, "Sensor de Luminosidade", "Luminosidade", "Lux", 0, 100)
];

const talhoes: Talhao[] = [
    new Talhao(1, "Talhão 1", sensores)
]

const conexao = new Conexao(gateway, porta);
conexao.conectar();

let fila:Leitura[] = [];
let lote: Lote;
let contador = 0;

setInterval(() => {
    for (const talhao of talhoes) {
        talhao.sensores.map(sensor => {
            fila.push({
                sensorId: sensor.id,
                tipo: sensor.tipo,
                unidade: sensor.unidade,
                valores: [sensor.lerValor()]
            });
        });
    }
}, 1000);

setInterval(() => {
    if (fila.length > 0) {
        for (const talhao of talhoes) {
            contador++;
            lote = {
                id: contador,
                talhaoId: talhao.id,
                leituras: fila,
                timestamp: new Date().toISOString()
            };
            conexao.enviar(lote);
        }
        fila = [];
    }
}, 5000);
