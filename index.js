const express = require("express");
const path = require("path");
const https = require("https");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.static("public"));

// Load the self-signed certificate and private key
const key = fs.readFileSync(path.join(__dirname, "cer/private-key.pem"));
const cert = fs.readFileSync(path.join(__dirname, "cer/certificate.pem"));

const options = {
  key: key,
  cert: cert,
  requestCert: true,
  rejectUnauthorized: false, // Set to false for self-signed certificates
};

app.get("/data", (req, res) => {
  const cert = req.socket.getPeerCertificate();

  let clientCertCN = "N/A";
  let clientCertIssuer = "N/A";
  console.log(cert);
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
// Define the route to download the file
app.get("/download", async (req, res) => {
  const filePath = path.join(__dirname, "cer", "Certificate.p12");
  res.download(filePath, "Certificate.p12", (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send("Error downloading the file");
    } else {
      console.log("File downloaded successfully");
    }
  });
});
https.createServer(options, app).listen(port, () => {
  console.log(`Server is running at https://localhost:${port}`);
});

// # Generate a private key
// openssl genrsa -out private-key.pem 2048

// # Create a certificate signing request (CSR)
// openssl req -new -key private-key.pem -out cert-request.csr

// # Generate a self-signed certificate
// openssl x509 -req -days 365 -in cert-request.csr -signkey private-key.pem -out certificate.pem

// # Export the key and certificate to a .p12 file
// openssl pkcs12 -export -legacy -out Certificate.p12 -in certificate.pem -inkey private-key.pem

// openssl pkcs12 -export -legacy -out Certificate.p12 -in certificate.pem -inkey private-key.pem

//openssl x509 -req -days 365 -in certificate.csr -signkey private-key.pem -out certificate.pem
