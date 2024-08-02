import type { AutoformatRule } from "@udecode/plate-autoformat";
import {
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatMath,
  autoformatPunctuation,
  autoformatSmartQuotes,
} from "@udecode/plate-autoformat";

import { autoformatBlocks } from "./autoformatBlocks";
import { autoformatIndentLists } from "./autoformatIndentLists";
import { autoformatMarks } from "./autoformatMarks";

export const autoformatRules: AutoformatRule[] = [
  ...autoformatBlocks,
  ...autoformatIndentLists,
  ...autoformatMarks,
  ...autoformatSmartQuotes /*  as MyAutoformatRule[] */,
  ...autoformatPunctuation /*  as MyAutoformatRule[] */,
  ...autoformatLegal /*  as MyAutoformatRule[] */,
  ...autoformatLegalHtml /*  as MyAutoformatRule[] */,
  ...autoformatArrow /*  as MyAutoformatRule[] */,
  ...autoformatMath /*  as MyAutoformatRule[] */,
];
