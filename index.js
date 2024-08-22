const express = require("express");
const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/data", (req, res) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(/, /)[0] : req.ip;

  let clientCertCN = "N/A";
  let clientCertIssuer = "N/A";

  if (req.secure && req.socket.getPeerCertificate) {
    const cert = req.socket.getPeerCertificate();
    if (cert && cert.subject && cert.issuer) {
      clientCertCN = cert.subject.CN || "N/A";
      clientCertIssuer = cert.issuer.CN || "N/A";
    }
  }

  const data = {
    accessTime: new Date().toISOString(),
    sourceIpAddress: ip,
    userAgent: req.get("User-Agent"),
    method: req.method,
    statusCode: res.statusCode,
    clientCertCN: clientCertCN,
    clientCertIssuer: clientCertIssuer,
  };
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
