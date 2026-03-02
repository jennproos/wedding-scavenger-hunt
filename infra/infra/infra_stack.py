from aws_cdk import (
    Stack,
    RemovalPolicy,
    CfnOutput,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_ec2 as ec2,
    aws_route53 as route53,
    aws_route53_targets as targets,
    aws_certificatemanager as acm,
)
from constructs import Construct

# ── Edit these before deploying ───────────────────────────────────────────────
DOMAIN_NAME = "jennproos.com"
HOSTED_ZONE_ID = "Z02192831Z3UKRWI2NPD8"         # Route 53 hosted zone ID for jennproos.com
FRONTEND_SUBDOMAIN = "wedding"         # → wedding.jennproos.com
BACKEND_SUBDOMAIN = "wedding-api"      # → wedding-api.jennproos.com
KEY_PAIR_NAME = "wedding-hunt"        # EC2 key pair name (create in AWS Console first)
REPO_URL = "https://github.com/you/wedding-scavenger-hunt.git"
# ──────────────────────────────────────────────────────────────────────────────


def _backend_user_data() -> str:
    """EC2 user data: installs Python, clones repo, starts uvicorn + nginx."""
    return f"""#!/bin/bash
set -euo pipefail

dnf update -y
dnf install -y python3-pip git nginx

# Clone repository
cd /home/ec2-user
git clone {REPO_URL} app
chown -R ec2-user:ec2-user app

# Install backend dependencies
cd app/backend
pip3 install -r requirements.txt

# Systemd service for uvicorn
cat > /etc/systemd/system/scavenger.service << 'EOF'
[Unit]
Description=Wedding Scavenger Hunt API
After=network.target

[Service]
WorkingDirectory=/home/ec2-user/app/backend
ExecStart=/usr/local/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
User=ec2-user

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now scavenger

# Nginx reverse proxy (HTTP only — add HTTPS via certbot after DNS propagates)
cat > /etc/nginx/conf.d/scavenger.conf << 'EOF'
server {{
    listen 80;
    server_name {BACKEND_SUBDOMAIN}.{DOMAIN_NAME};

    location / {{
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}
}}
EOF

systemctl enable --now nginx

# After DNS propagates, SSH in and run:
#   sudo dnf install -y certbot python3-certbot-nginx
#   sudo certbot --nginx -d {BACKEND_SUBDOMAIN}.{DOMAIN_NAME}
"""


class InfraStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ── Route 53 hosted zone (must already exist) ─────────────────────────
        hosted_zone = route53.HostedZone.from_hosted_zone_attributes(
            self, "HostedZone",
            hosted_zone_id=HOSTED_ZONE_ID,
            zone_name=DOMAIN_NAME,
        )

        # ── ACM certificate for CloudFront (stack must be in us-east-1) ───────
        certificate = acm.Certificate(self, "FrontendCertificate",
            domain_name=f"{FRONTEND_SUBDOMAIN}.{DOMAIN_NAME}",
            validation=acm.CertificateValidation.from_dns(hosted_zone),
        )

        # ── S3 bucket for frontend static files ───────────────────────────────
        frontend_bucket = s3.Bucket(self, "FrontendBucket",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
        )

        # ── CloudFront distribution ────────────────────────────────────────────
        distribution = cloudfront.Distribution(self, "FrontendDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(frontend_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            default_root_object="index.html",
            domain_names=[f"{FRONTEND_SUBDOMAIN}.{DOMAIN_NAME}"],
            certificate=certificate,
            # SPA routing: serve index.html on 403/404 so React Router works
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                ),
            ],
        )

        # ── Route 53: frontend → CloudFront ───────────────────────────────────
        route53.ARecord(self, "FrontendDnsRecord",
            zone=hosted_zone,
            record_name=FRONTEND_SUBDOMAIN,
            target=route53.RecordTarget.from_alias(
                targets.CloudFrontTarget(distribution)
            ),
        )

        # ── VPC: single public subnet, no NAT gateway ─────────────────────────
        vpc = ec2.Vpc(self, "Vpc",
            max_azs=1,
            nat_gateways=0,
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    name="Public",
                    subnet_type=ec2.SubnetType.PUBLIC,
                    cidr_mask=24,
                )
            ],
        )

        # ── Security group ────────────────────────────────────────────────────
        backend_sg = ec2.SecurityGroup(self, "BackendSecurityGroup",
            vpc=vpc,
            description="Wedding scavenger hunt backend",
        )
        backend_sg.add_ingress_rule(ec2.Peer.any_ipv4(), ec2.Port.tcp(80), "HTTP")
        backend_sg.add_ingress_rule(ec2.Peer.any_ipv4(), ec2.Port.tcp(443), "HTTPS")
        backend_sg.add_ingress_rule(
            ec2.Peer.any_ipv4(), ec2.Port.tcp(22),
            "SSH — tighten to your IP in the console after deploy",
        )

        # ── EC2 instance ──────────────────────────────────────────────────────
        instance = ec2.Instance(self, "BackendInstance",
            vpc=vpc,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PUBLIC),
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.T3, ec2.InstanceSize.MICRO
            ),
            machine_image=ec2.MachineImage.latest_amazon_linux2023(),
            security_group=backend_sg,
            key_pair=ec2.KeyPair.from_key_pair_name(self, "KeyPair", KEY_PAIR_NAME),
            user_data=ec2.UserData.custom(_backend_user_data()),
        )

        # ── Elastic IP ────────────────────────────────────────────────────────
        eip = ec2.CfnEIP(self, "BackendEIP", domain="vpc")
        ec2.CfnEIPAssociation(self, "BackendEIPAssociation",
            allocation_id=eip.attr_allocation_id,
            instance_id=instance.instance_id,
        )

        # ── Route 53: backend → Elastic IP ────────────────────────────────────
        route53.ARecord(self, "BackendDnsRecord",
            zone=hosted_zone,
            record_name=BACKEND_SUBDOMAIN,
            target=route53.RecordTarget.from_ip_addresses(eip.ref),
        )

        # ── Outputs ───────────────────────────────────────────────────────────
        CfnOutput(self, "FrontendUrl",
            value=f"https://{FRONTEND_SUBDOMAIN}.{DOMAIN_NAME}",
            description="Frontend URL",
        )
        CfnOutput(self, "BackendUrl",
            value=f"https://{BACKEND_SUBDOMAIN}.{DOMAIN_NAME}",
            description="Backend API URL — set as VITE_API_URL when building frontend",
        )
        CfnOutput(self, "FrontendBucketName",
            value=frontend_bucket.bucket_name,
            description="S3 bucket — run: aws s3 sync frontend/dist/ s3://BUCKET_NAME",
        )
        CfnOutput(self, "CloudFrontDistributionId",
            value=distribution.distribution_id,
            description="Invalidate cache after frontend deploy: aws cloudfront create-invalidation --distribution-id ID --paths '/*'",
        )
        CfnOutput(self, "BackendInstanceId",
            value=instance.instance_id,
            description="EC2 instance ID",
        )
