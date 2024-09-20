import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { PlusCircle, Trash2 } from 'lucide-react';
import {Button, TextField, Select, TextArea} from '@radix-ui/themes'

const SchemaBuilder = () => {
  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      type: 'object',
      properties: [{ key: '', type: 'string' }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'properties',
  });
  const [schema, setSchema] = useState({});

  const onSubmit = (data) => {
    const properties = data.properties.reduce((acc, prop) => {
      acc[prop.key] = { type: prop.type };
      if (prop.format) acc[prop.key].format = prop.format;
      if (prop.description) acc[prop.key].description = prop.description;
      if (prop.example) acc[prop.key].example = prop.example;
      return acc;
    }, {});

    const newSchema = {
      type: data.type,
      properties,
    };

    setSchema(newSchema);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-2">Schema Type</label>
          <select {...register('type')}>
            <option value="object">Object</option>
            <option value="array">Array</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-2">Properties</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-2 mb-2">
              <input {...register(`properties.${index}.key`)} placeholder="Key" />
              <select {...register(`properties.${index}.type`)}>
                <option value="string">String</option>
                <option value="integer">Integer</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                {/* <option value="undefined">Undefined</option> */}
                <option value="null">Null</option>
                <option value="object">Object</option>
                <option value="array">Array</option>
              </select>
              <input {...register(`properties.${index}.format`)} placeholder="Format" />
              <input {...register(`properties.${index}.description`)} placeholder="Description" />
              <input {...register(`properties.${index}.example`)} placeholder="Example" />
              <Button type="button" onClick={() => remove(index)} variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => append({ key: '', type: 'string' })}
            className="mt-2"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
        
        <Button type="submit">Generate Schema</Button>
      </form>
      
      {Object.keys(schema).length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Generated Schema:</h3>
          <textarea
            value={JSON.stringify(schema, null, 2)}
            readOnly
            className="w-full h-64"
          />
        </div>
      )}
    </div>
  );
};

export default SchemaBuilder;