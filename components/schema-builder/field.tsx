import React, { useEffect, useMemo, useState } from "react";
import {
  useFieldArray,
  Controller,
  useFormContext,
} from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import { IconBtn } from "@/components/ui";
import {emitter} from './emitter'
import {toast} from 'react-hot-toast'

interface FieldProps {
  field: any;
  removeField: (index: number) => void; // remove field for parent fields
  nestIndex?: string;
  index?: number;
}

const compoundTypes = ["object", "array"];

export const Field = ({
  field,
  removeField,
  nestIndex = "",
  index = 0,
}: FieldProps) => {
  const { register, setValue, watch } = useFormContext();

  const curFields = watch(nestIndex);
  const watchType=watch(`${nestIndex}.${index}.type`)

  // useEffect(()=> {
  //   console.log('change type: ', watchType)
  // }, [watchType])

  const addSubProperty = (index, type) => {
    // const newProperty = { key: "", type: "string" };
    const prev = curFields[index];

    if (type === "object") {
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
      const items = prev?.items || [];

      if(items.length > 0){
        toast.error('Array accept only one item definition')
        return
      }

      setValue(
        `${nestIndex}.${index}`,
        {
          ...prev,
          items: [...items],
        },
        {
          shouldValidate: true,
        }
      );
    }

    // notify sub fields component append item
    setTimeout(() => {
      emitter.emit(
        "add-field",
        `${nestIndex}.${index}.${type === 'object' ? 'properties' : 'items'}`
      );
    }, 0);
  };

  return (
    <div
      key={field.id}
      className="space-y-2 p-1 border-l border-dashed border-blue-200"
    >
      <div className="flex items-center space-x-2">
        <input
          {...register(`${nestIndex}.${index}.key`)}
          placeholder="Name"
          className="w-[120px]"
        />
        <input
          {...register(`${nestIndex}.${index}.description`)}
          placeholder="Description"
          className="w-[220px]"
        />
        <Controller
          name={`${nestIndex}.${index}.type`}
          render={({ field }) => {
            const type = field.value;
            return (
              <>
                <select
                  onChange={(e) => {
                    const prevType=field.value
                    const type = e.target.value;
                    field.onChange(type);

                    if(prevType !== type){
                      // reset all sub fields
                      if(prevType === 'object'){
                        emitter.emit(
                          "reset-sub-fields",
                          `${nestIndex}.${index}.properties`
                        );
                      }

                      if(prevType === 'array'){
                        emitter.emit(
                          "reset-sub-fields",
                          `${nestIndex}.${index}.items`
                        );
                      }
                    }
                  }}
                  value={field.value}
                  className="w-[80px]"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="integer">Integer</option>
                  <option value="boolean">Boolean</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                </select>

                {!compoundTypes.includes(type) ? (
                  <>
                    <input
                      {...register(`${nestIndex}.${index}.example`)}
                      placeholder="Example value"
                      className="w-[120px]"
                    />
                    {type === 'string' && <input
                      {...register(`${nestIndex}.${index}.format`)}
                      placeholder="Format (optional)"
                      className="w-[140px]"
                    />}
                  </>
                ) : (
                  <IconBtn
                    onClick={() => {
                      addSubProperty(index, type);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    {type === 'object' ? 'Add object field' : 'Add array item'}
                  </IconBtn>
                )}
              </>
            );
          }}
        />

        <IconBtn onClick={() => removeField(index)}>
          <Trash2 className="h-4 w-4" />
        </IconBtn>
      </div>

      <Controller
        name={`${nestIndex}.${index}`}
        // shouldUnregister
        render={({ field }) => {
          // console.log('when control field change: ', field)
          const { type, properties, items } = field.value;

          if (type === "object" && Array.isArray(properties)) {
            return (
              <div className="ml-4">
                <Fields nestIndex={`${nestIndex}.${index}.properties`} />
              </div>
            );
          }
          if(type === 'array' && Array.isArray(items)){
            return (
              <div className="ml-4">
                <Fields nestIndex={`${nestIndex}.${index}.items`} />
              </div>
            );
          }
          return null;
        }}
      />
    </div>
  );
};

export const Fields = ({ nestIndex = "properties" }) => {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: nestIndex,
  });
  // const curFields=watch(nestIndex)

  const level = useMemo(
    () => nestIndex.split(".").filter((v) => v === "properties" || v === 'items').length,
    [nestIndex]
  );

  const isArrayField=useMemo(()=> {
    return nestIndex.split(".").filter((v) => v === "items").length > 0
  }, [nestIndex])

  useEffect(()=> {
    console.log('nestIndex, level, is-array: ', nestIndex, level, isArrayField)
  }, [level, isArrayField, nestIndex])

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
        remove(); // remove all fields

        const idx=nestIndex.lastIndexOf('.')
        const parentKey=nestIndex.slice(0, idx)
        const lastKey=nestIndex.slice(idx + 1)
        const parentFields=watch(parentKey)

        if(lastKey === 'properties'){
          delete parentFields.properties
        } else if(lastKey === 'items'){
          delete parentFields.items
        }

        setValue(
          parentKey,
          {
            ...parentFields,
          },
          {
            shouldValidate: true,
          }
        );
      }
    });

    return () => {
      emitter.off("*" as any);
    };
  }, []);

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <Field
          nestIndex={nestIndex}
          index={index}
          field={field}
          removeField={remove}
          key={field.id}
        />
      ))}

      {(level === 1 && !isArrayField) && (
        <IconBtn onClick={() => append({ key: "", type: "string" })}>
          <PlusCircle className="h-4 w-4 mr-1" />
          Add field
        </IconBtn>
      )}
    </div>
  );
};