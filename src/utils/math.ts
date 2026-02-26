import { Ray, Vector2, Vector3 } from "three";

export interface IAABB {
    min: Vector2;
    max: Vector2;
}

export class AABB implements IAABB {
    min: Vector2;
    max: Vector2;

    constructor(min: Vector2, max: Vector2) {
        this.min = min;
        this.max = max;
    }

    expand(point: Vector2) {
        for (const axis of ["x", "y"] as const) {
            if (point[axis] < this.min[axis]) {
                this.min[axis] = point[axis];
            }
            if (point[axis] > this.max[axis]) {
                this.max[axis] = point[axis];
            }
        }
    }

    contains(point: Vector2): boolean {
        return point.x <= this.max.x && point.x >= this.min.x && point.y <= this.max.y && point.y >= this.min.y;
    }

    intersects(other: AABB) {
        return this.min.x < other.max.x && this.max.x > other.min.x && this.min.y < other.max.y && this.max.y > other.min.y;
    }
}

export function sweepAABB(p0: Vector2, p1: Vector2, aabb: IAABB): number | null {
    const delta = p1.clone().sub(p0);

    let tMin = 0;
    let tMax = 1;

    for (const axis of ["x", "y"] as const) {
        if (Math.abs(delta[axis]) < 1e-1) {
            if (p0[axis] < aabb.min[axis] || p0[axis] > aabb.max[axis]) {
                return null;
            }
        } else {
            const invDelta = 1 / delta[axis];

            let t1 = (aabb.min[axis] - p0[axis]) * invDelta;
            let t2 = (aabb.max[axis] - p0[axis]) * invDelta;

            if (t1 > t2) [t1, t2] = [t2, t1];

            tMin = Math.max(tMin, t1);
            tMax = Math.min(tMax, t2);

            if (tMin > tMax) return null;
        }
    }

    return tMin;
}