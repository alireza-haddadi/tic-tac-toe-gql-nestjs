import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService<T> {
  private readonly storage = new Map<string, T>();

  public get(id: string): T {
    return this.storage.get(id);
  }

  public set(id: string, value: T): T {
    this.storage.set(id, value);
    return this.get(id);
  }

  public getAll(): Map<string, T> {
    return this.storage;
  }
}
