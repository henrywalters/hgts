import { Color, Vector3 } from "three";
import { OrthographicCamera, PerspectiveCamera } from "../../common/components/camera";
import { MeshPrimitive, MeshPrimitiveType } from "../../common/components/mesh";
import { Transform } from "../../common/components/transform";
import { EntityEvents } from "../../core/events";
import { IGame } from "../../core/interfaces/game";
import { Axes } from "../../core/interfaces/input";
import { Scene } from "../../core/scene";
import { Client } from "../../net/client";
import { Server } from "../../net/server";
import { WebSocket } from "ws";
import { ClientMessages, ClientMessageTypes, PlayerConnect, PlayerConnected, PlayerJoined, PlayerLeft, PlayerMove, PlayerMoved, ServerMessages, ServerMessageTypes } from "./messages";
import { Player, PlayerStatus } from "./player";
import { NetEvents } from "../../net/interfaces/net";

export class ServerRuntime extends Scene {

    private players: Map<WebSocket, Player> = new Map();

    public onUpdate(dt: number): void {
        // console.log(`Delta Time = ${dt}`);

        this.game.server.flushEvents((event) => {
            if (event.type === NetEvents.Disconnected) {
                if (!this.players.has(event.socket!)) return;
                const entityId = this.players.get(event.socket!)!.entity.id;
                console.log(`Player ${entityId} disconnected`)
                this.removeEntity(entityId);
                this.players.delete(event.socket!);

                const left = new PlayerLeft();
                left.serverId = entityId;

                this.game.server.emit(ServerMessageTypes.PlayerLeft, left);
            }
        })

        this.game.server.flushMessages((message) => {
            if (message.message.type === ClientMessageTypes.Connect) {

                const entity = this.addEntity("Player");

                this.game.currentScene!.entityEvents.emit({
                    type: EntityEvents.Create,
                    entity,
                })

                entity.addComponent(Transform);
                const player = entity.addComponent(Player);
                player.color = new Color(Math.random(), Math.random(), Math.random());

                this.players.set(message.socket!, player);

                const reply = new PlayerConnected();
                reply.color = player.color;
                reply.serverId = entity.id;
                
                console.log(`Player ${reply.serverId} connected`);
                message.socket!.send(ServerMessages.write(reply));

                for (const client of this.game.server.clients) {

                    if (client === message.socket!) continue;

                    if (!this.players.has(client)) continue;

                    const other = this.players.get(client)!;

                    const joined = new PlayerJoined();
                    joined.serverId = other.entity.id;
                    joined.color = other.color;
                    joined.position = other.entity.transform.position;
                    message.socket!.send(ServerMessages.write(joined)); 
                }

                const joined = new PlayerJoined();
                joined.position = entity.transform.position;
                joined.serverId = reply.serverId;
                joined.color = reply.color;

                this.game.server.emit(ServerMessageTypes.PlayerJoined, joined, [message.socket!]);
            } else if (message.message.type === ClientMessageTypes.Move) {
                const move = message.message as PlayerMove;

                console.log(move);

                const entityId = this.players.get(message.socket!)!.entity.id;

                this.getEntity(entityId)?.transform.position.copy(move.position);

                const reply = new PlayerMoved();
                reply.serverId = entityId;
                reply.position = move.position;
                for (const socket of this.players.keys()) {
                    socket.send(ServerMessages.write(reply));
                }
            }
        });
    }
}

export class ClientRuntime extends Scene {

    private playerStatus: PlayerStatus = PlayerStatus.Disconnected;

    private serverId: number = -1;

    public onUpdate(dt: number): void {

        if (!this.game.client.connected) return;

        this.game.client.flushMessages((message) => {

            if (message.message.type === ServerMessageTypes.Connected) {

                this.playerStatus = PlayerStatus.Connected;

                const connected = message.message as PlayerConnected;

                console.log(connected);

                const entity = this.addEntity("Player", connected.serverId);

                this.game.currentScene!.entityEvents.emit({
                    type: EntityEvents.Create,
                    entity,
                })

                this.serverId = connected.serverId;

                entity.addComponent(Transform);
                const player = entity.addComponent(Player);
                const mesh = entity.addComponent(MeshPrimitive);

                mesh.type = MeshPrimitiveType.Cube;
                mesh.color = connected.color;
                mesh.width = 50;
                mesh.height = 50;

                mesh.notifyUpdate();
                player.notifyUpdate();
            } else if (message.message.type === ServerMessageTypes.PlayerJoined) {

                const joined = (message.message as PlayerJoined);

                console.log(message.message);

                const entity = this.addEntity("Player", joined.serverId);

                this.game.currentScene!.entityEvents.emit({
                    type: EntityEvents.Create,
                    entity,
                })

                entity.addComponent(Transform);
                entity.transform.position = joined.position;
                const player = entity.addComponent(Player);
                const mesh = entity.addComponent(MeshPrimitive);

                mesh.type = MeshPrimitiveType.Cube;
                mesh.color = joined.color;
                mesh.width = 50;
                mesh.height = 50;

                mesh.notifyUpdate();
                player.notifyUpdate();
            } else if (message.message.type === ServerMessageTypes.Moved) {
                const moved = (message.message as PlayerMoved);
                this.components.forEach(Player, (player) => { 
                    if (moved.serverId === player.entity.id) {
                        // console.log(moved.position);
                        player.entity.transform.position.copy(moved.position);
                    }
                });
            } else if (message.message.type === ServerMessageTypes.PlayerLeft) {
                const left = message.message as PlayerLeft;
                this.removeEntity(left.serverId);
                console.log(left);
            }
        })

        if (this.playerStatus === PlayerStatus.Disconnected) {
            this.game.client.socket.send(ClientMessages.write(new PlayerConnect()));
            this.playerStatus = PlayerStatus.Connecting;
        }

        this.components.forEach(Player, (player) => {
            if (player.entity.id === this.serverId) {
                const direction = this.game.input.getAxis(Axes.KeyboardWASD);

                if (direction.x === 0 && direction.y === 0) return;

                direction.normalize();
                direction.multiplyScalar(dt * player.speed);

                player.entity.transform.position.x += direction.x;
                player.entity.transform.position.y += direction.y;

                const message = new PlayerMove();
                message.position = player.entity.transform.position;
                
                this.game.client.socket.send(ClientMessages.write(message));

                (player.entity.transform as Transform).notifyUpdate();
            }
        })
    }
}