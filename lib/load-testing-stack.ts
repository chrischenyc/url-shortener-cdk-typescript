import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';

import { Pinger } from './pinger';

const env = process.env.ENV || 'dev';

export class LoadTestingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'VPC', {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'application',
          subnetType: ec2.SubnetType.PRIVATE,
        },
      ],
    });

    const url = 'https://9tbwbgter9.execute-api.ap-southeast-2.amazonaws.com/dev/1543fa06';

    new Pinger(this, `LoadTesting-${env}`, vpc, url, 10);
  }
}
