import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import { Construct } from '@aws-cdk/core';

export class Pinger extends Construct {
  constructor(scope: Construct, id: string, vpc: ec2.IVpc, url: string, tps: number) {
    super(scope, id);

    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'PingerTask');
    taskDefinition.addContainer('Pinger', {
      image: ecs.ContainerImage.fromAsset('./pinger'),
      environment: {
        URL: url,
      },
    });

    new ecs.FargateService(this, 'FargateService', {
      cluster,
      taskDefinition,
      desiredCount: tps,
    });
  }
}
