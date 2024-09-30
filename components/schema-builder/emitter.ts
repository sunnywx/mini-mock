import mitt from "mitt";

type Events = {
  "add-field": string;
  "reset-sub-fields": string;
};

export const emitter = mitt<Events>();
