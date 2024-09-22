import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@radix-ui/themes";
import mitt from "mitt";
import { IconBtn } from "@/components/ui";

type Events = {
  "add-field": string;
  "reset-sub-fields": string;
};

const emitter = mitt<Events>();

const Field = ({ field, removeField, nestIndex = "", index = 0 }) => {
  const { register, control, setValue, watch } = useFormContext();

  const addSubProperty = (index, type) => {
    console.log("add sub field in index, type: ", index, type, fields);

    const newProperty = { key: "", type: "string" };

    // todo: emit event
    if (type === "object") {
      const prev = curFields[index];
      const props = prev?.properties || [];

      setValue(
        `${nestIndex}.${index}`,
        {
          ...prev,
          properties: [...props],
        },
        {
          shouldValidate: true,
        }
      );
    } else if (type === "array") {
      // update(index, {
      //   ...fields[index],
      //   items: { type: "object", properties: [newProperty] },
      // });
    }
  };

  return (
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
        <IconBtn onClick={() => removeField(index)}>
          <Trash2 className="h-4 w-4" />
        </IconBtn>

        <Controller
          name={`${nestIndex}.${index}.type`}
          control={control}
          render={({ field }): any => {
            // console.log('watch field: ', field)
            return field.value === "object" || field.value === "array" ? (
              <IconBtn
                onClick={() => {
                  addSubProperty(index, field.value);
                  setTimeout(() => {
                    emitter.emit(
                      "add-field",
                      `${nestIndex}.${index}.properties`
                    );
                  }, 0);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add sub field
              </IconBtn>
            ) : null;
          }}
        />
      </div>

      <Controller
        name={`${nestIndex}.${index}`}
        control={control}
        shouldUnregister
        render={({ field }) => {
          // console.log('when control field change: ', field)
          const { type, properties } = field.value;

          if (type === "object" && Array.isArray(properties)) {
            return (
              <div className="ml-8">
                <PropertyFields
                  nestIndex={`${nestIndex}.${index}.properties`}
                  {...{ control, register, remove, setValue, watch }}
                />
              </div>
            );
          }
          return null;
        }}
      />
    </div>
  );
};

const PropertyFields = ({ nestIndex = "properties" }) => {
  const { register, control, setValue, watch } = useFormContext();
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: nestIndex,
  });
  const curFields = watch(nestIndex);
  const level = useMemo(
    () => nestIndex.split(".").filter((v) => v === "properties").length,
    [nestIndex]
  );
  // console.log("cur fields: ", curFields);

  useEffect(() => {
    emitter.on("add-field", (pathKey: string) => {
      if (pathKey === nestIndex) {
        const newProperty = { key: "", type: "string" };
        append(newProperty);
      }
    });

    emitter.on("reset-sub-fields", (pathKey: string) => {
      // when cur field type changed to primitive, reset all sub fields
      if (pathKey === nestIndex) {
      }
    });

    return () => {
      emitter.off("*");
    };
  }, []);

  return (
    <div className="space-y-2">
      {level === 1 ? (
        <IconBtn onClick={() => append({ key: "", type: "string" })}>
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Property
        </IconBtn>
      ) : null}

      {fields.map((field, index) => (
        <Field
          nestIndex={nestIndex}
          index={index}
          field={field}
          removeField={remove}
          key={field.id}
        />
      ))}
    </div>
  );
};

const SchemaBuilder = () => {
  // todo: use form provider to access all form actions
  const methods = useForm({
    defaultValues: {
      type: "object",
      properties: [],
    },
    // shouldUnregister: true
  });

  const [result, setResult] = useState("");

  const onSubmit = (data) => {
    const generateSchema = (props) => {
      return props.reduce((acc, prop) => {
        if (!prop.key) return acc;

        acc[prop.key] = { type: prop.type };
        if (prop.format) {
          acc[prop.key].format = prop.format;
        }
        if (prop.description) {
          acc[prop.key].description = prop.description;
        }
        if (prop.example) {
          acc[prop.key].example = prop.example;
        }
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

    setResult(JSON.stringify(schema, null, 2));
  };

  return (
    <div className="p-4">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2">Schema/Model Type</label>
            <select {...methods.register("type")}>
              <option value="object">Object</option>
            </select>
          </div>

          <PropertyFields />

          <Button type="submit">Generate Schema</Button>

          <textarea
            name="result"
            rows={8}
            className="block w-1/2 min-h-max"
            value={result}
            onChange={() => {}}
          />
        </form>
      </FormProvider>
    </div>
  );
};

export default SchemaBuilder;
