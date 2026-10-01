(function () {
  "use strict";

  var input = document.getElementById("turnoverFile");
  var status = document.getElementById("turnoverStatus");
  var wrap = document.getElementById("turnoverTable");
  if (!input || !status || !wrap) return;

  function fmt(n) {
    var v = Number(n);
    if (!isFinite(v)) return "0.00";
    return v.toFixed(2);
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function rowHtml(tag, cells, opts) {
    var cls = opts && opts.cls ? ' class="' + opts.cls + '"' : "";
    var html = "<tr" + cls + ">";
    cells.forEach(function (c) {
      html += "<" + tag + (c.align ? ' style="text-align:' + c.align + '"' : "") + ">" + c.text + "</" + tag + ">";
    });
    return html + "</tr>";
  }

  function tdHtml(align, content, cls) {
    return (
      "<td" +
      (align ? ' style="text-align:' + align + '"' : "") +
      (cls ? ' class="' + cls + '"' : "") +
      ">" +
      content +
      "</td>"
    );
  }

  function amountInput(value, kind) {
    return (
      '<input type="number" min="0" step="0.01" class="amount-input amount-' +
      kind +
      '" value="' +
      fmt(value) +
      '" />'
    );
  }

  function metricRow(m) {
    var cls = "metric-value";
    if (/up\/down/i.test(m.label)) {
      cls += m.value < 0 ? " neg" : m.value > 0 ? " pos" : "";
    }
    return (
      '<div class="metric"><span class="metric-label">' +
      escapeHtml(m.label) +
      '</span><span class="' +
      cls +
      '">' +
      (m.isPercent ? fmt(m.value) + "%" : fmt(m.value)) +
      "</span></div>"
    );
  }

  function renderDseCse(header) {
    var html = '<div class="dse-cse">';
    html += '<div class="dse-cse-col"><h4>DSE</h4>';
    (header.dse || []).forEach(function (m) { html += metricRow(m); });
    html += "</div>";
    html += '<div class="dse-cse-col"><h4>CSE</h4>';
    (header.cse || []).forEach(function (m) { html += metricRow(m); });
    html += "</div></div>";
    return html;
  }

  function renderTable(data) {
    var secs = data.sections || [];
    var summary = data.summary || [];
    var grand = data.grand || { buy: 0, sale: 0, total: 0 };

    var html = "";

    html += '<div class="turnover-head">';
    html += "<h3>" + escapeHtml(data.company || "ISTCL") + "</h3>";
    html += "</div>";
    html += '<div class="turnover-date-line">';
    if (data.date) html += '<span class="turnover-date">' + fmtDate(data.date) + "</span>";
    if (data.units) html += '<span class="turnover-units">' + escapeHtml(data.units) + "</span>";
    html += "</div>";

    if (data.header && ((data.header.dse || []).length || (data.header.cse || []).length)) {
      html += renderDseCse(data.header);
    }

    if (summary.length) {
      html += '<table class="turnover-table turnover-summary">';
      html += "<thead><tr><th>Category</th><th class=\"num\">Buy</th><th class=\"num\">Sale</th><th class=\"num\">TOTAL(BUY+SALE)</th></tr></thead>";
      html += "<tbody>";
      summary.forEach(function (s) {
        html +=
          "<tr class=\"turnover-sum-row\">" +
          tdHtml("left", escapeHtml(s.label)) +
          tdHtml("right", amountInput(s.buy, "buy")) +
          tdHtml("right", amountInput(s.sale, "sale")) +
          tdHtml("right", amountInput(s.total, "total")) +
          "</tr>";
      });
      html += "</tbody></table>";
    }

    html += '<div class="turnover-scroll"><table class="turnover-table">';
    html += "<thead><tr><th class=\"col-no\">#</th><th>Client</th><th class=\"num\">Buy</th><th class=\"num\">Sale</th><th class=\"num\">TOTAL(BUY+SALE)</th></tr></thead>";
    html += "<tbody>";

    var n = 0;
    var grandRowSeen = false;
    secs.forEach(function (sec) {
      if (!sec.rows || !sec.rows.length) return;
      html += rowHtml("td", [{ text: escapeHtml(sec.name), align: "left" }], { cls: "turnover-section" });
      sec.rows.forEach(function (row) {
        if (/securitymarket/.test(String(row.client || "").toLowerCase().replace(/\s+/g, ""))) return;
        var isTotal = sec.isTotal || /^TOTAL\b/.test(row.client);
        n += 1;
        html +=
          '<tr' + (isTotal ? ' class="turnover-total"' : "") + ">" +
          tdHtml("right", isTotal ? "" : String(n)) +
          tdHtml("left", escapeHtml(row.client)) +
          tdHtml("right", amountInput(row.buy, "buy")) +
          tdHtml("right", amountInput(row.sale, "sale")) +
          tdHtml("right", amountInput(row.total, "total")) +
          "</tr>";
        if (isTotal) grandRowSeen = true;
      });
    });

    if (!grandRowSeen) {
      html += rowHtml("td", [
        { text: "", align: "right" },
        { text: "TOTAL", align: "left" },
        { text: fmt(grand.buy), align: "right" },
        { text: fmt(grand.sale), align: "right" },
        { text: fmt(grand.total), align: "right" },
      ], { cls: "turnover-total" });
    }

    html += "</tbody></table></div>";
    return html;
  }

  function bindAmounts() {
    var rows = wrap.querySelectorAll("tr");
    for (var i = 0; i < rows.length; i++) {
      (function (tr) {
        var buy = tr.querySelector(".amount-buy");
        var sale = tr.querySelector(".amount-sale");
        var total = tr.querySelector(".amount-total");
        if (!buy || !sale || !total) return;
        function recalc() {
          var b = parseFloat(buy.value);
          var s = parseFloat(sale.value);
          if (isNaN(b)) b = 0;
          if (isNaN(s)) s = 0;
          total.value = (b + s).toFixed(2);
        }
        buy.addEventListener("input", recalc);
        sale.addEventListener("input", recalc);
      })(rows[i]);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // DSE Index (DSEX) and Total DSE Turnover from dsebd.org live. Only these two.
  function fillLiveDse() {
    var metrics = wrap.querySelectorAll(".dse-cse-col .metric");
    if (!metrics.length) return;
    fetch("/api/market")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        for (var i = 0; i < metrics.length; i++) {
          var label = metrics[i].querySelector(".metric-label");
          var span = metrics[i].querySelector(".metric-value");
          if (!label || !span) continue;
          if (/DSE Index \(DSEX\)|up\/down/i.test(label.textContent)) {
            for (var k = 0; k < (data.indices || []).length; k++) {
              if (data.indices[k].name === "DSEX") {
                var ix = data.indices[k];
                var isUd = /up\/down/i.test(label.textContent);
                span.textContent = (isUd ? ix.change : ix.value).toFixed(2);
                if (isUd) {
                  span.className = span.className.replace(/\b(neg|pos)\b/g, "").trim();
                  span.className += " " + (ix.change < 0 ? "neg" : ix.change > 0 ? "pos" : "");
                }
              }
            }
          } else if (/Total DSE Turnover/i.test(label.textContent)) {
            var mn = data.marketStats && data.marketStats.totalValueMn;
            if (mn != null && isFinite(mn)) span.textContent = (mn / 10).toFixed(2); // 1 crore = 10 million
          }
        }
      })
      .catch(function () { /* keep file values */ });
  }

  input.addEventListener("change", async function () {
    var file = input.files && input.files[0];
    if (!file) return;

    status.textContent = "Parsing turnover…";
    status.className = "report-status";
    wrap.hidden = true;

    try {
      var res = await fetch("/api/turnover", {
        method: "POST",
        headers: { "X-File-Name": encodeURIComponent(file.name) },
        body: file,
      });

      if (!res.ok) {
        var msg = "Failed (" + res.status + ")";
        try {
          var data = await res.json();
          if (data && data.message) msg = data.message;
        } catch (e) { /* not JSON */ }
        status.textContent = msg;
        status.className = "report-status report-error";
        return;
      }

      var data = await res.json();
      wrap.innerHTML = renderTable(data);
      bindAmounts();
      fillLiveDse();
      wrap.hidden = false;
      status.textContent = "Loaded " + (data.sections || []).length + " sections.";
      status.className = "report-status report-ok";
    } catch (err) {
      status.textContent = "Network error - please try again.";
      status.className = "report-status report-error";
    } finally {
      input.value = "";
    }
  });
})();