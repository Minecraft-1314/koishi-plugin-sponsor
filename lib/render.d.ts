import { h } from 'koishi';
import { SponsorConfig, SponsorQrRecord, SponsorRecord, SponsorSummary } from './types';
export declare function renderSponsor(config: SponsorConfig, qrs: SponsorQrRecord[], records: SponsorRecord[], summary: SponsorSummary): h[];
export declare function renderSponsorQr(config: SponsorConfig, qrs: SponsorQrRecord[]): h[];
export declare function renderSponsorRanking(config: SponsorConfig, records: SponsorRecord[], summary: SponsorSummary): h[];
