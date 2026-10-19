export interface SponsorConfig {
    enabled: boolean;
    title: string;
    description: string;
    currency: string;
    showAmounts: boolean;
    leaderboardLimit: number;
    maxQrCount: number;
    maxImageSize: number;
    pageSize: number;
}
export interface SponsorRecord {
    id: number;
    name: string;
    amountCents: number;
    message: string;
    platform: string;
    userId: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface SponsorQrRecord {
    id: number;
    name: string;
    image: string;
    enabled: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface SponsorView {
    id: number;
    name: string;
    amountCents: number;
    message: string;
    platform: string;
    userId: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface SponsorQrView {
    id: number;
    name: string;
    image: string;
    enabled: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}
export interface SponsorSummary {
    totalAmountCents: number;
    publicCount: number;
    hiddenCount: number;
    qrCount: number;
}
export interface SponsorListFilter {
    keyword?: string;
    page?: number;
    pageSize?: number;
}
export interface SponsorListResult {
    rows: SponsorView[];
    total: number;
    page: number;
    pageSize: number;
    summary: SponsorSummary;
}
export interface SponsorSettings {
    title: string;
    description: string;
    currency: string;
    showAmounts: boolean;
    leaderboardLimit: number;
    maxQrCount: number;
    maxImageSize: number;
    pageSize: number;
}
export interface SponsorActionPayload {
    id?: number;
    name: string;
    amount: number;
    message?: string;
    enabled?: boolean;
}
export interface SponsorQrActionPayload {
    id?: number;
    name: string;
    image?: string;
    uploadId?: string;
    enabled?: boolean;
    sortOrder?: number;
}
export interface SponsorQrChunkPayload {
    uploadId: string;
    seq: number;
    total: number;
    chunk: string;
}
export interface SponsorChunkResult {
    ok: boolean;
    message: string;
    received: number;
}
export interface SponsorActionResult {
    ok: boolean;
    message: string;
    id?: number;
}
export interface SponsorState {
    rows: SponsorView[];
    total: number;
    page: number;
    pageSize: number;
    summary: SponsorSummary;
    qrs: SponsorQrView[];
    settings: SponsorSettings;
}
declare module 'koishi' {
    interface Tables {
        sponsor: SponsorRecord;
        sponsor_qr: SponsorQrRecord;
    }
}
