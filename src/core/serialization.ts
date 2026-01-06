import { Behavior } from "../common/components/behavior";
import { ComponentData } from "../ecs/interfaces/component";
import { EntityData, IEntity } from "../ecs/interfaces/entity";
import { EntityEvents } from "./events";
import { IScene, SceneData } from "./interfaces/scene";
import { serialize, deserialize } from "./reflection";
import { ScriptRegistry } from "./script";

export function serializeEntity(entity: IEntity): EntityData {
    const data: EntityData = {
        id: entity.id,
        name: entity.name,
        children: [],
        components: []
    };

    for (const component of entity.getComponents()) {
        const comp: ComponentData = {
            id: component.id,
            name: component.constructor.name,
            params: {}
        };

        for (const [key, param] of component.getParams()) {
            // @ts-ignore
            comp.params[key] = serialize(param, component[key]);
        }

        if (component instanceof Behavior) {
            const script = ScriptRegistry.get(component.scriptName, component)!;
            for (const [key, param] of script.getParams()) {
                // @ts-ignore
                comp.params[key] = serialize(param, script[key]);
            }
        }

        data.components.push(comp);
    }

    for (const child of entity.children) {
        data.children.push(serializeEntity(child));
    }

    return data;
}

export function serializeScene(scene: IScene): SceneData {
    const data: SceneData = {
        entities: [],
    };
    
    for (const entity of scene.entities) {
        data.entities.push(serializeEntity(entity));
    }

    return data;
}

export function deserializeEntity(scene: IScene, data: EntityData, parentId?: number) {
    const entity = scene.addEntity(data.name, data.id, parentId);
    for (const componentData of data.components) {
        const component = scene.components.addByName(entity, componentData.name);
        const params = component.getParams();
        for (const key in componentData.params) {
            if (!params.has(key)) {
                continue;
            }
            const field = params.get(key)!;
            // @ts-ignore
            component[key] = deserialize(field, componentData.params[key]);
        }

        if (component instanceof Behavior) {
            const script = ScriptRegistry.get(component.scriptName, component);
            const scriptParams = script!.getParams();
            for (const key in componentData.params) {
                if (!scriptParams.has(key)) continue;
                // @ts-ignore
                script[key] = deserialize(scriptParams.get(key)!, componentData.params[key]);
            }
        }

        scene.entityEvents.emit({
            type: EntityEvents.AddComponent,
            entity: entity,
            component: component,
        });
    }

    console.log(data.children);

    for (const child of data.children) {
        deserializeEntity(scene, child, entity.id);
    }
}

export function deserializeScene(scene: IScene, data: SceneData) {
    for (const entityData of data.entities) {
        deserializeEntity(scene, entityData);
    }
}