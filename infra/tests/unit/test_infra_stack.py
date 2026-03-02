import aws_cdk as core
import aws_cdk.assertions as assertions

from infra.infra_stack import WeddingScavengerHuntInfraStack


def _make_stack() -> WeddingScavengerHuntInfraStack:
    app = core.App()
    return WeddingScavengerHuntInfraStack(app, "infra")


def test_s3_bucket_created():
    template = assertions.Template.from_stack(_make_stack())
    template.resource_count_is("AWS::S3::Bucket", 1)
    template.has_resource_properties("AWS::S3::Bucket", {
        "PublicAccessBlockConfiguration": {
            "BlockPublicAcls": True,
            "BlockPublicPolicy": True,
            "IgnorePublicAcls": True,
            "RestrictPublicBuckets": True,
        }
    })


def test_cloudfront_distribution_created():
    template = assertions.Template.from_stack(_make_stack())
    template.resource_count_is("AWS::CloudFront::Distribution", 1)
    template.has_resource_properties("AWS::CloudFront::Distribution", {
        "DistributionConfig": assertions.Match.object_like({
            "DefaultRootObject": "index.html",
            "CustomErrorResponses": assertions.Match.array_with([
                assertions.Match.object_like({
                    "ErrorCode": 403,
                    "ResponseCode": 200,
                    "ResponsePagePath": "/index.html",
                }),
                assertions.Match.object_like({
                    "ErrorCode": 404,
                    "ResponseCode": 200,
                    "ResponsePagePath": "/index.html",
                }),
            ]),
        })
    })


def test_cloudfront_enforces_https():
    template = assertions.Template.from_stack(_make_stack())
    template.has_resource_properties("AWS::CloudFront::Distribution", {
        "DistributionConfig": assertions.Match.object_like({
            "DefaultCacheBehavior": assertions.Match.object_like({
                "ViewerProtocolPolicy": "redirect-to-https",
            })
        })
    })


def test_acm_certificate_created():
    template = assertions.Template.from_stack(_make_stack())
    template.resource_count_is("AWS::CertificateManager::Certificate", 1)
    template.has_resource_properties("AWS::CertificateManager::Certificate", {
        "ValidationMethod": "DNS",
    })


def test_ec2_instance_is_t3_micro():
    template = assertions.Template.from_stack(_make_stack())
    template.has_resource_properties("AWS::EC2::Instance", {
        "InstanceType": "t3.micro",
    })


def test_security_group_allows_http_and_https():
    template = assertions.Template.from_stack(_make_stack())
    template.has_resource_properties("AWS::EC2::SecurityGroup", {
        "SecurityGroupIngress": assertions.Match.array_with([
            assertions.Match.object_like({
                "IpProtocol": "tcp",
                "FromPort": 80,
                "ToPort": 80,
            }),
            assertions.Match.object_like({
                "IpProtocol": "tcp",
                "FromPort": 443,
                "ToPort": 443,
            }),
        ])
    })


def test_elastic_ip_created():
    template = assertions.Template.from_stack(_make_stack())
    template.resource_count_is("AWS::EC2::EIP", 1)


def test_route53_has_frontend_alias_record():
    """Frontend A record points to CloudFront via alias."""
    template = assertions.Template.from_stack(_make_stack())
    template.has_resource_properties("AWS::Route53::RecordSet", {
        "Type": "A",
        "AliasTarget": assertions.Match.any_value(),
    })


def test_route53_has_backend_ip_record():
    """Backend A record points directly to Elastic IP."""
    template = assertions.Template.from_stack(_make_stack())
    template.has_resource_properties("AWS::Route53::RecordSet", {
        "Type": "A",
        "ResourceRecords": assertions.Match.any_value(),
    })
