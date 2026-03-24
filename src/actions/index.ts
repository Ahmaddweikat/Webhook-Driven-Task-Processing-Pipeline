import { fieldFilterAction } from "./field-filter.action";
import { fieldRenameAction } from "./field-rename.action";
import { enrichAction } from "./enrich.action";
import { aiSummaryAction } from "./ai-summary.action";
import { conditionalFilterAction } from "./conditional-filter.action";
import { templateTransformAction } from "./template-transform.action";
import { httpEnrichAction } from "./http-enrich.action";
import { jsonToXmlAction } from "./json-to-xml.action";

export type ActionHandler = (
  payload: Record<string, unknown>,
  config: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

export const actions: Record<string, ActionHandler> = {
  field_filter: fieldFilterAction,
  field_rename: fieldRenameAction,
  enrich: enrichAction,
  ai_summary: aiSummaryAction,
  conditional_filter: conditionalFilterAction,
  template_transform: templateTransformAction,
  http_enrich: httpEnrichAction,
  json_to_xml: jsonToXmlAction,
};
