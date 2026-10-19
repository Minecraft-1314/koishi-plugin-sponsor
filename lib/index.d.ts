import { Context, Schema } from 'koishi';
import { SponsorConfig } from './types';
export { SponsorActionPayload, SponsorActionResult, SponsorConfig, SponsorListFilter, SponsorListResult, SponsorQrActionPayload, SponsorQrRecord, SponsorQrView, SponsorRecord, SponsorSettings, SponsorState, SponsorSummary, SponsorView, } from './types';
export declare const name = "sponsor";
export declare const inject: {
    required: string[];
    optional: string[];
};
export declare const Config: Schema<SponsorConfig>;
export declare function apply(ctx: Context, rawConfig: SponsorConfig): Promise<void>;
