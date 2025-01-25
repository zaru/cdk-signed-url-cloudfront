import * as fs from "node:fs";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const url = getSingedUrl("example.png");
console.log(url);

function getSingedUrl(path: string) {
  const url = `https://example.com/${path}`;
  const privateKey = fs.readFileSync("./keys/private.pem", "utf-8");
  return getSignedUrl({
    url,
    keyPairId: "XXXXXXXXX",
    dateLessThan: expiresAt(),
    privateKey,
  });
}

function expiresAt(minutesUntilExpiration = 10) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutesUntilExpiration);
  return date.toUTCString();
}
