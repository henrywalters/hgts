export type Success<T> = { success: true; data: T};
export type Error = { success: false, status: number, error?: string; errors?: {[key: string]: string}};
export type Result<T> = Success<T> | Error;

const success = <T>(data: T): Success<T> => ({success: true, data});
const error = (status: number, error?: string, errors?: {[key: string]: string}): Error => ({success: false, status, error, errors});

export class API<T> {

    root: string;
    token: string;

    constructor(root: string, token: string) {
        this.root = root;
        this.token = token;
    }

    private async handle<R>(response: Response): Promise<Result<R>> {
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            return error(response.status, body.error, body.errors);
        }
        return success(await response.json() as R);
    }

    public async getAll(): Promise<Result<T[]>> {
        const response = await fetch(this.root, {
            headers: {
                authorization: this.token,
            }
        });
        return await this.handle<T[]>(response);
    }

    public async delete(id: string) {
        await fetch(`${this.root}/${id}`, {
            method: 'DELETE',
            headers: {authorization: this.token},
        });
    }

    public async post(body: any): Promise<Result<T>> {
        const isFormData = body instanceof FormData;
        const response = await fetch(this.root, {
            headers: {
                authorization: this.token,
                ...(!isFormData && { 'Content-Type': 'application/json' }),
            },
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body),
        });
        return await this.handle<T>(response);
    }

    public async put(id: string, body: any): Promise<Result<T>> {
        const isFormData = body instanceof FormData;
        const response = await fetch(`${this.root}/${id}`, {
            headers: {
                authorization: this.token,
                ...(!isFormData && { 'Content-Type': 'application/json' }),
            },
            method: 'PUT',
            body: isFormData ? body : JSON.stringify(body),
        });
        return await this.handle<T>(response);
    }
}