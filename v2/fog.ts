import {Conexao, type Mensagem, type Pedido} from './protocolo.ts';
import grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

const gateway = 'localhost';
const portaGateway = 3001;
const servicoAnomalias = 'localhost';
const portaServicoAnomalias = 3003;

const anomaliasDef = loadSync('anomalias.proto')
const anomaliasProto = (grpc.loadPackageDefinition)(anomaliasDef).anomalias as any;

const client = new anomaliasProto.AnomaliasService(servicoAnomalias + ':' + portaServicoAnomalias, (grpc.credentials).createInsecure());

const conexao = new Conexao(gateway, portaGateway);
conexao.conectar((mensagem: Mensagem) => {
    if(!('mediasSensores' in mensagem)) return;
    console.log(`Mensagem recebida do gateway: ${JSON.stringify(mensagem)}`);
    for (const mediaSensor of mensagem.mediasSensores) {
        console.log(`Média do sensor ${mediaSensor.sensorId} (${mediaSensor.tipo}): ${mediaSensor.media} ${mediaSensor.unidade}`);
    }
    client.calcularAnomalia(mensagem, (err: grpc.ServiceError | null, response: any) => {
        if (err) {
            console.error(`Erro ao calcular anomalias: ${err.message}`);
            return;
        }
        console.log(`Anomalias calculadas recebidas do serviço: ${JSON.stringify(response)}`);
        for (const anomalia of response.anomalias ?? []) {
            console.log(`Anomalia detectada no sensor ${anomalia.sensorId} (${anomalia.tipo}): ${anomalia.media} ${anomalia.unidade}`);
        }
    });
})

setInterval(() => {
    const pedido: Pedido = {pedido: 'leituras'};
    console.log(`Enviando pedido de leituras para o gateway: ${JSON.stringify(pedido)}`);
    conexao.enviar(pedido);
}, 5000);