import { type Anomalia, type Analise, type MediaTalhao } from './protocolo.ts';
import grpc, { Server, ServerCredentials, } from '@grpc/grpc-js';
import type { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

const portaServicoAnomalias = 3003;
const servico: string = 'localhost';
const anomaliasDef = loadSync('anomalias.proto')
const anomaliasProto = (grpc.loadPackageDefinition)(anomaliasDef).anomalias as any;

const limites: { [tipo: string]: { min: number; max: number } } = {
    'Umidade': { min: 50, max: 70 },
    'Temperatura': { min: 29, max: 35 },
    'Luminosidade': { min: 35, max: 65 }
};

function detectarAnomalias(mediaTalhao: MediaTalhao): Anomalia[] {
    const anomalias: Anomalia[] = [];
    for (const mediaSensor of mediaTalhao.mediasSensores ?? []) {
        const limite = limites[mediaSensor.tipo];
        if (!limite) continue;
        if (mediaSensor.media < limite.min || mediaSensor.media > limite.max) {
            anomalias.push({
                sensorId: mediaSensor.sensorId,
                tipo: mediaSensor.tipo,
                unidade: mediaSensor.unidade,
                media: mediaSensor.media
            });
        }
    }
    return anomalias;
}

const server = new Server();
server.addService(anomaliasProto.AnomaliasService.service, {
    calcularAnomalia: (call: ServerUnaryCall<MediaTalhao, Analise>, callback: sendUnaryData<Analise>) => {
        const mediaTalhao = call.request;
        const analise: Analise = {
            talhaoId: mediaTalhao.talhaoId,
            anomalias: detectarAnomalias(mediaTalhao)
        };
        callback(null, analise);
    }

});

server.bindAsync(`${servico}:${portaServicoAnomalias}`, ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Falha ao subir o servidor:', err.message);
        process.exit(1);
    }
    console.log(`Servidor rodando na porta ${port}`);
});
