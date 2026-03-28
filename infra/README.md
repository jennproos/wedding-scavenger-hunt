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
| `SsmSetupInstructions` | The exact `aws ssm put-parameter` commands to run (see next section) |

---

## Post-deploy steps

These can't be automated by CDK and must be done manually after the first deploy.

### 1. Set secrets in SSM Parameter Store

Stage codes and the admin secret are stored in SSM Parameter Store — **not** in the CDK stack — so you can update them anytime without redeploying.

Run these once after the first deploy, substituting the 4-digit codes you'll print on the venue cards:

```bash
aws ssm put-parameter --name /wedding-scavenger/stage-1-code --value 1234 --type String --overwrite
aws ssm put-parameter --name /wedding-scavenger/stage-2-code --value 5678 --type String --overwrite
aws ssm put-parameter --name /wedding-scavenger/stage-3-code --value 9012 --type String --overwrite
aws ssm put-parameter --name /wedding-scavenger/stage-4-code --value 3456 --type String --overwrite
aws ssm put-parameter --name /wedding-scavenger/stage-5-code --value 7890 --type String --overwrite
aws ssm put-parameter --name /wedding-scavenger/admin-secret --value YOUR_SECRET --type SecureString --overwrite
```

> **Why not CDK?** If CDK managed these values, every `cdk deploy` would overwrite them back to placeholder values. Keeping them out of CDK means you're in full control.

The `/wedding-scavenger/leaderboard-bucket` parameter is set automatically by CDK (it's just the S3 bucket name, not a secret).

### 2. Verify the backend started correctly

The EC2 user data script runs on first boot to clone the repo and start services. SSH in to confirm everything is running:

```bash
ssh -i ~/.ssh/wedding-hunt.pem ec2-user@98.88.143.83
sudo systemctl status scavenger
sudo systemctl status nginx
```

Both should show `active (running)`. If either has failed, see **Troubleshooting** below.

### 3. Verify HTTPS on the backend (certbot)

Certbot runs automatically during first boot via the user data script (DNS-01 challenge via Route 53). Check that it succeeded:

```bash
sudo cat /var/log/cloud-init-output.log | grep -A3 -i "successfully received"
sudo ls /etc/letsencrypt/live/wedding-api.jennproos.com/
```

You should see `fullchain.pem` and `privkey.pem`. If certbot failed, check the full log:

```bash
sudo tail -50 /var/log/cloud-init-output.log
```

If you need to run it manually:

```bash
sudo certbot certonly --dns-route53 --non-interactive --agree-tos --email noreply@jennproos.com -d wedding-api.jennproos.com
sudo certbot install --nginx -d wedding-api.jennproos.com
```

### 4. Tighten the SSH security group rule

The CDK stack opens port 22 to `0.0.0.0/0` for initial access. After deploying, restrict it to your IP:

AWS Console → EC2 → Security Groups → BackendSecurityGroup → Inbound rules → Edit

Change the SSH rule source from `0.0.0.0/0` to `My IP`.

### 5. Tighten CORS in the backend

Update `backend/main.py` to allow only your frontend domain:

```python
allow_origins=["https://wedding.jennproos.com"],
```

Then redeploy the backend (see below).

### 6. Deploy the frontend

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

**Stage codes or admin secret** — update SSM, then restart the service (no redeploy, no SSH into the app needed):
```bash
# Update the value in SSM
aws ssm put-parameter \
  --name /wedding-scavenger/stage-1-code \
  --value 4242 \
  --type String \
  --overwrite

# Restart the service so it re-fetches from SSM
ssh -i /path/to/wedding-hunt.pem ec2-user@wedding-api.jennproos.com \
  "sudo systemctl restart scavenger"
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

Write the fetch-scavenger-config script and make it executable — use `sudo nano /usr/local/bin/fetch-scavenger-config` and paste the contents from `infra/infra/infra_stack.py` (the `SCRIPT` heredoc inside `_backend_user_data`). Then:

```bash
sudo chmod +x /usr/local/bin/fetch-scavenger-config
sudo /usr/local/bin/fetch-scavenger-config
```

Write the systemd service using `sudo nano /etc/systemd/system/scavenger.service`:

```
[Unit]
Description=Wedding Scavenger Hunt API
After=network.target

[Service]
WorkingDirectory=/home/ec2-user/app/backend
ExecStartPre=+/usr/local/bin/fetch-scavenger-config
ExecStart=/usr/local/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
User=ec2-user
EnvironmentFile=/etc/scavenger.env

[Install]
WantedBy=multi-user.target
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

---

## Running infra tests

```bash
cd infra
source .venv/bin/activate
pytest tests/
```
