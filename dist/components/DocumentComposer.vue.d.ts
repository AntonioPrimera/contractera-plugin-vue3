import type { ContracteraGeneratedDocument, ContracteraMobileMode, ContracteraSdkAdapter } from '../types';
type __VLS_Props = {
    adapter: ContracteraSdkAdapter;
    title?: string;
    generateFormat?: 'docx' | 'pdf' | 'html';
    debounceMs?: number;
    mobileMode?: ContracteraMobileMode;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    error: (error: unknown) => any;
    generated: (document: ContracteraGeneratedDocument) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onError?: ((error: unknown) => any) | undefined;
    onGenerated?: ((document: ContracteraGeneratedDocument) => any) | undefined;
}>, {
    title: string;
    generateFormat: "docx" | "pdf" | "html";
    debounceMs: number;
    mobileMode: ContracteraMobileMode;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
