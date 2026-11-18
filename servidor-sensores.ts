import type { Buffer } from 'node:buffer';
import * as net from 'node:net';
import { Produto } from './produto.ts';

const host: string = process.env.SERVER_HOST ?? '127.0.0.1';

const client: net.Socket = net.createConnection({ 
    host: host,
    port: 3000
});

client.on('connect', () => {
    console.log(`Conectado ao servidor ${host}:3000`);
});

client.on('data', (mensagem: Buffer) => {
    console.log(`Mensagem recebida do servidor: ${mensagem.toString('utf8')}`);
});

client.on('error', (erro: Error) => {
    console.error(`Erro de conexão: ${erro.message}`);
});

const produto = new Produto("Macbook Pro", 25000);
const titulo = produto.getTitulo();
const preco = produto.getPreco();

client.write(JSON.stringify({ titulo, preco }), () => {
    client.end();
});

client.on('close', () => {
    console.log('Conexão encerrada pelo servidor');
});

