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
HOSTED_ZONE_ID     = "Z0123456789ABCDEFGHIJ"                             # from step 1
FRONTEND_SUBDOMAIN = "wedding"                                           # → wedding.jennproos.com
BACKEND_SUBDOMAIN  = "wedding-api"                                       # → wedding-api.jennproos.com
KEY_PAIR_NAME      = "wedding-hunt"                                      # EC2 key pair name
REPO_URL           = "https://github.com/jennproos/wedding-scavenger-hunt.git"
```

> **Important:** `REPO_URL` must use HTTPS (not SSH) — the EC2 instance has no GitHub SSH keys.

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
| `FrontendUrl` | `https://wedding.jennproos.com` |
| `BackendUrl` | `https://wedding-api.jennproos.com` — use as `VITE_API_URL` |
| `FrontendBucketName` | `weddingscavengerhuntinfrast-frontendbucketefe2e19c-m2xx3fo8a4mt` |
| `CloudFrontDistributionId` | `E3S1IB6803P3BA` |
| `BackendInstanceId` | `i-04f511a9137ef2f5c` |

---

## Post-deploy steps

These can't be automated by CDK and must be done manually after the first deploy.

### 1. Verify the backend started correctly

The EC2 user data script runs on first boot to clone the repo and start services. SSH in to confirm everything is running:

```bash
ssh -i ~/.ssh/wedding-hunt.pem ec2-user@98.88.143.83
sudo systemctl status scavenger
sudo systemctl status nginx
```

Both should show `active (running)`. If either has failed, see **Troubleshooting** below.

### 2. Enable HTTPS on the backend (certbot)

Once `wedding-api.jennproos.com` DNS has propagated (check with `dig wedding-api.jennproos.com`), run certbot on the instance:

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d wedding-api.jennproos.com
```

Certbot will automatically update the nginx config and set up auto-renewal.

### 3. Tighten the SSH security group rule

The CDK stack opens port 22 to `0.0.0.0/0` for initial access. After deploying, restrict it to your IP:

AWS Console → EC2 → Security Groups → BackendSecurityGroup → Inbound rules → Edit

Change the SSH rule source from `0.0.0.0/0` to `My IP`.

### 4. Tighten CORS in the backend

Update `backend/main.py` to allow only your frontend domain:

```python
allow_origins=["https://wedding.jennproos.com"],
```

Then redeploy the backend (see below).

### 5. Deploy the frontend

```bash
cd frontend
VITE_API_URL=https://wedding-api.jennproos.com npm run build
aws s3 sync dist/ s3://weddingscavengerhuntinfrast-frontendbucketefe2e19c-m2xx3fo8a4mt --delete
aws cloudfront create-invalidation --distribution-id E3S1IB6803P3BA --paths "/*"
```

---

## Redeploying

**Frontend changes** — rebuild and sync to S3 (no CDK needed):
```bash
cd frontend
VITE_API_URL=https://wedding-api.jennproos.com npm run build
aws s3 sync dist/ s3://weddingscavengerhuntinfrast-frontendbucketefe2e19c-m2xx3fo8a4mt --delete
aws cloudfront create-invalidation --distribution-id E3S1IB6803P3BA --paths "/*"
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

## Troubleshooting

### Backend user data script failed on first boot

The EC2 user data runs once on launch. If it failed (e.g. due to a bad `REPO_URL`), the services won't be running. Set them up manually:

```bash
ssh -i ~/.ssh/wedding-hunt.pem ec2-user@98.88.143.83

# Clone repo
cd /home/ec2-user
git clone https://github.com/jennproos/wedding-scavenger-hunt.git app
cd app/backend
pip3 install -r requirements.txt
```

Write the systemd service (run as one unbroken line):

```bash
printf '[Unit]\nDescription=Wedding Scavenger Hunt API\nAfter=network.target\n\n[Service]\nWorkingDirectory=/home/ec2-user/app/backend\nExecStart=/home/ec2-user/.local/bin/uvicorn main:app --host 127.0.0.1 --port 8000\nRestart=always\nUser=ec2-user\n\n[Install]\nWantedBy=multi-user.target\n' | sudo tee /etc/systemd/system/scavenger.service
```

Write the nginx config (run as one unbroken line):

```bash
sudo python3 -c "open('/etc/nginx/conf.d/scavenger.conf','w').write('server {\n    listen 80;\n    server_name wedding-api.jennproos.com;\n\n    location / {\n        proxy_pass http://127.0.0.1:8000;\n        proxy_set_header Host \$host;\n        proxy_set_header X-Real-IP \$remote_addr;\n        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto \$scheme;\n    }\n}\n')"
```

Start everything:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now scavenger
sudo nginx -t && sudo systemctl enable --now nginx
```

### Uvicorn path

pip3 installs uvicorn to `~/.local/bin/uvicorn` (`/home/ec2-user/.local/bin/uvicorn`), not `/usr/local/bin/uvicorn`. If the scavenger service fails with `status=203/EXEC`, the path in the service file is wrong. Fix with:

```bash
sudo sed -i '/ExecStart=/,/main:app/d' /etc/systemd/system/scavenger.service
sudo sed -i '/WorkingDirectory/a ExecStart=/home/ec2-user/.local/bin/uvicorn main:app --host 127.0.0.1 --port 8000' /etc/systemd/system/scavenger.service
sudo systemctl daemon-reload && sudo systemctl restart scavenger
```

---

## Running infra tests

```bash
cd infra
source .venv/bin/activate
pytest tests/
```
