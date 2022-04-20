import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as path from 'path';

export class ServerlessStack extends Stack {
  api: apigateway.RestApi;
  bookApiResource: apigateway.Resource;
  table: dynamodb.Table;
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // The code that defines your stack goes here

    this.createApi();
    this.createTable();
    this.handleCreateBookLambda();
  }

  createApi() {
    this.api = new apigateway.RestApi(this, 'BooksApi', {
      defaultCorsPreflightOptions: {
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });
    this.bookApiResource = this.api.root.addResource('books');
  }

  createTable() {
    this.table = new dynamodb.Table(this, 'BooksTable', {
      partitionKey: {
        name: 'bookId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new CfnOutput(this, 'BooksTableName', {value: this.table.tableName});
  }

  handleCreateBookLambda() {
    const fn = new lambda.Function(this, 'CreateBookLambda', {
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '..','lambdas/create-book')),
      environment: {
        TABLE_NAME: this.table.tableName,
      }
    });

    this.table.grantReadWriteData(fn);
    
    const lambdaIntegration = new apigateway.LambdaIntegration(fn);
    const method = this.bookApiResource.addMethod('POST', lambdaIntegration);
  }
}
