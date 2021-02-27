#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from '@aws-cdk/core';

import { LoadTestingStack } from '../lib/load-testing-stack';
import { UrlShortenerStack } from '../lib/url-shortener-stack';

const app = new cdk.App();

const env = process.env.ENV || 'dev';

new UrlShortenerStack(app, `UrlShortenerStack-${env}`);
new LoadTestingStack(app, `LoadTestingStack-${env}`);
