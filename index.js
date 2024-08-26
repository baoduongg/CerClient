const express = require("express");
const path = require("path");
const https = require("https");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.static("public"));
// Load the self-signed certificate and private key
const key = fs.readFileSync(path.join(__dirname, "cer/client.key"));
const cert = fs.readFileSync(path.join(__dirname, "cer/client.crt"));

const options = {
  key: key,
  cert: cert,
  requestCert: true,
  rejectUnauthorized: false, // Set to false for self-signed certificates
};

app.get("/data", (req, res) => {
  const cert = req.socket.getPeerCertificate();
  console.log(cert);

  let clientCertCN = "N/A";
  let clientCertIssuer = "N/A";
  if (cert && cert.subject && cert.issuer) {
    clientCertCN = cert.subject.CN || "N/A";
    clientCertIssuer = cert.issuer.CN || "N/A";
  } else {
    const data = {
      accessTime: "NA",
      sourceIpAddress: "NA",
      userAgent: "NA",
      method: "NA",
      statusCode: "NA",
      clientCertCN: "NA",
      clientCertIssuer: "NA",
    };
    return res.json(data);
  }
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(/, /)[0] : req.ip;

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
// https.createServer(options, app).listen(port, () => {
//   console.log(`Server is running at https://localhost:${port}`);
// });
