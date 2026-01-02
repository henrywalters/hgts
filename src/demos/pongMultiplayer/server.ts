import { Vector2 } from "three";
import { IManifest } from "../../core/interfaces/manifest";
import { Scene } from "../../core/scene";
import { ClientMessages, GameOver, GameReady, GameStart, GameUpdate, JoinGameReply, JoinGameRequest, PlayerInput, PlayerReady, PongEvents, ServerMessages } from "./messages";
import { WebSocket } from "ws";
import { BALL_SIZE, BALL_SPEED_UP, BALL_START_SPEED, GAME_SIZE, MAX_SCORE, PADDLE_OFFSET, PADDLE_SIZE, PADDLE_SPEED } from "./constants";
import { clamp } from "three/src/math/MathUtils.js";
import { IAABB, sweepAABB } from "../../utils/math";
import { NetEvents } from "../../net/interfaces/net";
import { QueuedMessage } from "../../net/interfaces/messages";

interface PongPlayer {
    socket: WebSocket;
    id: number;
    y: number;
    score: number;
}

interface PongLobby {
    id: number;
    socket: WebSocket;
}

interface PongBall {
    direction: Vector2;
    position: Vector2;
    speed: number;
}

export interface PongGame {
    tick: number;
    ball: PongBall;
    players: PongPlayer[];
    ready: boolean[];
    serving: number;
    launched: boolean;
}

export class PongServerRuntime extends Scene {

    static PLAYER_ID = 0;

    // private server = new Server("localhost", 4200, ServerMessages, ClientMessages);

    private games: Set<PongGame> = new Set();
    private socketToGames: Map<WebSocket, PongGame> = new Map();
    private lobby: PongLobby[] = [];

    private gameReady(game: PongGame) {

        game.ball.position = new Vector2();
        game.players[0].y = 0;
        game.players[1].y = 0;

        for (const player of game.players) {
            const ready = new GameReady();
            ready.player1Score = game.players[0].score;
            ready.player2Score = game.players[1].score;
            ready.servingPlayer = game.serving;
            player.socket.send(ServerMessages.write(ready));
        }
    }

    private gameOver(game: PongGame) {
        for (const player of game.players) {
            const gameOver = new GameOver();
            if (player.score === MAX_SCORE) {
                gameOver.message = "YOU WON THE GAME!";
            } else {
                gameOver.message = "YOU LOST THE GAME";
            }
            player.socket.send(ServerMessages.write(gameOver));
            this.socketToGames.delete(player.socket);
        }
        this.games.delete(game);

        console.log(`Active Games = ${this.games.size}`);
    }

    private launchBall(game: PongGame) {
        game.launched = true;
        const y = Math.random() * GAME_SIZE.y - GAME_SIZE.y / 2;
        game.ball.direction.setX(GAME_SIZE.x / 2 * (game.serving == 0 ? 1 : -1));
        game.ball.direction.setY(y);
        game.ball.position = new Vector2();
        game.ball.direction.normalize();
        game.ball.speed = BALL_START_SPEED;

        const start = ServerMessages.write(new GameStart());

        for (const player of game.players) {
            player.socket.send(start);
        }
    }

    private updatePong(game: PongGame, dt: number) {
        if (game.launched) {
            const dir = new Vector2();
            dir.copy(game.ball.direction);
            dir.multiplyScalar(game.ball.speed * dt);

            const left: IAABB = {
                min: new Vector2(-GAME_SIZE.x / 2 - BALL_SIZE, -GAME_SIZE.y / 2),
                max: new Vector2(-GAME_SIZE.x / 2 + BALL_SIZE, GAME_SIZE.y / 2)
            };

            const right: IAABB = {
                min: new Vector2(GAME_SIZE.x / 2 - BALL_SIZE, -GAME_SIZE.y / 2),
                max: new Vector2(GAME_SIZE.x / 2 + BALL_SIZE, GAME_SIZE.y / 2)
            };

            const top: IAABB = {
                min: new Vector2(-GAME_SIZE.x / 2, -GAME_SIZE.y / 2 - BALL_SIZE),
                max: new Vector2(GAME_SIZE.x / 2, -GAME_SIZE.y / 2 + BALL_SIZE)
            };

            const bot: IAABB = {
                min: new Vector2(-GAME_SIZE.x / 2, GAME_SIZE.y / 2 - BALL_SIZE),
                max: new Vector2(GAME_SIZE.x / 2, GAME_SIZE.y / 2 + BALL_SIZE)
            };

            const player1Rect: IAABB = {
                min: new Vector2(-PADDLE_OFFSET - PADDLE_SIZE.x / 2 - BALL_SIZE, game.players[0].y - PADDLE_SIZE.y / 2 - BALL_SIZE),
                max: new Vector2(-PADDLE_OFFSET + PADDLE_SIZE.x / 2 + BALL_SIZE, game.players[0].y + PADDLE_SIZE.y / 2 + BALL_SIZE)
            };

            const player2Rect: IAABB = {
                min: new Vector2(PADDLE_OFFSET - PADDLE_SIZE.x / 2 - BALL_SIZE, game.players[1].y - PADDLE_SIZE.y / 2 - BALL_SIZE),
                max: new Vector2(PADDLE_OFFSET + PADDLE_SIZE.x / 2 + BALL_SIZE, game.players[1].y + PADDLE_SIZE.y / 2 + BALL_SIZE)
            };

            const reflectX = () => {
                game.ball.direction.setX(game.ball.direction.x * -1);
                game.ball.speed += BALL_SPEED_UP;
            };

            const reflectY = () => {
                game.ball.direction.setY(game.ball.direction.y * -1);
                // game.ball.speed += BALL_SPEED_UP;
            }

            // const game.ball.position = new Vector2(game.ball.position.x, game.ball.position.y);
            const newPos = new Vector2(game.ball.position.x + dir.x, game.ball.position.y + dir.y);
    
            const leftHit = sweepAABB(game.ball.position, newPos, left);
            const rightHit = sweepAABB(game.ball.position, newPos, right);
            const topHit = sweepAABB(game.ball.position, newPos, top);
            const botHit = sweepAABB(game.ball.position, newPos, bot);
    
            const playerHit = sweepAABB(game.ball.position, newPos, player1Rect);
            const computerHit = sweepAABB(game.ball.position, newPos, player2Rect);
    
            if (leftHit) {
                game.players[1].score++;
                game.serving = 1;
                game.launched = false;
                if (game.players[1].score === MAX_SCORE) {
                    this.gameOver(game);
                } else {
                    this.gameReady(game);
                }
                
                //game.ball.position.lerp(new Vector2(newPos.x, newPos.y), leftHit);
                //reflectX();
            } else if (rightHit) {
                game.players[0].score++;
                game.serving = 0;
                game.launched = false;
                if (game.players[0].score === MAX_SCORE) {
                    this.gameOver(game);
                } else {
                    this.gameReady(game);
                }
                //game.ball.position.lerp(new Vector2(newPos.x, newPos.y), rightHit);
                //reflectX();
            } else if (topHit) {
                game.ball.position.lerp(new Vector2(newPos.x, newPos.y), topHit);
                reflectY();
            } else if (botHit) {
                game.ball.position.lerp(new Vector2(newPos.x, newPos.y), botHit);
                reflectY();
            } else if (playerHit) {
                game.ball.position.lerp(new Vector2(newPos.x, newPos.y), playerHit);
                reflectX();
            } else if (computerHit) {
                game.ball.position.lerp(new Vector2(newPos.x, newPos.y), computerHit);
                reflectX();
            }  else {
                game.ball.position.add(dir);
            }
        }
    }

    private playerJoin(message: QueuedMessage<JoinGameRequest>) {
        const player: PongLobby = {
            id: PongServerRuntime.PLAYER_ID,
            socket: message.socket!,
        };

        PongServerRuntime.PLAYER_ID++;

        if (this.lobby.length > 0) {
            const opponent = this.lobby.shift()!;
            const game: PongGame = {
                tick: 0,
                launched: false,
                ready: [false, false],
                serving: 0,
                players: [{
                    ...opponent,
                    y: 0,
                    score: 0,
                },{
                    ...player,
                    y: 0,
                    score: 0,
                }],
                ball: {
                    direction: new Vector2(),
                    speed: 100,
                    position: new Vector2(),
                }
            }

            this.games.add(game);

            console.log(`Active Games = ${this.games.size}`);

            this.socketToGames.set(player.socket, game);
            this.socketToGames.set(opponent.socket, game);

            const message1 = new JoinGameReply();
            message1.playerId = opponent.id;
            message1.opponentId = player.id;
            message1.isPlayerOne = true;

            const message2 = new JoinGameReply();
            message2.playerId = player.id;
            message2.opponentId = opponent.id;
            message2.isPlayerOne = false;

            opponent.socket.send(ServerMessages.write(message1));
            player.socket.send(ServerMessages.write(message2));
        } else {
            this.lobby.push(player);
        }
    }

    private playerReady(message: QueuedMessage<PlayerReady>) {
        const game = this.socketToGames.get(message.socket!);

        if (!game) {
            console.error("Socket does not point to any games saved");
            return;
        }

        const playerIndex = game.players[0].socket === message.socket ? 0 : 1;

        game.ready[playerIndex] = true;

        let ready = true;

        for (const playerReady of game.ready) {
            if (!playerReady) {
                ready = false;
                break;
            }
        }

        if (ready) {
            this.gameReady(game);
        }
    }

    private playerInput(message: QueuedMessage<PlayerInput>, dt: number) {
        const game = this.socketToGames.get(message.socket!);
        if (!game) return;
        const playerIdx = game.players[0].socket === message.socket ? 0 : 1;
        
        if (!game.launched) {
            if (game.serving === playerIdx && message.message.launch) {
                this.launchBall(game);
            }
        }

        game.players[playerIdx].y += PADDLE_SPEED * dt * (message.message.down ? -1.0 : (message.message.up ? 1.0: 0));
        game.players[playerIdx].y = clamp(game.players[playerIdx].y, -GAME_SIZE.y / 2 + PADDLE_SIZE.y / 2, GAME_SIZE.y / 2 - PADDLE_SIZE.y / 2); 
    }

    public onUpdate(dt: number): void {
        this.game.server.flushEvents((event) => {
            if (event.type === NetEvents.Disconnected) {
                if (this.socketToGames.has(event.socket!)) {
                    const gameOver = new GameOver();
                    gameOver.message = "OTHER PLAYER DISCONNECTED";
                    const game = this.socketToGames.get(event.socket!)!;
                    for (const player of game.players) {
                        if (player.socket !== event.socket!) {
                            player.socket.send(ServerMessages.write(gameOver));
                        }
                        this.socketToGames.delete(player.socket);
                    }
                    this.games.delete(game);
                    console.log(`Active Games = ${this.games.size}`);
                }
            }
        });

        const accepted = new Set();

        this.game.server.flushMessages((message) => {
            switch(message.message.type) {
                case PongEvents.JoinGameRequest:
                    this.playerJoin(message);
                    break;
                case PongEvents.PlayerReady:
                    this.playerReady(message);
                    break;
                case PongEvents.PlayerInput:
                    if (!accepted.has(message.socket)) {
                        this.playerInput(message, dt);
                        accepted.add(message.socket);
                    }
                    break;
                default:
                    throw new Error(`Unhandled message type: ${message.message.type}`);
            }
        });

        for (const [socket, game] of this.socketToGames) {
            const update = new GameUpdate();
            update.ballPos = game.ball.position;
            update.speed = game.ball.speed;
            update.player1Y = game.players[0].y;
            update.player2Y = game.players[1].y;
            update.tick = game.tick;
            socket.send(ServerMessages.write(update));
        }

        for (const game of this.games) {
            game.tick += 1;
            this.updatePong(game, dt);
            // console.log(game.ball.position);
        }
    }
}

export class PongServerManifest implements IManifest {
    scenes = {
        runtime: {
            data: {entities: []},
            ctr: PongServerRuntime,
        }
    };
    startScene = "runtime";
    components = [
        
    ];
    systems = [];
    scripts = [];
        assets = {
        fonts: [],
    };
    server = {
        address: {
            host: "localhost",
            port: 4200,
        },
        clientMessages: ClientMessages,
        serverMessages: ServerMessages,
    };
}