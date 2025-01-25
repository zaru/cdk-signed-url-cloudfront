import * as cdk from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";

export class AcmStack extends cdk.Stack {
  public readonly certificate: Certificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, "AppHostedZone", {
      domainName: "example.com",
    });

    this.certificate = new Certificate(this, "AppCertificate", {
      domainName: "example.com",
      validation: CertificateValidation.fromDns(hostedZone),
    });
  }
}
