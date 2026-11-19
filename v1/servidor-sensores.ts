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

const sensores_novos: Sensor[] = [
    new Sensor(1, "Sensor de Umidade", "Umidade", "Percentagem", 30, 90),
    new Sensor(2, "Sensor de Temperatura", "Temperatura", "Graus Celsius", 24, 40),
    new Sensor(3, "Sensor de Luminosidade", "Luminosidade", "Lux", 0, 100)
];

const talhoes: Talhao[] = [
    new Talhao(1, "Talhão 1", sensores),
    new Talhao(2, "Talhão 2", sensores_novos)
]

const conexao = new Conexao(gateway, porta);
conexao.conectar();

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

setInterval(() => {
    for (const [talhaoId, leituras] of filas) {
        if (leituras.length === 0) continue;
        contador++;
        const lote: Lote = {
            id: contador,
            talhaoId,
            leituras,
            timestamp: new Date().toISOString()
        };
        conexao.enviar(lote);
    }
    filas.clear();
}, 5000);