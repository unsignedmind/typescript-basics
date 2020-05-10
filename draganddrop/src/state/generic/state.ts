/* State */
export type Listener<T> = (projects: T[]) => void;
export class State<T> {
  protected listeners: Listener<T>[] = [];

  public addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }

}