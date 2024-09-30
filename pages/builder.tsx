import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { Button } from "@radix-ui/themes";
import { Fields } from "@/components/schema-builder";
import { generateFakeData } from "@/mocker/faker";
import { watch } from "fs";

const SchemaBuilder = () => {
  const methods = useForm({
    defaultValues: {
      type: "object",
      properties: [],

      // import raw schema
      // "type": "object",
      // "properties": [
      //   {type: 'string', key: 'aa'},
      // ]

      // todo: function calling schema
      // name: '', // func name
      // description: '',  // func description
      // parameters: { // func input parameters
      //   type: "object",
      //   properties: [],
      // },
      // response: { // func output
      //   result: {},
      //   code: 200
      // }
    },
    // shouldUnregister: true
  });

  const formData=methods.watch()

  const [result, setResult] = useState("");
  const [fakeResult, setFakeResult] = useState("");

  useEffect(()=> {
    // console.log('curr form values: ', formData)
    const schema = {
      type: formData.type,
      properties: generateSchema(formData.properties),
    };
    setResult(JSON.stringify(schema, null, 2));
  }, [formData])

  const generateSchema = (props, opt = {}) => {
    props = (Array.isArray(props) ? props : [props]).filter(Boolean);

    return props.reduce((acc, prop) => {
      if (opt?.ignoreKey) {
        // array item
        if (prop.type === "object") {
          return {
            type: "object",
            properties: generateSchema(prop.properties || []),
          };
        }
        if (prop.type === "array") {
          return {
            type: "array",
            items: generateSchema(prop.items || [], { ignoreKey: true }),
          };
        }
        // primitive type
        // return {[prop.key]: prop}
      }

      // if (!prop.key) return acc;

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
        acc[prop.key].properties = generateSchema(prop.properties, {
          ignoreKey: true,
        });
      }
      if (prop.type === "array" && prop.items) {
        acc[prop.key].items = generateSchema(prop.items, { ignoreKey: true });
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

    console.log("gen raw form values: ", values);

    const schema = {
      type: values.type,
      properties: generateSchema(values.properties),
    };

    console.log("gen schema: ", schema);

    const fake = generateFakeData(schema);

    console.log("gen fake: ", fake);

    setFakeResult(JSON.stringify(fake, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-2 gap-4">
        <div className="w-full p-4">
          <h2 className="mb-4">Function calling schema designer</h2>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <Fields />
          </form>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <div>
            {/* <Button variant="surface" style={{ height: "32px" }}>
              Output Json Schema
            </Button> */}
            <p>Intermediate Json Schema</p>
            <textarea
              name="result"
              rows={8}
              className="block w-full min-h-[400px] mt-2"
              value={result}
              onChange={() => {}}
            />
          </div>

          <div>
            <Button
              variant="solid"
              type="button"
              style={{ height: "32px" }}
              onClick={genMock}
            >
              Mock Data
            </Button>
            <textarea
              name="result-mock"
              rows={8}
              className="block w-full min-h-[400px] mt-2"
              value={fakeResult}
              onChange={() => {}}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default SchemaBuilder;
