import {Conexao, type Mensagem, type Pedido} from './protocolo.ts';

const gateway = 'localhost';
const portaGateway = 3001;

const conexao = new Conexao(gateway, portaGateway);
conexao.conectar((mensagem: Mensagem) => {
    if(!('mediasSensores' in mensagem)) return;
    console.log(`Mensagem recebida do gateway: ${JSON.stringify(mensagem)}`);
    for (const mediaSensor of mensagem.mediasSensores) {
        console.log(`Média do sensor ${mediaSensor.sensorId} (${mediaSensor.tipo}): ${mediaSensor.media} ${mediaSensor.unidade}`);
    }
})