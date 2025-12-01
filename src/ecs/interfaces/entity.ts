import { ITransform } from "../../core/transform";

export interface IEntity {
    id: number;
    name: string;
    children: IEntity[];
    transform: ITransform;
}