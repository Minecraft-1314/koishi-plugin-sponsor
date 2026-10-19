import { Context, Logger } from 'koishi';
interface ValidatedQrImage {
    value: string;
    type: string;
}
export declare function validateQrImage(source: string, maxImageSize: number): ValidatedQrImage;
export declare function repairQrImage(ctx: Context, source: string, maxImageSize: number): string;
export declare function saveQrImage(ctx: Context, source: string, maxImageSize: number, logger: Logger): Promise<string>;
export {};
