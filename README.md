## 秘密鍵と公開鍵の生成

```bash
mkdir keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -pubout -in keys/private.pem -out keys/public.pem
```

## CDKのデプロイ

```bash
npx cdk bootstrap
npx cdk deploy --all

# 全部破棄する場合
npx cdk destroy --all
```

## 署名付きURL発行

```bash
# URL発行
npx tsx getSignedUrl.ts

# ファイルアップロード
curl -X PUT \
     -H "Content-Type: image/png" \
     --data-binary "@example.png" \
     "https://example.com/example.png?Expires=1737780542&Key-Pair-Id=XXXXX&Signature=......"
```
