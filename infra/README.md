# Wedding Scavenger Hunt — Infrastructure

AWS CDK stack (Python) that provisions the full production infrastructure:

- **Frontend**: S3 + CloudFront + ACM certificate
- **Backend**: EC2 t3.micro + Elastic IP + nginx + uvicorn
- **DNS**: Route 53 A records for both

---

## Prerequisites

- AWS CLI configured (`aws configure`) with your account credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- Python 3.9+
- An EC2 key pair created in `us-east-1` (AWS Console → EC2 → Key Pairs)
- A Route 53 hosted zone for your domain (see setup below)

---

## One-time setup

### 1. Find your Route 53 hosted zone ID

`jennproos.com` is already registered in this AWS account, so the hosted zone exists. Just look up its ID:

```bash
aws route53 list-hosted-zones --query "HostedZones[?Name=='jennproos.com.'].Id" --output text
```

The output looks like `/hostedzone/Z0123456789ABCDEFGHIJ` — the ID is the part after `/hostedzone/`.

### 2. Create an EC2 key pair

AWS Console → EC2 → Network & Security → Key Pairs → Create key pair

- Name: choose something memorable (e.g. `wedding-hunt`)
- Type: RSA, format: `.pem`
- Download and save the `.pem` file somewhere safe

### 3. Edit stack config

Open `infra/infra_stack.py` and fill in the constants at the top:

```python
DOMAIN_NAME        = "jennproos.com"
HOSTED_ZONE_ID     = "Z0123456789ABCDEFGHIJ"   # from step 1
FRONTEND_SUBDOMAIN = "wedding"                  # → wedding.jennproos.com
BACKEND_SUBDOMAIN  = "wedding-api"              # → wedding-api.jennproos.com
KEY_PAIR_NAME      = "wedding-hunt"             # EC2 key pair name
REPO_URL           = "https://github.com/you/wedding-scavenger-hunt.git"
```

### 4. Bootstrap CDK (first time only)

```bash
cd infra
source .venv/bin/activate
cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

Your account ID is in the top-right corner of the AWS Console, or run `aws sts get-caller-identity`.

---

## Deploy

```bash
cd infra
source .venv/bin/activate
cdk deploy
```

CDK will show a summary of IAM and security changes and ask for confirmation. Type `y`.

When complete, the stack outputs the values you need for subsequent steps:

| Output | Description |
|---|---|
| `FrontendUrl` | `https://www.wedding.jennproos.com` |
| `BackendUrl` | `https://wedding-api.jennproos.com` — use as `VITE_API_URL` |
| `FrontendBucketName` | S3 bucket to upload the frontend build |
| `CloudFrontDistributionId` | Used to invalidate the CDN cache after frontend deploys |
| `BackendInstanceId` | EC2 instance ID |

---

## Post-deploy steps

These can't be automated by CDK and must be done manually after the first deploy.

### 1. Enable HTTPS on the backend (certbot)

The EC2 instance starts with HTTP only. Once the `wedding-api.jennproos.com` DNS record has propagated (check with `dig wedding-api.jennproos.com`), SSH in and run certbot:

```bash
ssh -i /path/to/wedding-hunt.pem ec2-user@wedding-api.jennproos.com

# On the instance:
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d wedding-api.jennproos.com
```

Certbot will automatically update the nginx config and set up auto-renewal.

### 2. Tighten the SSH security group rule

The CDK stack opens port 22 to `0.0.0.0/0` for initial access. After deploying, restrict it to your IP:

AWS Console → EC2 → Security Groups → BackendSecurityGroup → Inbound rules → Edit

Change the SSH rule source from `0.0.0.0/0` to `My IP`.

### 3. Tighten CORS in the backend

Update `backend/main.py` to allow only your frontend domain:

```python
allow_origins=["https://www.wedding.jennproos.com"],
```

Then redeploy the backend (see below).

### 4. Deploy the frontend

```bash
cd frontend
VITE_API_URL=https://wedding-api.jennproos.com npm run build
aws s3 sync dist/ s3://BUCKET_NAME --delete
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

Replace `BUCKET_NAME` and `DISTRIBUTION_ID` with the values from the CDK stack outputs.

---

## Redeploying

**Frontend changes** — rebuild and sync to S3 (no CDK needed):
```bash
cd frontend
VITE_API_URL=https://wedding-api.jennproos.com npm run build
aws s3 sync dist/ s3://BUCKET_NAME --delete
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

**Backend changes** — SSH in and pull:
```bash
ssh -i /path/to/wedding-hunt.pem ec2-user@wedding-api.jennproos.com
cd app && git pull
sudo systemctl restart scavenger
```

**Infrastructure changes** — re-run CDK:
```bash
cd infra
source .venv/bin/activate
cdk diff    # preview changes
cdk deploy  # apply
```

---

## Useful CDK commands

```bash
cdk ls       # list stacks
cdk synth    # preview CloudFormation template without deploying
cdk diff     # compare deployed stack with local changes
cdk destroy  # tear down all resources (prompts for confirmation)
```

## Running infra tests

```bash
cd infra
source .venv/bin/activate
pytest tests/
```
