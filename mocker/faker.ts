// generate fake data from primitive/compound data type
// import {simpleFaker as faker} from '@faker-js/faker'
import {faker} from '@faker-js/faker'
import {Model, SwaggerSchema, ValidType, Field} from './types'

function genString(m: Model & {type: ValidType.string}){
  const {type, example, format}=m
  if(example){
    return example
  }
  let res=''
  switch(format){
    case 'data':
      res=faker.date.recent().toISOString();
      break;
    case 'email':
      res=faker.internet.email();
      break;
    case 'uuid':
      res=faker.string.uuid();
      break;
    case 'username':
      res=faker.person.fullName();
      break;
    default:
      res=faker.lorem.words(3);
      break;
  }
  return res
}

export function generateFakeData(schema: Model): any {
  const result = {};

  // handle primitive types
  if(schema.type === ValidType.string) {
    // string model
    return genString(schema)
  }

  if(schema.type === ValidType.boolean){
    return faker.datatype.boolean()
    // return faker.helpers.arrayElement([true, false])
  }

  if(schema.type === ValidType.integer){
    return faker.number.int({ min: 0, max: 1000 })
  }

  if(schema.type === ValidType.number){
    return Number(faker.number.float({ min: 0, max: 1000 }).toFixed(2))
  }

  if(schema.type === ValidType.object){
    // object model
    const properties = schema.properties || {};

    for (const [prop, propSchema] of Object.entries<Field>(properties)) {
      const propType = propSchema.type || 'string';
  
      switch (propType) {
        case 'string':
          result[prop]=genString(propSchema);
          break;
        case 'integer':
          result[prop] = faker.number.int({ min: 0, max: 1000 });
          break;
        case 'number':
          result[prop] = Number(faker.number.float({ min: 0, max: 1000 }).toFixed(2));
          break;
        case 'boolean':
          result[prop] = faker.datatype.boolean();
          break;
        case 'array':
          const itemsSchema = (propSchema as Model).items || {};
          result[prop] = Array.from({ length: propSchema.maxItems || 1 }, () => generateFakeData(itemsSchema));
          break;
        case 'object':
          result[prop] = generateFakeData(propSchema as Model);
          break;
      }
    }
  }

  if(schema.type === ValidType.array){
    // array model
    const items = schema.items || {};
    return Array.from({ length: schema.maxItems || 1 }, () => generateFakeData(items))
  }

  if(typeof schema['$ref'] === 'string'){
    // todo: ref model, get target model
    return {}
  }

  return result;
}

// function generateFakeDataFromSwagger(swaggerJson) {
//   const swaggerSchema = JSON.parse(swaggerJson);
//   const definitions = swaggerSchema.definitions || {};

//   const fakeData = {};
//   for (const [prop, definitionSchema] of Object.entries(definitions)) {
//     fakeData[prop] = generateFakeData(definitionSchema);
//   }

//   return fakeData;
// }

// Example usage
const swaggerJson = `
{
  "definitions": {
    "User": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "username": {
          "type": "string",
          "format": "username"
        },
        "email": {
          "type": "string",
          "format": "email"
        },
        "is_active": {
          "type": "boolean"
        },
        "created_at": {
          "type": "string",
          "format": "date"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    }
  }
}
`;

const test2=`
{"User": {
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64",
      "example": 10
    },
    "username": {
      "type": "string",
      "example": "theUser"
    },
    "firstName": {
      "type": "string",
      "example": "John"
    },
    "lastName": {
      "type": "string",
      "example": "James"
    },
    "email": {
      "type": "string",
      "example": "john@email.com"
    },
    "password": {
      "type": "string",
      "example": "12345"
    },
    "phone": {
      "type": "string",
      "example": "12345"
    },
    "userStatus": {
      "type": "integer",
      "description": "User Status",
      "format": "int32",
      "example": 1
    }
  },
  "xml": {
    "name": "user"
  }
}}`

// const fakeData = generateFakeData(JSON.parse(swaggerJson).definitions.User);
// console.log(JSON.stringify(fakeData, null, 2));

// const fake=generateFakeData(JSON.parse(test2).User)
// console.log(JSON.stringify(fake, null, 2))