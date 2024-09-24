import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useForm,
  FormProvider,
} from "react-hook-form";
import { Button } from "@radix-ui/themes";
import { Fields } from "@/components/schema-builder";
import { generateFakeData } from "@/mocker/faker";

const SchemaBuilder = () => {
  const methods = useForm({
    defaultValues: {
      type: "object",
      properties: [],
    },
    // shouldUnregister: true
  });

  const [result, setResult] = useState("");
  const [fakeResult, setFakeResult] = useState("");

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

  const onSubmit = (data) => {
    const schema = {
      type: data.type,
      properties: generateSchema(data.properties),
    };

    setResult(JSON.stringify(schema, null, 2));
  };

  const genMock = () => {
    const values = methods.getValues();

    const schema = {
      type: values.type,
      properties: generateSchema(values.properties),
    };

    const fake = generateFakeData(schema);

    console.log("gen: raw values, schema, fake: ", values, schema, fake);

    setFakeResult(JSON.stringify(fake, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <div className="p-4">
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2">Define Schema Model (Object)</label>
            {/* <select {...methods.register("type")}>
              <option value="object">Object</option>
            </select> */}
          </div>

          <Fields />

          <div className="w-1/2">
            <Button
              variant="solid"
              type="button"
              style={{ height: "32px" }}
              onClick={genMock}
            >
              Generate Mock
            </Button>
            <textarea
              name="result-mock"
              rows={8}
              className="block w-full min-h-[400px] mt-2"
              value={fakeResult}
              onChange={() => {}}
            />
          </div>

          {/* <div className="w-3/5 grid grid-cols-2 gap-4">
            <div>
              <Button variant='ghost' style={{height: '32px'}}>Generate Schema</Button>
              <textarea
                name="result"
                rows={8}
                className="block w-full min-h-[400px] mt-2"
                value={result}
                onChange={() => {}}
              />
            </div>

            <div>
              <Button variant="solid" type='button' style={{height: '32px'}} onClick={genMock}>Generate Mock</Button>
              <textarea
                name="result-mock"
                rows={8}
                className="block w-full min-h-[400px] mt-2"
                value={fakeResult}
                onChange={() => {}}
              />
            </div>
          </div> */}
        </form>
      </div>
    </FormProvider>
  );
};

export default SchemaBuilder;
