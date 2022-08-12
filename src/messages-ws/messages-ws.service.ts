import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnnectedClients {
    [id: string]: {
        socket: Socket,
        user: User,
        //desktop: boolean,
        //mobile: boolean,
    }
}
@Injectable()
export class MessagesWsService {
    private connectedClients: ConnnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async registerClient(client: Socket, userId: string) {

        const user = await this.userRepository.findOneBy({id: userId});
        if (!user) { throw Error('not found')}
        if (!user.isActive) { throw Error('not Active user')}

        this.checkUserConnnettion(user);

        this.connectedClients[client.id] = {
            socket: client,
            user: user
        };
    }
    removeClient(clientId: string) {
        delete this.connectedClients[clientId];
    }
    getConnectedClients() : string[] {
        return Object.keys(this.connectedClients);
    }
    getUserFullName(socketId: string) {
        return this.connectedClients[socketId].user.fullName;
    }
    private checkUserConnnettion(user: User) {
        for (const clientId of Object.keys(this.connectedClients)) {
            const connectClient = this.connectedClients[clientId];
            if (connectClient.user.id == user.id) {
                connectClient.socket.disconnect();
                break;
            }
        }
    }
}
