import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interfaces';
import { NewMessageDto } from './dto/new-message.dto';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesWsService: MessagesWsService
    ) {
  }
  
  async handleConnection(client: Socket) {
    console.log('cliente conectado assafs', client.id);
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token)
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    console.log(payload);
    /*client.join('ventas');
    client.join(client.id);
    client.join(user.email);
    this.wss.to('ventas').emit('')*/
    this.wss.emit('clients-update', this.messagesWsService.getConnectedClients())
  }

  handleDisconnect(client: Socket) {
    console.log('cliente desconectado', client.id);
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-update', this.messagesWsService.getConnectedClients())
  }

  // message-form-client
  @SubscribeMessage('message-form-client')
  async handleMessageFromClient(client:Socket, payload: NewMessageDto) {
    console.log(client.id, payload);
    // unicamente emite al cliente que envia el mensaje
    /*client.emit('message-from-server', {
      fullName: 'soy yo',
      message: payload.message || 'no message !!!'
    });*/

    // emitir a todo menos al cliente inicial (el que envio este mensaje)
    /*client.broadcast.emit('message-from-server', {
      fullName: 'soy yo',
      message: payload.message || 'no message !!!'
    });*/

    // todos los clientes
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no message !!!'
    });
  }


}
