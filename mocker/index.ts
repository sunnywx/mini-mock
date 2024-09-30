import fs from 'fs'
import yml from 'js-yaml'
import {faker} from '@faker-js/faker'

const mocker = (json_schema: Schema | string, opt={})=> {
  return {}
}

// read swagger json
// try{
//   const file=fs.readFileSync('./specs/pet-store.yml', 'utf-8')
//   const doc=yml.load(file)
//   console.log(doc)

//   // write to json file
//   fs.writeFileSync('./specs/pet-store.json', JSON.stringify(doc, null, 2))
// } catch(err){
//   console.error(err)
// }

// gen fake data
// console.log(faker.person.fullName(), faker.internet.email())