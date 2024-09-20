import React, { useCallback, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@radix-ui/themes";
import {get} from 'lodash'

const PropertyFields = ({ nestIndex = 'properties', control, register, remove, setValue, watch }) => {
  const {
    fields,
    append,
    update,
    remove: removeField,
  } = useFieldArray({
    control,
    name: nestIndex,
  });
  const curFields=watch(nestIndex)

  // const controlledFields=fields.map((f, idx)=> {
  //   return {
  //     ...f,
  //     ...curFields[idx]
  //   }
  // })

  console.log('cur fields: ', curFields)

  const addSubProperty = (index, type) => {
    console.log('add sub field in index, type: ', index, type, fields)

    const newProperty = { key: "", type: "string" };
    if (type === "object") {
      const prev=curFields[index]
      const props=prev?.properties || []

      setValue([nestIndex, index].join('.'), {
        ...prev,
        properties: [...props, newProperty],
      },
      {
        shouldValidate: true,
      }
      );
    } else if (type === "array") {
      update(index, {
        ...fields[index],
        items: { type: "object", properties: [newProperty] },
      });
    }
  };

  // useEffect(()=> {
  //   console.log('changed fields, nestIndex: ', fields, nestIndex)
  // }, [fields, nestIndex])

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              {...register(`${nestIndex}.${index}.key`)}
              placeholder="Name"
              className="w-[120px]"
            />
            <Controller
              name={`${nestIndex}.${index}.type`}
              control={control}
              defaultValue="string"
              render={({ field }) => (
                <select
                  onChange={(e) => field.onChange(e.target.value)}
                  value={field.value}
                  className="w-[80px]"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="integer">Integer</option>
                  <option value="boolean">Boolean</option>
                  <option value="array">Array</option>
                  <option value="object">Object</option>
                </select>
              )}
            />
            <input
              {...register(`${nestIndex}.${index}.format`)}
              placeholder="Format (optional)"
              className="w-[140px]"
            />
            {/* <input
              {...register(`${nestIndex}.${index}.description`)}
              placeholder="Description"
              className="w-[160px]"
            />
              <input
              {...register(`${nestIndex}.${index}.example`)}
              placeholder="Example value"
              className="w-[120px]"
            /> */}
            <Button
              type="button"
              onClick={() => removeField(index)}
              variant="destructive"
              size="sm"
              className="w-1/4"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <Controller
              name={`${nestIndex}.${index}.type`}
              control={control}
              render={({ field }): any => {
                // console.log('watch field: ', field)
                return (
                  field.value === "object" || field.value === "array" ? (
                    <Button
                      type="button"
                      onClick={() => {
                        addSubProperty(index, field.value);
                      }}
                      size="sm"
                      className="w-auto"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Sub-field
                    </Button>
                  ) : null
                )
              }
              }
            />
          </div>

          <Controller
            name={`${nestIndex}.${index}`}
            control={control}
            render={({ field }) => {
              // console.log('when control field change: ', field)

              return (
                <div className="ml-8">
                {field.value.type === "object" && field.value.properties && (
                  <PropertyFields
                    nestIndex={`${nestIndex}.${index}.properties`}
                    {...{ control, register, remove, setValue, watch }}
                  />
                )}
                {field.value.type === "array" &&
                  field.value.items && (
                    <PropertyFields
                      nestIndex={`${nestIndex}.${index}.items`}
                      {...{ control, register, remove, setValue, watch }}
                    />
                  )}
              </div>
              )
            }
            }
          />
        </div>
      ))}

      <Button
        type="button"
        onClick={() => append({ key: "", type: "string" })}
        size="sm"
      >
        <PlusCircle className="h-4 w-4 mr-1" />
        Add Property
      </Button>
    </div>
  );
};

const SchemaBuilder = () => {
  const { register, control, handleSubmit, setValue, getValues, watch } = useForm({
    defaultValues: {
      type: "object",
      properties: []
      // properties: [{ key: "", type: "string" }],
    },

    //  defaultValues: {
    //    "type": "object",
    //    "properties": {
    //      "result": {
    //        "type": "object",
    //        "properties": {
    //          "name": {
    //            "type": "string",
    //            "description": "xx"
    //          },
    //          "comp": {
    //            "type": "object",
    //            "properties": {
    //              "tt": {
    //                "type": "string"
    //              }
    //            }
    //          }
    //        }
    //      },
    //      "name": {
    //        "type": "string"
    //      }
    //    }
    //  }
  });

  const onSubmit = (data) => {
    const generateSchema = (props) => {
      return props.reduce((acc, prop) => {
        if (!prop.key) return acc;
        acc[prop.key] = { type: prop.type };
        if (prop.format) acc[prop.key].format = prop.format;
        if (prop.description) acc[prop.key].description = prop.description;
        if (prop.example) acc[prop.key].example = prop.example;
        if (prop.type === "object" && prop.properties) {
          acc[prop.key].properties = generateSchema(prop.properties);
        }
        if (prop.type === "array" && prop.items && prop.items.properties) {
          acc[prop.key].items = {
            type: "object",
            properties: generateSchema(prop.items.properties),
          };
        }
        return acc;
      }, {});
    };

    const schema = {
      type: data.type,
      properties: generateSchema(data.properties),
    };

    console.log(JSON.stringify(schema, null, 2));

    // get current form values
    console.log('form values: ', getValues())
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-2">Schema Type</label>
          <select {...register("type")}>
            <option value="object">Object</option>
          </select>
        </div>

        <PropertyFields
          // nestIndex=""
          control={control}
          register={register}
          remove={() => {}}
          setValue={setValue}
          watch={watch}
        />

        <Button type="submit">Generate Schema</Button>
      </form>
    </div>
  );
};

export default SchemaBuilder;
