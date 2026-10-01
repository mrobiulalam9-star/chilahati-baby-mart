(function () {
  "use strict";
  var input = document.getElementById("reportFile");
  var status = document.getElementById("reportStatus");
  if (!input || !status) return;

  input.addEventListener("change", async function () {
    var file = input.files && input.files[0];
    if (!file) return;

    status.textContent = "Generating PDF…";
    status.className = "report-status";

    try {
      var res = await fetch("/api/report", {
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

      var blob = await res.blob();
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      var base = file.name.replace(/\.[^.]+$/, "") || "report";
      a.href = url;
      a.download = base + "-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      status.textContent = "PDF downloaded.";
      status.className = "report-status report-ok";
    } catch (err) {
      status.textContent = "Network error - please try again.";
      status.className = "report-status report-error";
    } finally {
      input.value = "";
    }
  });
})();