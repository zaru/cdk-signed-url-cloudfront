import * as fs from "node:fs";
import * as cdk from "aws-cdk-lib";
import { RemovalPolicy, type StackProps } from "aws-cdk-lib";
import type { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  HttpVersion,
  KeyGroup,
  OriginRequestPolicy,
  PriceClass,
  PublicKey,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";

interface CloudfrontStackProps extends StackProps {
  certificate: Certificate;
}
export class CloudfrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CloudfrontStackProps) {
    super(scope, id, props);

    // S3バケット作成
    const bucket = new Bucket(this, "Bucket", {
      bucketName: "signed-url-cloudfront-example-2025",
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // 公開鍵の登録とキーグループ作成
    const publicKeyContent = fs.readFileSync("keys/public.pem", "utf-8");
    const publicKey = new PublicKey(this, "SignedUrlPublicKey", {
      encodedKey: publicKeyContent,
      comment: "UploadFile S3 Public Key",
    });
    const keyGroup = new KeyGroup(this, "SignedUrlKeyGroup", {
      keyGroupName: "ExampleS3PublicKeyGroup",
      items: [publicKey],
    });

    // CloudFrontディストリビューションの作成
    const distribution = new Distribution(this, "CF", {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
        trustedKeyGroups: [keyGroup],
      },
      httpVersion: HttpVersion.HTTP2_AND_3,
      priceClass: PriceClass.PRICE_CLASS_200,
      domainNames: ["example.com"],
      certificate: props.certificate, // 事前にACMで取得した証明書
    });

    // CloudFrontが発行する署名付きURLでS3にファイルアップロードするための権限を追加
    const distributionArn = this.formatArn({
      service: "cloudfront",
      resource: `distribution/${distribution.distributionId}`,
      region: "",
    });
    bucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
        actions: ["s3:PutObject"],
        resources: [bucket.arnForObjects("*")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": distributionArn,
          },
        },
      }),
    );
  }
}
