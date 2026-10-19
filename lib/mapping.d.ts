import { Context } from 'koishi';
import { SponsorQrRecord, SponsorQrView, SponsorRecord, SponsorView } from './types';
export declare function extendModel(ctx: Context): void;
export declare function toView(record: SponsorRecord): SponsorView;
export declare function qrToView(record: SponsorQrRecord): SponsorQrView;
