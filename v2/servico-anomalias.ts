import * as net from "node:net";
import type { Buffer } from 'node:buffer';
import { type MediaSensor, type MediaTalhao, type Lote } from './protocolo.js';
import grpc, { Server, ServerCredentials, } from '@grpc/grpc-js';
import type { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

const portaServicoAnomalias = 3003;
const servico: string = 'localhost';
const anomaliasDef = loadSync('anomalias.proto')
const anomaliasProto = (grpc.loadPackageDefinition)(anomaliasDef).anomalias as any;

function detectarAnomalias(lotes: Lote[]): MediaSensor[] {
    const anomalias: MediaSensor[] = [];
    const sensoresMap: { [key: number]: { soma: number; count: number; tipo: string; unidade: string } } = {};
    for (const lote of lotes) {
        for (const leitura of lote.leituras) {
            if (!sensoresMap[leitura.sensorId]) {
                sensoresMap[leitura.sensorId] = { soma: 0, count: 0, tipo: leitura.tipo, unidade: leitura.unidade };
            }
            sensoresMap[leitura.sensorId]!.soma += leitura.valores.reduce((acc, val) => acc + val, 0);
            sensoresMap[leitura.sensorId]!.count++;
        }
    }
    for (const sensorId in sensoresMap) {
        const { soma, count, tipo, unidade } = sensoresMap[sensorId]!;
        const media = soma / count;
        if (media < 10 || media > 90) { 
            anomalias.push({
                sensorId: parseInt(sensorId),
                tipo,
                unidade,
                media
            });
        }
    }
    return anomalias;
}

const server = new Server();
server.addService(anomaliasProto.AnomaliasService.service, {
    detectarAnomalias: (call: ServerUnaryCall<Lote, MediaTalhao>, callback: sendUnaryData<MediaTalhao>) => {
        const lote = call.request;
        const mediaTalhao: MediaTalhao = {
            talhaoId: lote.talhaoId,
            mediasSensores: detectarAnomalias([lote])
        };
        callback(null, mediaTalhao);
    }

});


server.bindAsync(`${servico}:${portaServicoAnomalias}`, ServerCredentials.createInsecure(), (err, port) => {