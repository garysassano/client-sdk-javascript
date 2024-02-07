import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {BillingMode} from 'aws-cdk-lib/aws-dynamodb'; // Importing DynamoDB

export class MomentoCDT extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const momentoApiKeyParam = new cdk.CfnParameter(this, 'MomentoApiKey', {
      type: 'String',
      description: 'The Momento API key that will be used to read from the cache.',
      noEcho: true,
    });

    const apiKeySecret = new secrets.Secret(this, 'MomentoCDTApiKey', {
      secretName: 'MomentoCDTApiKey',
      secretStringValue: new cdk.SecretValue(momentoApiKeyParam.valueAsString),
    });

    const metricsTable = new dynamodb.Table(this, "CoursesComments", {
      tableName: 'metrics',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const getLambda = new lambdaNodejs.NodejsFunction(this, 'MomentoCDT', {
      functionName: 'MomentoCDT',
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../lambda/dict/handler.ts'),
      projectRoot: path.join(__dirname, '../../lambda/dict'),
      depsLockFilePath: path.join(__dirname, '../../lambda/dict/package-lock.json'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        MOMENTO_API_KEY_SECRET_NAME: apiKeySecret.secretName,
        GRPC_TRACE: "call_stream,resolving_load_balancer,dns_resolver",
        GRPC_VERBOSITY: "DEBUG",
      },
    });

    metricsTable.grantReadWriteData(getLambda);
    apiKeySecret.grantRead(getLambda);
  }
}
