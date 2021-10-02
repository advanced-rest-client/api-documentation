import { ApiParameter, ApiShapeUnion } from "@api-components/amf-helper-mixin";

export interface OperationParameter {
  parameter: ApiParameter;
  schema?: ApiShapeUnion;
  paramId: string;
  schemaId?: string;
  binding: string;
  source: string;
}

export interface ApiSummaryEndpoint {
  id: string;
  path: string;
  name?: string;
  ops?: ApiSummaryOperation[];
}
export interface ApiSummaryOperation {
  id: string;
  method: string;
}
