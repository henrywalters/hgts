import { Ray, Vector2, Vector3 } from "three";

export interface AABB {
    min: Vector2;
    max: Vector2;
}

export function sweepAABB(p0: Vector2, p1: Vector2, aabb: AABB): number | null {
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