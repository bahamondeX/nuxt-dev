import "reflect-metadata";

type QuipuActions = "create" | "read" | "update" | "delete" | "query" | "stop";
type QuipuType = "object" | "array" | "string" | "number" | "integer" | "boolean" | "null";

type JsonSchema = {
	title: string;
	description?: string;
	type?: QuipuType;
	properties: {
		[key: string]: any;
	};
	required?: string[];
	enum?: any[];
	items?: any;
};

type Status = {
	code: number;
};

type CollectionMetadataType = {
	id: string;
	name: string;
};

type CollectionType = {
	id: string;
	name: string;
	schema: JsonSchema;
};

type QuipuBaseRequest<T> = {
	event: QuipuActions;
	id?: string | null;
	data?: T | null;
};

type SSEEvent<T> = {
	data: T;
	event: QuipuActions;
};

type PubResponse<T> = {
	event: QuipuActions;
	id: string;
	data: T
}

const isObject = (value: any): value is object => {
	return value && typeof value === "object" && !Array.isArray(value);
};

function jsonSchemaGenerator(typeName: string): MethodDecorator {
	return function (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> | void {
		if (!descriptor || typeof descriptor.value !== "function") {
			throw new Error("jsonSchemaGenerator can only be applied to methods.");
		}
		const originalMethod = descriptor.value;
		const jsonSchema: JsonSchema = {
			title: `${typeName}:${(target as { collectionId: string }).collectionId}`,
			type: "object",
			properties: {},
			required: [],
		};

		const generateSchema = (value: Record<string, any>): JsonSchema => {
			if (Array.isArray(value)) {
				return {
					title: `${typeName}:array`,
					type: "array",
					items: generateSchema(value[0]),
					properties: {},
				};
			} else if (isObject(value)) {
				const nestedSchema: JsonSchema = {
					title: Object.keys(value)[0],
					type: "object",
					properties: {},
					required: [],
				};
				for (const key in value) {
					nestedSchema.properties[key] = generateSchema(value[key]);
					if (value[key] !== null) {
						(nestedSchema.required ??= []).push(key);
					}
				}
				return nestedSchema;
			} else {
				if (typeof value === "object") {
					return {
						title: `${typeName}:object`, // Add a title property
						type: "object",
						properties: {},
						required: [],
					};
				} else {
					return {
						title: `${typeName}:${String(key)}`, // Add a title property
						type: typeof value as "string" | "number" | "boolean" | "null",
						properties: {},
					};
				}
			}
		};

		descriptor.value = function (...args: any[]) {
			const result = originalMethod.apply(this, args);
			const keys = Object.keys(result);

			keys.forEach((key) => {
				jsonSchema.properties[key] = generateSchema(result[key]);
				if (result[key] !== null) {
					(jsonSchema.required ??= []).push(key);
				}
			});

			return jsonSchema;
		};
	};
}

interface IQuipuBase<T> {
	baseUrl: string;
	collectionId?: string;
	data?: T;
	id?: string;
	limit?: number;
	offset?: number;
	buildUrl(endpoint: string, id?: string): string;
	getJsonSchema<T>(data: T): JsonSchema;
}

export class QuipuBase<T> implements IQuipuBase<T> {
	constructor(
		public baseUrl: string = "https://quipubase.online",
	) { }
	// @ts-ignore
	@jsonSchemaGenerator("data")
	getJsonSchema<T>(data: T): JsonSchema {
		return data as unknown as JsonSchema;
	}

	buildUrl(endpoint: string, id?: string): string {
		return `${this.baseUrl}${endpoint}${id ? `/${id}` : ""}`;
	}

	// Collection Management
	async createCollection(schema: JsonSchema, name: string): Promise<CollectionType> {
		const url = this.buildUrl("/v1/collections");
		const collectionData = {
			schema,
			name
		};

		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(collectionData),
		};

		const response = await fetch(url, options);
		return await response.json() as CollectionType;
	}

	async getCollection(collectionId: string): Promise<CollectionType> {
		const url = this.buildUrl("/v1/collections", collectionId);
		const response = await fetch(url);
		return await response.json() as CollectionType;
	}

	async deleteCollection(collectionId: string): Promise<Record<string, boolean>> {
		const url = this.buildUrl("/v1/collections", collectionId);
		const options = {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		};

		const response = await fetch(url, options);
		return await response.json() as Record<string, boolean>;
	}

	async listCollections(): Promise<CollectionMetadataType[]> {
		const url = `${this.buildUrl("/v1/collections")}`;
		const response = await fetch(url);
		return await response.json() as CollectionMetadataType[];
	}

	async subscribeToEvents(collectionId: string, callback: (chunk: SSEEvent<T>) => void): Promise<() => void> {
		const url = this.buildUrl("/v1/events", collectionId);
		const eventSource = new EventSource(url);

		const eventTypes: QuipuActions[] = ["create", "read", "update", "delete", "query", "stop"];

		eventTypes.forEach(eventType => {
			eventSource.addEventListener(eventType, (event: MessageEvent) => {
				try {
					const parsedData = JSON.parse(event.data) as SSEEvent<T>;
					callback({
						data: parsedData.data,
						event: eventType
					});

					// If stop event is received, close the connection
					if (eventType === 'stop') {
						eventSource.close();
					}
				} catch (error) {
					console.error(`Error parsing ${eventType} event:`, error);
				}
			});
		});

		eventSource.onerror = (error) => {
			console.error("EventSource error:", error);
			eventSource.close();
		};

		// Return a function to close the connection
		return () => {
			eventSource.close();
		};
	}

	async publishToEvents(collectionId: string, body: QuipuBaseRequest<T>) {
		const response = await fetch(`/v1/event/${collectionId}`, { method: "POST", headers: { ContentType: "application/json", body: JSON.stringify(body) } })
		return await response.json() as PubResponse<T>
	}


}

export type { CollectionType, CollectionMetadataType, Status, JsonSchema, QuipuActions, QuipuBaseRequest };