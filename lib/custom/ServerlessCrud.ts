import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as path from 'path';

type Props = {
  table: {
    name: string;
    partitionKey: {
      name: string;
    };
  }
  api: {
    name: string;
    path: string;
  }
  lambdas: {
    create: {
      path: string;
    };
    get: {
      path: string;
    };
  }
}

export class ServerlessCrud extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    const api = new apigateway.RestApi(this, props.api.name, {
      defaultCorsPreflightOptions: {
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    const resource = api.root.addResource(props.api.path);

    const table = new dynamodb.Table(this, props.table.name, {
      partitionKey: {
        name: props.table.partitionKey.name,
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new CfnOutput(this, 'TableName', {value: table.tableName});

    const createFn = new lambda.Function(this, `Create${props.table.name}Lambda`, {
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(props.lambdas.create.path),
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    table.grantReadWriteData(createFn);
    
    let lambdaIntegration = new apigateway.LambdaIntegration(createFn);
    const method = resource.addMethod('POST', lambdaIntegration);
 
    const getFn = new lambda.Function(this, `Get${props.table.name}Lambda`, {
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(props.lambdas.get.path),
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    table.grantReadData(getFn);

    lambdaIntegration = new apigateway.LambdaIntegration(getFn);
    resource.addMethod('GET', lambdaIntegration);
  }

}