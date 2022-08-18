import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import { ServerlessCrud } from './custom/ServerlessCrud';

export class ServerlessCustomStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // The code that defines your stack goes here
    new ServerlessCrud(this, 'BooksServerlessStack', {
      table: {
        name: 'Books',
        partitionKey: {
          name: 'bookId',
        }
      },
      api: {
        name: 'BooksRestApi',
        path: 'books'
      },
      lambdas: {
        create: {
          path: path.join(__dirname, '..', 'lambdas/create-book')
        },
        get: {
          path: path.join(__dirname, '..', 'lambdas/get-books')
        }
      }
    })
  }

}
