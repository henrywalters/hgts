import { Renderer } from "../../common/systems/renderer";
import { IManifest } from "../../core/interfaces/manifest";
import { ClientMessages, GameOver, GameReady, GameUpdate, JoinGameReply, PlayerInput, PlayerReady, PongEvents, ServerMessages } from "./messages";
import RuntimeData from "./assets/scenes/runtime.json";
import MenuData from "./assets/scenes/menu.json";
import DefaultFont from "./assets/fonts/8bit.json";
import { FontData } from "three/examples/jsm/Addons.js";
import { Behavior } from "../../common/components/behavior";
import { Scripts } from "../../common/systems/scripts";
import { DisplayStats } from "./scripts/displayStats";
import { RenderScene } from "../../common/scenes/renderScene";
import { UI } from "../../common/systems/ui";
import { JoinGame } from "./scripts/joinGame";
import { PongMenuState, PongMenuStates, PongState, PongStates } from "./state";
import { MeshPrimitive, MeshPrimitiveType } from "../../common/components/mesh";
import { Color, Vector3 } from "three";
import { Transform } from "../../common/components/transform";
import { IEntity } from "../../ecs/interfaces/entity";
import { PongPaddle } from "./paddle";
import { PongBall } from "./ball";
import { RuntimeText } from "./scripts/runtimeText";
import { Buttons } from "../../core/interfaces/input";
import { BALL_SIZE, GAME_SIZE, PADDLE_OFFSET, PADDLE_SIZE, PADDLE_SPEED } from "./constants";
import { Smooth } from "../../common/components/smooth";

export class PongClientRuntime extends RenderScene {

    private player1: IEntity | null = null;
    private player2: IEntity | null = null;
    private ball: IEntity | null = null;

    public onActivate(): void {

        if (!this.game.client.connected) {
            this.game.activateScene("menu");
            return;
        }

        this.game.resize(GAME_SIZE.x, GAME_SIZE.y);

        if (this.player1) {
            this.removeEntity(this.player1.id);
        }
        if (this.player2) {
            this.removeEntity(this.player2.id);
        }

        if (!this.ball) {
            this.ball = this.addEntity("Ball");
            this.ball.addComponent(Transform);
            this.ball.addComponent(Smooth);
            const mesh = this.ball.addComponent(MeshPrimitive);
            mesh.color = new Color(1, 1, 1);
            mesh.type = MeshPrimitiveType.Sphere;
            mesh.radius = BALL_SIZE;
            mesh.notifyUpdate();
            this.ball.addComponent(PongBall);
        }
        this.ball.transform.position = new Vector3();

        const addPaddle = (name: string, id: number, color: Color, isPlayerOne: boolean) => {
            const entity = this.addEntity(name);
            entity.addComponent(Transform);
            const mesh = entity.addComponent(MeshPrimitive);
            mesh.type = MeshPrimitiveType.Cube;
            mesh.width = PADDLE_SIZE.x;
            mesh.height = PADDLE_SIZE.y;
            mesh.color = color;
            mesh.notifyUpdate();
            const smooth = entity.addComponent(Smooth);
            smooth.speed = PADDLE_SPEED;
            const paddle = entity.addComponent(PongPaddle);
            paddle.serverId = id;
            paddle.isPlayerOne = isPlayerOne;
            return entity;
        }

        if (PongState.isPlayerOne) {
            this.player1 = addPaddle("Player", PongState.playerId, new Color(0, 0, 1), PongState.isPlayerOne);
            this.player2 = addPaddle("Opponent", PongState.opponentId, new Color(1, 0, 0), PongState.isPlayerOne);
        } else {
            this.player2 = addPaddle("Player", PongState.playerId, new Color(0, 0, 1), PongState.isPlayerOne);
            this.player1 = addPaddle("Opponent", PongState.opponentId, new Color(1, 0, 0), PongState.isPlayerOne);
        }

        this.player1.transform.position.x = -PADDLE_OFFSET;
        this.player2.transform.position.x = PADDLE_OFFSET;
        this.player1.getComponent(Smooth)!.targetPosition = this.player1.transform.position;
        this.player2.getComponent(Smooth)!.targetPosition = this.player2.transform.position;

        this.game.client.socket.send(ClientMessages.write(new PlayerReady()));
    }

    public onUpdate(dt: number): void {

        if (!this.game.client.connected) {
            this.game.activateScene("menu");
            return;
        }

        const up = this.game.input.getButton(Buttons.KeyW);
        const down = this.game.input.getButton(Buttons.KeyS);
        const space = this.game.input.getButton(Buttons.KeySpace);

        const input = new PlayerInput();
        input.up = up;
        input.down = down;
        input.launch = space;

        this.game.client.socket.send(ClientMessages.write(input));

        this.game.client.flushEvents((event) => {
            console.log(event);
        });

        this.game.client.flushMessages((message) => {

            if (message.message.type === PongEvents.GameOver) {
                const over = message.message as GameOver;
                PongState.state = PongStates.GameOver;
                PongState.gameOverMessage = over.message;

                PongMenuState.state = PongMenuStates.Connected;

                setTimeout(() => {
                    this.game.activateScene("menu");
                }, 2000);
            }

            if (message.message.type === PongEvents.GameReady) {
                const ready = message.message as GameReady;

                this.player1!.transform.position = new Vector3(-PADDLE_OFFSET, 0, 0);
                this.player2!.transform.position = new Vector3(PADDLE_OFFSET, 0, 0);
                this.ball!.transform.position = new Vector3();

                this.player1!.getComponent(Smooth)!.targetPosition = this.player1!.transform.position;
                this.player2!.getComponent(Smooth)!.targetPosition = this.player2!.transform.position;
                this.ball!.getComponent(Smooth)!.targetPosition = this.ball!.transform.position;

                PongState.scores = [ready.player1Score, ready.player2Score];
                PongState.state = ready.servingPlayer === (PongState.isPlayerOne ? 0 : 1) ? PongStates.Serving : PongStates.Receiving;
            }

            if (message.message.type === PongEvents.GameStart) {
                PongState.state = PongStates.Playing;
            }

            if (message.message.type === PongEvents.GameUpdate) {

                const update = message.message as GameUpdate;
                
                this.player1!.getComponent(Smooth)!.targetPosition = new Vector3(this.player1?.transform.position.x, update.player1Y, 0);
                this.player2!.getComponent(Smooth)!.targetPosition = new Vector3(this.player2?.transform.position.x, update.player2Y, 0);

                const ball = this.ball!.getComponent(Smooth)!;
                ball.speed = update.speed;
                ball.targetPosition = new Vector3(update.ballPos.x, update.ballPos.y, 0);
                //this.player1!.transform.position.y = update.player1Y;
               //this.player2!.transform.position.y = update.player2Y;
            }
        });

    }
}

export class PongClientMenu extends RenderScene {
    public onUpdate(dt: number): void {
        if (!this.game.client.connected) {
            PongMenuState.state = PongMenuStates.Disconnected;
        }

        if (this.game.client.connected && PongMenuState.state === PongMenuStates.Disconnected) {
            PongMenuState.state = PongMenuStates.Connected;
        }

        this.game.client.flushMessages((message) => {
            if (message.message.type === PongEvents.JoinGameReply) {
                const reply = message.message as JoinGameReply;
                PongState.isPlayerOne = reply.isPlayerOne;
                PongState.playerId = reply.playerId;
                PongState.opponentId = reply.opponentId;
                this.game.activateScene('runtime');
            }
        })
    }
}

export class PongClientManifest implements IManifest {
    scenes = {
        menu: {
            data: MenuData,
            ctr: PongClientMenu,
        },
        runtime: {
            data: RuntimeData,
            ctr: PongClientRuntime,
        }
    };
    startScene = "menu";
    components = [
        Behavior,
        PongPaddle,
        PongBall,
    ];
    systems = [
        Renderer,
        Scripts,
        UI,
    ];
    scripts = [
        DisplayStats,
        JoinGame,
        RuntimeText,
    ];
    assets = {
        fonts: [
            {
                name: '8bit',
                data: DefaultFont as unknown as FontData,
            }
        ],
    };
    client = {
        address: {
            host: "localhost",
            port: 4200,
        },
        clientMessages: ClientMessages,
        serverMessages: ServerMessages,
    };
}