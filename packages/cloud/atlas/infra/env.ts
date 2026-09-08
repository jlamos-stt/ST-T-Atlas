import type { EnvVisitor } from '@webiai/sdk.infra/util/stack-env';

/**
 * Environment schema for the CloudAtlas stack.
 *
 * Drives the infrastructure declared in `infra/app.ts`. The `tags` block feeds the
 * mandatory resource tagging required by the platform solution (project, environment,
 * domain) so cost can be attributed per functional domain. `budget` carries the monthly
 * ceiling enforced by the cost alarm.
 */
export interface CloudAtlasEnv {
  local: boolean;
  aws: {
    region: string;
  };
  /** Tags applied to every resource for cost attribution and ownership. */
  tags: {
    project: string;
    environment: string;
  };
  /** Monthly budget ceiling in USD for the POC cost alarm. */
  budget: {
    monthlyUsd: number;
  };
}

/**
 * Visitor that transforms raw env vars into typed schema.
 *
 * Receives merged variables from: process.env → app-level SSM → stack-level SSM.
 */
export const cloudAtlasEnvVisitor: EnvVisitor<CloudAtlasEnv> = (env) => ({
  local: env.SST_LOCAL?.optional.bool() ?? false,
  aws: {
    region: env.AWS_REGION?.optional.string() ?? 'us-east-1',
  },
  tags: {
    project: env.ATLAS_TAG_PROJECT?.optional.string() ?? 'stt-atlas',
    environment: env.SST_STAGE?.optional.string() ?? 'NOPROD',
  },
  budget: {
    // POC ceiling agreed with the product owner: 50 USD per month.
    monthlyUsd: env.ATLAS_BUDGET_MONTHLY_USD?.optional.number() ?? 50,
  },
});
