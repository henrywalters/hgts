import { Behavior } from "../common/components/behavior";
import { ComponentData, IComponent } from "../ecs/interfaces/component";
import { EntityData, IEntity } from "../ecs/interfaces/entity";
import { EntityEvents } from "./events";
import { IScene, SceneData } from "./interfaces/scene";
import { serialize, deserialize, Reflection, Types } from "./reflection";
import { ScriptRegistry } from "./script";

export function serializeComponent(component: IComponent): ComponentData {
    const comp: ComponentData = {
        id: component.id,
        name: component.constructor.name,
        params: {}
    };

    for (const [key, param] of Reflection.getParams(component)) {
        // @ts-ignore
        comp.params[key] = serialize(param, component[key]);
    }

    if (component instanceof Behavior) {
        const script = ScriptRegistry.get(component.scriptName, component)!;
        for (const [key, param] of Reflection.getParams(script)) {
            // @ts-ignore
            comp.params[key] = serialize(param, script[key]);
        }
    }

    return comp;
}

export function deserializeComponent(scene: IScene, entity: IEntity, componentData: ComponentData): IComponent {
    const component = scene.components.addByName(entity, componentData.name);
    const params = Reflection.getParams(component);
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
        if (script) {
            const scriptParams = Reflection.getParams(script);
            for (const key in componentData.params) {
                if (!scriptParams.has(key)) continue;
                // @ts-ignore
                script[key] = deserialize(scriptParams.get(key)!, componentData.params[key]);
            }
        }
    }

    scene.entityEvents.emit({
        type: EntityEvents.AddComponent,
        entity: entity,
        component: component,
    });

    return component;
}

export function serializeEntity(entity: IEntity): EntityData {
    const data: EntityData = {
        id: entity.id,
        name: entity.name,
        children: [],
        components: []
    };

    for (const component of entity.getComponents()) {
        data.components.push(serializeComponent(component));
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

export type EntityIdMap = {[key: number]: number};

function _deserializeEntity(entity: IEntity, scene: IScene, data: EntityData, preserveIds = true, entityMap: EntityIdMap = {}, root = true) {
    for (const componentData of data.components) {
        deserializeComponent(scene, entity, componentData);
    }

    for (const child of data.children) {
        let childEntity: IEntity;
        if (preserveIds) {
            childEntity = scene.addEntity(child.name, child.id, entity.id);
        } else {
            childEntity = scene.addEntity(child.name);
            scene.changeEntityOwner(childEntity.id, entity.id);
            entityMap[child.id] = childEntity.id;
        }
        
        entityMap = _deserializeEntity(childEntity, scene, child, preserveIds, entityMap, false);
    }

    return entityMap;
}

function _remapEntity(entity: IEntity, entityMap: EntityIdMap) {
    for (const component of entity.getComponents()) {
        const params = Reflection.getParams(component);
        for (const [key, field] of params) {
            if (field.type === Types.Entity) {
                // @ts-ignore
                component[key] = entityMap[component[key]];
            }
        }

        if (component instanceof Behavior) {
            const script = ScriptRegistry.get(component.scriptName, component);
            if (script) {
                const scriptParams = Reflection.getParams(script);
                for (const [key, field] of scriptParams) {
                    if (field.type === Types.Entity) {
                        // @ts-ignore
                        script[key] = entityMap[script[key]];
                    }
                }
            }
        }
    }

    for (const child of entity.children) {
        _remapEntity(child, entityMap);
    }
}

export function deserializeEntity(entity: IEntity, scene: IScene, data: EntityData, preserveIds = true) {
    const entityMap = _deserializeEntity(entity, scene, data, preserveIds);

    if (!preserveIds) {
        _remapEntity(entity, entityMap);
    }
}

export function deserializeScene(scene: IScene, data: SceneData) {
    for (const entityData of data.entities) {
        const entity = scene.addEntity(entityData.name, entityData.id);
        deserializeEntity(entity, scene, entityData);
    }
}