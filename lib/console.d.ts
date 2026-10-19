import { Context, Logger } from 'koishi';
import { SponsorActionPayload, SponsorActionResult, SponsorConfig, SponsorListFilter, SponsorListResult, SponsorQrActionPayload, SponsorQrChunkPayload, SponsorChunkResult, SponsorSettings, SponsorState } from './types';
export declare const ADMIN_AUTHORITY = 4;
declare module '@koishijs/console' {
    interface Events {
        'sponsor/state'(this: Client, filter?: SponsorListFilter): Promise<SponsorState>;
        'sponsor/list'(this: Client, filter?: SponsorListFilter): Promise<SponsorListResult>;
        'sponsor/save'(this: Client, payload: SponsorActionPayload): Promise<SponsorActionResult>;
        'sponsor/delete'(this: Client, id: number): Promise<SponsorActionResult>;
        'sponsor/toggle'(this: Client, payload: {
            id: number;
            enabled: boolean;
        }): Promise<SponsorActionResult>;
        'sponsor/qr/list'(this: Client): Promise<SponsorState['qrs']>;
        'sponsor/qr/save'(this: Client, payload: SponsorQrActionPayload): Promise<SponsorActionResult>;
        'sponsor/qr/chunk'(this: Client, payload: SponsorQrChunkPayload): Promise<SponsorChunkResult>;
        'sponsor/qr/delete'(this: Client, id: number): Promise<SponsorActionResult>;
        'sponsor/qr/toggle'(this: Client, payload: {
            id: number;
            enabled: boolean;
        }): Promise<SponsorActionResult>;
        'sponsor/settings'(this: Client): Promise<SponsorSettings>;
        'sponsor/builtin-image'(this: Client): Promise<string>;
    }
}
export declare function setupConsole(service: any, ctx: Context, config: SponsorConfig, logger: Logger): void;
