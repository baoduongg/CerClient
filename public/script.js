document.addEventListener("DOMContentLoaded", () => {
  fetch("/data")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("accessTime").textContent = data.accessTime;
      document.getElementById("sourceIpAddress").textContent =
        data.sourceIpAddress;
      document.getElementById("userAgent").textContent = data.userAgent;
      document.getElementById("method").textContent = data.method;
      document.getElementById("statusCode").textContent = data.statusCode;
      document.getElementById("clientCertCN").textContent = data.clientCertCN;
      document.getElementById("clientCertIssuer").textContent =
        data.clientCertIssuer;
    })
    .catch((error) => console.error("Error fetching data:", error));
});
