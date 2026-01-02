import { EntityEvents } from "../../core/events";
import { IScene } from "../../core/interfaces/scene";
import { Script, ScriptRegistry } from "../../core/script";
import { System } from "../../ecs/system";
import { Behavior } from "../components/behavior";

export class Scripts extends System {

    constructor(scene: IScene) {
        super(scene);
        
        this.scene.entityEvents.listen((e) => {
            if (e.type === EntityEvents.AddComponent && e.component instanceof Behavior && e.component.scriptName !== '') {
                ScriptRegistry.instantiate(e.component.scriptName, e.component);
            }
        })
    }

    onUpdate(dt: number): void {
        this.scene.components.forEach(Behavior, (behavior) => {
            const script = ScriptRegistry.get(behavior.scriptName, behavior);
            if (script) {
                script.onUpdate(dt);
            }
        });
    }
}