import {Sensor} from './sensor';
import {Talhao} from './talhao.ts';
import {Conexao, type Leitura, type Lote} from './protocolo.ts';

const sensores: Sensor[] = [
    new Sensor(1, "Sensor de Umidade", "Umidade", "Percentagem", 30, 90),
    new Sensor(2, "Sensor de Temperatura", "Temperatura", "Graus Celsius", 24, 40),
    new Sensor(3, "Sensor de Luminosidade", "Luminosidade", "Lux", 0, 100)
];

const talhoes: Talhao[] = [
    new Talhao(1, "Talhão 1", sensores)
]

const conexao = new Conexao('localhost', 3000);
const socket = conexao.conectar();

let fila:Leitura[] = [];

setInterval(() => {
    for (const talhao of talhoes) {
        for (const sensor of talhao.sensores) {
            fila.push({
                talhaoId: talhao.id,
                sensorId: sensor.id,
                tipo: sensor.tipo,
                unidade: sensor.unidade,
                valores: [sensor.lerValor()]
            });
        }
    }
}, 1000);

setInterval(() => {
    if (fila.length > 0) {
        const leituras = [...fila];
        fila = [];
        for (const leitura of leituras) {
            const mensagem = {
                talhaoId: leitura.talhaoId,
                sensorId: leitura.sensorId,
                tipo: leitura.tipo,
                unidade: leitura.unidade,
                valores: leitura.valores
            };
            conexao.enviar(mensagem);
        }
    }
}, 5000);


