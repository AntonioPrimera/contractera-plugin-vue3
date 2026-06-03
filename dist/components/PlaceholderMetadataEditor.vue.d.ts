import type { ContracteraPlaceholderDefinition, ContracteraSdkAdapter } from '../types';
type __VLS_Props = {
    adapter: ContracteraSdkAdapter;
    title?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    error: (error: unknown) => any;
    saved: (placeholders: ContracteraPlaceholderDefinition[]) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onError?: ((error: unknown) => any) | undefined;
    onSaved?: ((placeholders: ContracteraPlaceholderDefinition[]) => any) | undefined;
}>, {
    title: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
