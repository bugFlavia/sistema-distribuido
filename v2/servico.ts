import * as net from "node:net";
import type { Buffer } from 'node:buffer';
import { Conexao, enviar, type Mensagem, type MediaSensor, type MediaTalhao, type Leitura, type Lote, receber } from './protocolo.ts';
import grpc, { Server, ServerCredentials, } from '@grpc/grpc-js';
import type { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

const portaServico = 3002;
const servico: string = 'localhost';
const mediaDef = loadSync('media.proto')
const mediaProto = (grpc.loadPackageDefinition)(mediaDef).media as any;

function calcularMediaSensores(lotes: Lote[]): MediaSensor[] {
    const medias: MediaSensor[] = [];
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
        medias.push({
            sensorId: parseInt(sensorId),
            tipo,
            unidade,
            media: soma / count
        });
    }
    return medias;
}

const medias : MediaTalhao[] = [];



const server = new Server();
server.addService(mediaProto.MediaService.service, {
    calcularMedia: (call: ServerUnaryCall<Lote, MediaTalhao>, callback: sendUnaryData<MediaTalhao>) => {
        const lote = call.request;
        const mediaTalhao: MediaTalhao = {
            talhaoId: lote.talhaoId,
            mediasSensores: calcularMediaSensores([lote])
        };
        callback(null, mediaTalhao);
    }

});

server.bindAsync(`${servico}:${portaServico}`, ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Falha ao subir o servidor:', err.message);
        process.exit(1);
    }
    console.log(`Servidor rodando na porta ${port}`);
});

