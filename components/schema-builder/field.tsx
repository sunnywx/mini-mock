import React, { useEffect, useMemo, useState } from "react";
import {
  useFieldArray,
  Controller,
  useFormContext,
} from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
// import { Button } from "@radix-ui/themes";
import { IconBtn } from "@/components/ui";
import {emitter} from './emitter'

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

  const addSubProperty = (index, type) => {
    // const newProperty = { key: "", type: "string" };

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
        <Controller
          name={`${nestIndex}.${index}.type`}
          render={({ field }) => {
            const type = field.value;
            return (
              <>
                <select
                  onChange={(e) => {
                    const type = e.target.value;
                    field.onChange(type);
                    // when changed to primitive type, reset all sub fields
                    if (!["object", "array"].includes(type)) {
                      emitter.emit(
                        "reset-sub-fields",
                        `${nestIndex}.${index}.properties`
                      );
                    }
                  }}
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

                {!compoundTypes.includes(type) ? (
                  <>
                    <input
                      {...register(`${nestIndex}.${index}.example`)}
                      placeholder="Example value"
                      className="w-[120px]"
                    />
                    <input
                      {...register(`${nestIndex}.${index}.format`)}
                      placeholder="Format (optional)"
                      className="w-[140px]"
                    />
                  </>
                ) : (
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
          const { type, properties } = field.value;

          if (type === "object" && Array.isArray(properties)) {
            return (
              <div className="ml-4">
                <Fields nestIndex={`${nestIndex}.${index}.properties`} />
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
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: nestIndex,
  });

  const level = useMemo(
    () => nestIndex.split(".").filter((v) => v === "properties").length,
    [nestIndex]
  );

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

      {level === 1 && (
        <IconBtn onClick={() => append({ key: "", type: "string" })}>
          <PlusCircle className="h-4 w-4 mr-1" />
          Add field
        </IconBtn>
      )}
    </div>
  );
};