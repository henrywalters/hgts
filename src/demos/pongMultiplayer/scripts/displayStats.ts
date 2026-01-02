import { TextMesh } from "../../../common/components/mesh";
import { EntityEvents } from "../../../core/events";
import { Param, Types } from "../../../core/reflection";
import { Script } from "../../../core/script";

export class DisplayStats extends Script {

    private samples: number[] = [];

    @Param({type: Types.Int})
    sampleSize: number = 10;

    onUpdate(dt: number): void {
        this.samples.push(dt);
        
        if (this.samples.length >= this.sampleSize) {
            const text = this.entity.getComponent(TextMesh);
            if (text) {

                let sum = 0;

                for (const frame of this.samples) {
                    sum += frame;
                }

                const avgDt = sum / this.samples.length;

                text.text = `FPS: ${(1 / avgDt).toFixed(0)}`;
                this.entity.scene.entityEvents.emit({
                    type: EntityEvents.UpdateComponent,
                    entity: this.entity,
                    component: text,
                });
            }
            
            this.samples = [];
        }
    }
}