import 'reflect-metadata';
import { z, type ZodTypeAny } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

type FieldOptions = {
  optional?: boolean;
  default?: any;
};

const fieldMetadataKey = Symbol('fields');

export function Field(opts: FieldOptions = {}): PropertyDecorator {
  return (target, propertyKey) => {
    const fields = Reflect.getMetadata(fieldMetadataKey, target.constructor) || {};
    fields[propertyKey as string] = opts;
    Reflect.defineMetadata(fieldMetadataKey, fields, target.constructor);
  };
}

export function createZodSchema(cls: any): ZodTypeAny {
  const fields: Record<string, FieldOptions> = Reflect.getMetadata(fieldMetadataKey, cls) || {};
  const shape: Record<string, ZodTypeAny> = {};

  for (const key of Object.keys(fields)) {
    const type = Reflect.getMetadata('design:type', cls.prototype, key);
    if (!type) throw new Error(`No type metadata found for ${key}`);

    let zodType: ZodTypeAny;

    switch (type.name) {
      case 'String':
        zodType = z.string();
        break;
      case 'Number':
        zodType = z.number();
        break;
      case 'Boolean':
        zodType = z.boolean();
        break;
      default:
        throw new Error(`Unsupported type: ${type.name}`);
    }

    const opts = fields[key];
    if (opts.optional) zodType = zodType.optional();
    if (opts.default !== undefined) zodType = zodType.default(opts.default);

    shape[key] = zodType;
  }

  return z.object(shape);
}
export function Model(): ClassDecorator {
  return (target: any) => {
    const schema = createZodSchema(target);
    target.zodSchema = schema;
    target.jsonSchema = zodToJsonSchema(schema); // Exporta JSON Schema
  };
}

export abstract class BaseModel {
  constructor(data: unknown) {
    const schema = (this.constructor as any).zodSchema;
    const parsed = schema.parse(data);
    Object.assign(this, parsed);
  }

  static from<T extends typeof BaseModel>(this: T, data: unknown): InstanceType<T> {
    // @ts-ignore
    return new this(data) as InstanceType<T>;
  }

  static get schema(): any {
    return (this as any).jsonSchema;
  }
}
export function registerSchema<T extends new (...args: any) => any>(cls: T): void {
  const schema = createZodSchema(cls);
  (cls as any).zodSchema = schema;
}