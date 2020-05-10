/* UTIL */
export function autoBind(_target: any, _2methodName: string, descriptor: PropertyDescriptor)
{
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFunction = originalMethod.bind(this);
      return boundFunction;
    }
  }
  return adjustedDescriptor;
}