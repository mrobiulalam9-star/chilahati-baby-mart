const fs = require("fs");
const { PDFParse } = require("pdf-parse");
(async () => {
  const buf = fs.readFileSync("C:/Users/MDX/AppData/Local/Temp/opencode/smoke.pdf");
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  console.log("type:", typeof result, "keys:", Array.isArray(result) ? "array" : result && typeof result === "object" ? Object.keys(result) : "-");
  if (Array.isArray(result)) {
    console.log("pages:", result.length);
    console.log(JSON.stringify(String(result[0]?.text || "").slice(0, 200)));
  } else {
    console.log(JSON.stringify(result).slice(0, 300));
  }
  await parser.destroy();
})().catch((e) => { console.error("ERR", e); process.exit(1); });
