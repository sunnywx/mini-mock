export type Primitive=string | number | boolean | undefined | null

export type ArrayType<T>=Array<T>

export type ObjectType<T>=Record<string, T>

export type Complex<T>=ArrayType<T> | ObjectType<T>

export type Obj=Record<string, any>

export interface Schema extends Obj {

}

export enum ValidType {
  string = 'string',
  integer = 'integer',
  number = 'number',
  boolean = 'boolean',
  array = 'array',
  object = 'object',
}

export enum Format {
  date = 'date',
  email = 'email',
  uuid = 'uuid',
  username = 'username',
  // int64 = 'int64'
}

export interface Field {
  type: ValidType,
  format?: Format | string,
  example?: any
}

export type Model = ObjectModel | ArrayModel | StringModel | RefModel

export interface ObjectModel extends Schema {
  type: ValidType.object,
  properties: Record<string, Field>,
  required?: string[]
}

export interface ArrayModel extends Schema {
  type: ValidType.array,
  items: Model,
  required?: string[]
}

export interface StringModel extends Schema {
  type: ValidType.string,
  enum?: string[]
}

export interface RefModel extends Schema {
  $ref: string  // ref path
}

export enum Method {
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete',
  patch = 'patch'
}

export enum ContentType {
  json = 'application/json',
  // xml = 'application/xml',  // deprecated
  form = 'application/x-www-form-urlencoded'
}

export interface RequestConfig {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
  requestBody: {
    description: string,
    content: Record<ContentType, {schema: Model}>,
    required: boolean
  },
  responses: {
    [statusCode: string]: {
      description: string,
      content: Record<ContentType, {schema: Model}>,
    }
  }
}

export interface PathDefinition extends Schema {
  [p: string]: Record<Method, RequestConfig>
}

export type ExternalDoc={
  url: string
  description?: string
}

export type Tag={
  name: string
  description?: string
  externalDocs?: ExternalDoc,
}

export interface SwaggerSchema extends Schema {
  openapi?: string,
  info?: Obj,
  externalDocs?: ExternalDoc,
  servers?: Array<{url: string}>
  tags?: Tag[]
  paths: Record<string, PathDefinition>
  components: {
    schemas: Record<string, Model>,
    requestBodies: Obj
  }
}