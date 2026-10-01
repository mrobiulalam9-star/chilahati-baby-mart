(function () {
  "use strict";

  var input = document.getElementById("templateFile");
  var status = document.getElementById("templateStatus");
  var root = document.getElementById("templateRoot");
  var pdfBtn = document.getElementById("templatePdfBtn");
  var printBtn = document.getElementById("templatePrintBtn");
  if (!input || !status || !root || !pdfBtn || !printBtn) return;

  var SECTIONS = [
    {
      id: "icb", name: "ICB (Head Office and Branch)",
      rows: [
        { label: "TOTAL (ICB All Portfolio)", derived: true, sumOf: "icb", skip: 1 },
        { label: "ICBR (ICB Right)" }, { label: "ICB (Own Portfolio)" }, { label: "ICBB (ICB Bond)" },
        { label: "ICBMS (ICB Market Support)" }, { label: "ICBCMSF(Investment Corporation Of Bangladesh)" },
        { label: "ICBSG(ICB Sovereign Guarantee)" }, { label: "ICBGOL(ICB Government Operation Loan)" }, { label: "UF (Unit Fund)" },
        { label: "LOCPOR (ICB local office portfolio)" }, { label: "BARICBP (ICB Barishal)" }, { label: "BOGICBPF (ICB Bogura)" },
        { label: "CTGICBF (ICB Chottagram)" }, { label: "KHLICBPORT (ICB Khulna)" }, { label: "RAJICBP(ICB Rajshahi)" }, { label: "SYLICBP (ICB Sylhet)" },
      ],
    },
    { id: "istcl", name: "ISTCL", rows: [{ label: "ISTCL (Own Portfolio)" }] },
    {
      id: "asset", name: "ASSET",
      rows: [
        { label: "TOTAL(Asset)", derived: true, sumOf: "asset", skip: 1 },
        { label: "BDF" }, { label: "1st To 8th UF" }, { label: "1AG" }, { label: "1SB" }, { label: "AIUF" },
        { label: "AMCL (Asset Own Portfolio)" }, { label: "AMCL2 (ICB Asset Management PLC-2)" },
        { label: "AMCPF" }, { label: "AMCUF" }, { label: "AMF1" }, { label: "AMF2" },
        { label: "ANRB1" }, { label: "ANRB2" }, { label: "ANRB3" }, { label: "PBM1" },
        { label: "PH1" }, { label: "PR1" }, { label: "EPF1" }, { label: "IF1" }, { label: "IASUF" }, { label: "IGJMF" },
      ],
    },
    { id: "icml", name: "ICML", rows: [{ label: "ICML All Own Portfolio(Head office & Branch)" }] },
    { id: "total", name: "TOTAL", rows: [{ label: "TOTAL", derived: true, sumOf: "merchant", skip: 0 }] },
    {
      id: "merchant", name: "Other Merchant Bank",
      rows: [
        { label: "Agrani Merchant Bank Own Portfolio" }, { label: "Agrani Bank Own Portfolio" },
        { label: "Sonali Bank Own Portfolio" }, { label: "Sonali Bank Special Fund" },
        { label: "Sonali Merchant Bank Special Fund" }, { label: "Sonali Investmet Ltd.(Uttara)" },
        { label: "Janata Merchant Bank Own Portfolio" }, { label: "Janata Merchant Bank Special Fund" },
        { label: "Janata Bank Special Fund" }, { label: "Janata Bank Own Portfolio" },
        { label: "Pubali Bank Own Portfolio" },
      ],
    },
  ];

  var META = {
    dse: { idx: "tpl-dse-idx", ud: "tpl-dse-ud", turn: "tpl-dse-turn", pct: "tpl-dse-pct", icl: "tpl-dse-icl", buy: "tpl-dse-buy", sale: "tpl-dse-sale" },
    cse: { idx: "tpl-cse-idx", ud: "tpl-cse-ud", turn: "tpl-cse-turn", pct: "tpl-cse-pct", icl: "tpl-cse-icl", buy: "tpl-cse-buy", sale: "tpl-cse-sale" },
  };

  var fallback = {};

  function fmt(n) {
    var v = Number(n);
    if (!isFinite(v)) return "0.00";
    return v.toFixed(2);
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ""); }
  function findSec(id) {
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].id === id) return SECTIONS[i];
    return null;
  }
  function cell(secId, ri, field) { return document.getElementById("tpl-" + secId + "-" + ri + "-" + field); }
  function el(id) { return document.getElementById(id); }
  function num(id) { var e = el(id); var n = parseFloat(e && e.value); return isFinite(n) ? n : 0; }
  function set(id, x) { var e = el(id); if (e) e.value = fmt(x); }
  function cellNum(secId, ri, field) { var e = cell(secId, ri, field); var n = parseFloat(e && e.value); return isFinite(n) ? n : 0; }
  function pctN(numer, denom) { if (!denom) return 0; return (numer / denom) * 100; }
  function applyFallback(label, field, computed, raw) {
    if (computed !== 0) return computed;
    var f = fallback[norm(label)];
    var r = f || fallback[norm(raw || label)];
    return r ? (r[field] || 0) : 0;
  }

function metricInput(id, isPct, label, readonly) {
    return (
      '<div class="metric"><span class="metric-label">' + esc(label) + '</span><span class="tpl-input-wrap">' +
      '<input type="number" min="0" step="0.01" class="amount-input' + (isPct ? " tpl-pct" : "") + (readonly ? " tpl-derived" : "") + '" id="' + id + '" value="0.00"' +
      (isPct ? ' readonly data-pct="1"' : "") + (readonly ? " readonly" : "") + " />" +
      (isPct ? '<span class="tpl-suffix">%</span>' : "") +
      "</span></div>"
    );
  }

  function render() {
    var html = "";
    html += '<div class="turnover-head"><h3>ICB Securities Trading Company Limited</h3></div>';
    html += '<div class="turnover-date-line">';
    html += '<label class="tpl-date-label">Date <input type="date" id="tpl-date" class="tpl-date-input" /></label>';
    html += '<span class="turnover-units">(Tk in crore)</span>';
    html += "</div>";

    var labelMap = {
      dse: ["DSE Index (DSEX)", "DSE Index (DSEX) up/down", "Total DSE Turnover", "% of ISTCL Turnover to DSE", "Total ISTCL Turnover in (DSE)", "Total ISTCL Buy at (DSE)", "Total ISTCL Sale at (DSE)"],
      cse: ["CSCX Index (CSCX)", "CSE Index (DSEX) up/down", "Total CSE Turnover", "% of ISTCL Turnover to CSE", "Total ISTCL Turnover in (CSE)", "Total ISTCL Buy at (CSE)", "Total ISTCL Sale at (CSE)"],
    };

    html += '<div class="dse-cse tpl-dse-cse">';
    ["dse", "cse"].forEach(function (side) {
      var m = META[side];
      html += '<div class="dse-cse-col"><h4>' + (side === "dse" ? "DSE" : "CSE") + "</h4>";
      var order = [m.idx, m.ud, m.turn, m.pct, m.icl, m.buy, m.sale];
      for (var i = 0; i < order.length; i++) {
        var locked = (side === "dse" || side === "cse") && order[i] === m.icl ||
          (side === "dse" && order[i] === m.buy) ||
          (side === "cse" && order[i] === m.buy); // Buy fields derived from Security Market rows; ISTCL turnover = Buy + Sale
        html += metricInput(order[i], order[i] === m.pct, labelMap[side][i], locked);
      }
      html += "</div>";
    });
    html += "</div>";

    html += '<div class="tpl-combined"><div class="tpl-combined-title">ISTCL Total Turnover</div>';
    html += metricInput("tpl-comb-icl", false, "Total ISTCL Turnover (DSE+CSE)");
    html += metricInput("tpl-comb-pct", true, "% of ISTCL Turnover to (DSE+CSE)");
    html += "</div>";

    html += '<table class="turnover-table turnover-summary">';
    html += '<thead><tr><th>Category</th><th class="num">Buy</th><th class="num">Sale</th><th class="num">TOTAL(BUY+SALE)</th></tr></thead>';
    html += "<tbody>";
    var sumRows = [
      ["INSTITUTE TOTAL (DSE+CSE)", "tpl-inst-buy", "tpl-inst-sale", "tpl-inst-total"],
      ["INDIVIDUAL TOTAL (DSE+CSE)", "tpl-ind-buy", "tpl-ind-sale", "tpl-ind-total"],
    ];
    sumRows.forEach(function (row) {
      html += '<tr class="turnover-sum-row"><td>' + esc(row[0]) + "</td>";
      [row[1], row[2], row[3]].forEach(function (id) {
        html += '<td class="num"><input type="number" readonly class="amount-input tpl-derived" id="' + id + '" value="0.00" /></td>';
      });
      html += "</tr>";
    });
    html += "</tbody></table>";

    html += '<div class="turnover-scroll tpl-scroll"><table class="turnover-table">';
    html += '<thead><tr><th>Client</th><th class="num">Buy</th><th class="num">Sale</th><th class="num">TOTAL(BUY+SALE)</th></tr></thead>';
    html += "<tbody>";
    SECTIONS.forEach(function (sec) {
      html += '<tr class="turnover-section"><td colspan="4">' + esc(sec.name) + "</td></tr>";
      sec.rows.forEach(function (r, ri) {
        var fid = "tpl-" + sec.id + "-" + ri + "-";
        html += "<tr" + (r.derived ? ' class="turnover-total"' : "") + ">";
        html += "<td>" + esc(r.label) + "</td>";
        ["buy", "sale", "total"].forEach(function (field) {
          html += '<td class="num"><input type="number" step="0.01" min="0" class="amount-input' +
            (r.derived ? " tpl-derived" : "") + '" id="' + fid + field + '" value="0.00"' +
            (r.derived ? " readonly" : "") + " /></td>";
        });
        html += "</tr>";
      });
    });
    html += "</tbody></table></div>";

    root.innerHTML = html;
  }

  function sumSection(secId, skip) {
    var sec = findSec(secId);
    var b = 0, s = 0;
    for (var i = skip; i < sec.rows.length; i++) {
      b += cellNum(secId, i, "buy");
      s += cellNum(secId, i, "sale");
    }
    return { buy: b, sale: s, total: b + s };
  }

  function setDerived(label, val) {
    var buy = applyFallback(label, "buy", val.buy);
    var sale = applyFallback(label, "sale", val.sale);
    return { buy: buy, sale: sale, total: buy + sale };
  }

  function recomputeAll() {
    // row totals
    SECTIONS.forEach(function (sec) {
      sec.rows.forEach(function (r, ri) {
        if (r.derived) return;
        var t = cellNum(sec.id, ri, "buy") + cellNum(sec.id, ri, "sale");
        var e = cell(sec.id, ri, "total");
        if (e) e.value = fmt(t);
      });
    });

    // section derived totals
    var icbT = setDerived("TOTAL (ICB All Portfolio)", sumSection("icb", 1));
    var asT = setDerived("TOTAL(Asset)", sumSection("asset", 1));
    var mtT = setDerived("TOTAL", sumSection("merchant", 0));
    [["icb", 0, icbT], ["asset", 0, asT], ["total", 0, mtT]].forEach(function (it) {
      setCell(it[0], it[1], it[2]);
    });

    // combined + percents
    var t = num(META.dse.turn), s = num(META.dse.sale);
    var b = applyFallback("Security Market: Dhaka Stock Exchange Ltd.", "buy", 0, "Security Market: Dhaka Stock Exchange Ltd.");
    if (!(b > 0)) b = num(META.dse.buy);
    set(META.dse.buy, b); // Total ISTCL Buy at (DSE) = Security Market: Dhaka Stock Exchange Ltd. Buy Gross
    var ic = b + s; // Total ISTCL Turnover in (DSE) = Total ISTCL Buy at (DSE) + Total ISTCL Sale at (DSE)
    set(META.dse.icl, ic);
    var cb = applyFallback("Security Market: Chittagong Stock Exchange Ltd.", "buy", 0, "Security Market: Chittagong Stock Exchange Ltd.");
    if (!(cb > 0)) cb = num(META.cse.buy);
    set(META.cse.buy, cb); // Total ISTCL Buy at (CSE) = Security Market: Chittagong Stock Exchange Ltd. Buy Gross
    var c = { t: num(META.cse.turn), b: cb, s: num(META.cse.sale) };
    c.ic = c.b + c.s; // Total ISTCL Turnover in (CSE) = Total ISTCL Buy at (CSE) + Total ISTCL Sale at (CSE)
    set(META.cse.icl, c.ic);
    var combIcl = ic + c.ic;
    set("tpl-comb-icl", combIcl);
    set("tpl-comb-pct", pctN(combIcl, t + c.t));
    set(META.dse.pct, pctN(ic, t));
    set(META.cse.pct, pctN(c.ic, c.t));

    // INSTITUTE / INDIVIDUAL
    var istclS = cellNum("istcl", 0, "sale");
    var icmlB = cellNum("icml", 0, "buy"), icmlS = cellNum("icml", 0, "sale");
    var inst = setDerived("INSTITUTE TOTAL (DSE+CSE)", {
      buy: icbT.buy + asT.buy + icmlB + mtT.buy,
      sale: icbT.sale + istclS + asT.sale + icmlS + mtT.sale,
    });
    set("tpl-inst-buy", inst.buy);
    set("tpl-inst-sale", inst.sale);
    set("tpl-inst-total", inst.buy + inst.sale);

    var ind = setDerived("INDIVIDUAL TOTAL (DSE+CSE)", {
      buy: (b + c.b) - inst.buy,
      sale: (s + c.s) - inst.sale,
    });
    set("tpl-ind-buy", ind.buy);
    set("tpl-ind-sale", ind.sale);
    set("tpl-ind-total", ind.buy + ind.sale);
  }

  function setCell(secId, ri, valObj) {
    cell(secId, ri, "buy").value = fmt(valObj.buy);
    cell(secId, ri, "sale").value = fmt(valObj.sale);
    cell(secId, ri, "total").value = fmt(valObj.total);
  }

  function isoDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function fillFromData(data) {
    fallback = {};
    var dse = data.header.dse || [], cse = data.header.cse || [];
    set(META.dse.icl, dse[4] ? dse[4].value : 0);
    set(META.dse.buy, dse[5] ? dse[5].value : 0);
    set(META.dse.sale, dse[6] ? dse[6].value : 0);
    set(META.cse.idx, cse[0] ? cse[0].value : 0);
    set(META.cse.ud, cse[1] ? cse[1].value : 0);
    set(META.cse.turn, cse[2] ? cse[2].value : 0);
    set(META.cse.icl, cse[4] ? cse[4].value : 0);
    set(META.cse.buy, cse[5] ? cse[5].value : 0);
    set(META.cse.sale, cse[6] ? cse[6].value : 0);

    (data.summary || []).forEach(function (srow) {
      fallback[norm(srow.label)] = { buy: srow.buy, sale: srow.sale, total: srow.total };
    });

    var lookup = {};
    (data.sections || []).forEach(function (sec) {
      sec.rows.forEach(function (rw) {
        lookup[norm(rw.client)] = rw;
      });
    });
    ["Security Market: Dhaka Stock Exchange Ltd.", "Security Market: Chittagong Stock Exchange Ltd."].forEach(function (client) {
      var hit = lookup[norm(client)];
      if (hit) fallback[norm(client)] = { buy: hit.buy, sale: hit.sale, total: hit.total };
    });
    SECTIONS.forEach(function (sec) {
      sec.rows.forEach(function (r, ri) {
        var hit = lookup[norm(r.label)];
        if (!hit) return;
        fallback[norm(r.label)] = { buy: hit.buy, sale: hit.sale, total: hit.total };
        if (!r.derived) {
          cell(sec.id, ri, "buy").value = fmt(hit.buy);
          cell(sec.id, ri, "sale").value = fmt(hit.sale);
        }
      });
    });

    var d = el("tpl-date");
    if (d) d.value = isoDate(data.date);
    recomputeAll();
    loadLiveDse();
    loadLiveCse();
  }

  // DSE Index (DSEX) and Total DSE Turnover from dsebd.org live. Only these two.
  async function loadLiveDse() {
    try {
      var res = await fetch("/api/market");
      if (!res.ok) return;
      var data = await res.json();
      (data.indices || []).forEach(function (ix) {
        if (ix.name === "DSEX") {
          set(META.dse.idx, ix.value);
          set(META.dse.ud, ix.change);
        }
      });
      var mn = data.marketStats && data.marketStats.totalValueMn;
      if (mn == null || !isFinite(mn)) return;
      set(META.dse.turn, mn / 10); // 1 crore = 10 million
      recomputeAll();
    } catch (err) { /* keep current value */ }
  }

  // CSCX Index + Total CSE Turnover (in Tk crore) from cse.com.bd live.
  async function loadLiveCse() {
    try {
      var results = await Promise.all([
        fetch("/api/cse-cscx").then(function (r) { return r.ok ? r.json() : null; }),
        fetch("/api/cse-turnover").then(function (r) { return r.ok ? r.json() : null; }),
      ]);
      if (results[0] && results[0].value != null) {
        set(META.cse.idx, results[0].value);
        if (results[0].change != null) set(META.cse.ud, results[0].change);
      }
      if (results[1] && results[1].crore != null) set(META.cse.turn, results[1].crore);
      recomputeAll();
    } catch (err) { /* keep current value */ }
  }

  function bind() {
    var ins = root.querySelectorAll("input.amount-input");
    for (var i = 0; i < ins.length; i++) {
      ins[i].addEventListener("input", recomputeAll);
    }
  }

  function collectPayload() {
    var sections = [];
    SECTIONS.forEach(function (sec) {
      var rows = [];
      sec.rows.forEach(function (r, ri) {
        rows.push({
          label: r.label,
          derived: !!r.derived,
          buy: cellNum(sec.id, ri, "buy"),
          sale: cellNum(sec.id, ri, "sale"),
          total: cellNum(sec.id, ri, "total"),
        });
      });
      sections.push({ name: sec.name, rows: rows });
    });
    return {
      date: (el("tpl-date") || { value: "" }).value || "",
      dse: {
        idx: num(META.dse.idx), ud: num(META.dse.ud), turn: num(META.dse.turn), pct: num(META.dse.pct),
        icl: num(META.dse.icl), buy: num(META.dse.buy), sale: num(META.dse.sale),
      },
      cse: {
        idx: num(META.cse.idx), ud: num(META.cse.ud), turn: num(META.cse.turn), pct: num(META.cse.pct),
        icl: num(META.cse.icl), buy: num(META.cse.buy), sale: num(META.cse.sale),
      },
      combined: { icl: num("tpl-comb-icl"), pct: num("tpl-comb-pct") },
      inst: { buy: num("tpl-inst-buy"), sale: num("tpl-inst-sale"), total: num("tpl-inst-total") },
      ind: { buy: num("tpl-ind-buy"), sale: num("tpl-ind-sale"), total: num("tpl-ind-total") },
      sections: sections,
    };
  }

  async function requestTemplatePdf(payload) {
    var res = await fetch("/api/template-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      var msg = "Failed (" + res.status + ")";
      try { var bad = await res.json(); if (bad && bad.message) msg = bad.message; } catch (e) { /* keep */ }
      var err = new Error(msg);
      err.http = true;
      throw err;
    }
    return res.blob();
  }

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = "report-status" + (kind ? " " + kind : "");
  }

  pdfBtn.addEventListener("click", async function () {
    setStatus("Generating PDF…", "");
    try {
      recomputeAll();
      var blob = await requestTemplatePdf(collectPayload());
      var url = URL.createObjectURL(blob);
      var win = window.open(url, "_blank");
      if (!win) {
        setStatus("Pop-up blocked - allow pop-ups to preview the PDF.", "report-error");
        return;
      }
      setStatus("PDF preview opened in a new tab.", "report-ok");
    } catch (err) {
      setStatus(err.message || "PDF generation failed.", "report-error");
    }
  });

  printBtn.addEventListener("click", async function () {
    setStatus("Preparing print…", "");
    try {
      recomputeAll();
      var blob = await requestTemplatePdf(collectPayload());
      var url = URL.createObjectURL(blob);
      var win = window.open("", "_blank");
      if (!win) {
        setStatus("Pop-up blocked - allow pop-ups to print.", "report-error");
        return;
      }
      win.document.write(
        '<!doctype html><html><head><meta charset="utf-8"><title>Print - Daily Turnover</title></head>' +
        '<body style="margin:0">' +
        '<embed id="tplPdf" src="' + url + '" type="application/pdf" width="100%" height="100%" />' +
        '<script>var e=document.getElementById("tplPdf");function p(){try{window.focus();window.print();}catch(err){}}' +
        'function onLoad(){setTimeout(p,400);}if(e&&e.addEventListener){e.addEventListener("load",onLoad);}setTimeout(p,1800);</scr' + 'ipt>' +
        '</body></html>'
      );
      win.document.close();
      setStatus("Print dialog opening…", "report-ok");
    } catch (err) {
      setStatus(err.message || "Print preparation failed.", "report-error");
    }
  });

  input.addEventListener("change", async function () {
    var file = input.files && input.files[0];
    if (!file) return;
    status.textContent = "Parsing…";
    status.className = "report-status";
    try {
      var res = await fetch("/api/turnover", {
        method: "POST",
        headers: { "X-File-Name": encodeURIComponent(file.name) },
        body: file,
      });
      if (!res.ok) {
        var msg = "Failed (" + res.status + ")";
        try { var bad = await res.json(); if (bad && bad.message) msg = bad.message; } catch (e) { /* keep */ }
        status.textContent = msg;
        status.className = "report-status report-error";
        return;
      }
      var data = await res.json();
      root.hidden = false;
      fillFromData(data);
      status.textContent = "Filled from " + file.name + " (amounts in Tk crore).";
      status.className = "report-status report-ok";
    } catch (err) {
      status.textContent = "Network error - please try again.";
      status.className = "report-status report-error";
    } finally {
      input.value = "";
    }
  });

  render();
  root.hidden = false;
  recomputeAll();
  bind();
  loadLiveDse();
  loadLiveCse();
})();