interface JSONObject {
  [key: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;
