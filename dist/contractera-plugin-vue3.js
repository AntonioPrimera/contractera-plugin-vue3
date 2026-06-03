import { defineComponent as O, ref as s, computed as L, onMounted as j, onBeforeUnmount as K, openBlock as o, createElementBlock as r, createElementVNode as n, toDisplayString as d, normalizeClass as S, createCommentVNode as w, withModifiers as Q, Fragment as V, renderList as z, withDirectives as P, vModelText as B, createStaticVNode as W, vModelSelect as X, vModelCheckbox as Y } from "vue";
const Z = { class: "contractera-shell contractera-composer" }, ee = { class: "contractera-header" }, te = { class: "contractera-title" }, ae = ["disabled"], ne = {
  key: 0,
  class: "contractera-tabs"
}, oe = {
  key: 1,
  class: "contractera-alert",
  role: "alert"
}, re = {
  key: 2,
  class: "contractera-muted"
}, le = {
  key: 3,
  class: "contractera-layout"
}, ie = ["rows", "data-contractera-field", "value", "onInput"], ce = ["data-contractera-field", "value", "onChange"], ue = ["value"], se = ["data-contractera-field", "checked", "onChange"], de = ["type", "min", "max", "step", "placeholder", "data-contractera-field", "value", "onInput"], ve = {
  key: 4,
  class: "contractera-help"
}, pe = {
  key: 5,
  class: "contractera-error"
}, me = { class: "contractera-preview-toolbar" }, fe = ["innerHTML"], ye = {
  key: 0,
  class: "contractera-warnings"
}, Fe = /* @__PURE__ */ O({
  __name: "DocumentComposer",
  props: {
    adapter: {},
    title: { default: "Genereaza contract" },
    generateFormat: { default: "docx" },
    debounceMs: { default: 350 },
    mobileMode: { default: "tab" }
  },
  emits: ["generated", "error"],
  setup(h, { emit: N }) {
    const v = h, _ = N, m = s([]), c = s({}), k = s({}), f = s({}), $ = s(""), x = s([]), g = s("form"), y = s(!0), u = s(!1), i = s(!1), p = s(!1), b = s("");
    let C = null;
    const I = L(() => [...m.value].sort((t, a) => (t.display_order ?? 0) - (a.display_order ?? 0)));
    function q(t) {
      return t.input_type === "checkbox" ? !1 : "";
    }
    function T(t) {
      return k.value[t] ?? f.value[t] ?? "";
    }
    function G(t, a) {
      return t.input_config?.options?.find((l) => String(l.value) === a)?.value ?? a;
    }
    function M(t, a) {
      t.input_type === "checkbox" ? c.value[t.key] = !!a : t.input_type === "select" ? c.value[t.key] = G(t, String(a)) : c.value[t.key] = a, p.value = !1, E(), A();
    }
    function H() {
      const t = {};
      for (const a of m.value) {
        const e = c.value[a.key];
        a.input_type === "number" && e !== "" && e !== null && e !== void 0 ? t[a.key] = Number(e) : t[a.key] = e;
      }
      return t;
    }
    function E(t = !0) {
      const a = {};
      for (const e of m.value) {
        const l = c.value[e.key];
        if (t && e.required && (l === "" || l === null || l === void 0 || l === !1)) {
          a[e.key] = "Camp obligatoriu";
          continue;
        }
        if (e.input_type === "number" && l !== "" && Number.isNaN(Number(l))) {
          a[e.key] = "Valoare numerica invalida";
          continue;
        }
        e.input_type === "select" && l !== "" && e.input_config?.options?.length && (e.input_config.options.some((J) => J.value === l) || (a[e.key] = "Optiune invalida"));
      }
      return k.value = a, Object.keys(a).length === 0;
    }
    async function U() {
      if (!E(!1))
        return !1;
      u.value = !0, f.value = {}, b.value = "";
      try {
        const t = await v.adapter.validatePreview({ ...c.value });
        return f.value = Object.fromEntries(t.errors.map((a) => [a.key, a.message])), $.value = t.html, x.value = t.warnings ?? [], p.value = t.valid, t.valid;
      } catch (t) {
        return b.value = "Nu am putut valida datele contractului.", p.value = !1, _("error", t), !1;
      } finally {
        u.value = !1;
      }
    }
    function A() {
      C && clearTimeout(C), C = setTimeout(() => {
        U();
      }, v.debounceMs);
    }
    async function D() {
      if (!(!E(!0) || !(p.value || await U()))) {
        i.value = !0, b.value = "";
        try {
          const a = await v.adapter.generateDocument(H(), v.generateFormat);
          _("generated", a);
        } catch (a) {
          b.value = "Nu am putut genera documentul.", _("error", a);
        } finally {
          i.value = !1;
        }
      }
    }
    function F(t) {
      return {
        "contractera-pane-hidden-mobile": v.mobileMode === "tab" && g.value !== t,
        "contractera-pane-collapsed-mobile": v.mobileMode === "collapsed" && t === "preview",
        "contractera-pane-disabled-mobile": v.mobileMode === "hidden" && t === "preview"
      };
    }
    async function R() {
      y.value = !0, b.value = "";
      try {
        m.value = await v.adapter.listPlaceholders(), c.value = Object.fromEntries(m.value.map((t) => [
          t.key,
          q(t)
        ]));
      } catch (t) {
        b.value = "Nu am putut incarca formularul contractului.", _("error", t);
      } finally {
        y.value = !1;
      }
    }
    return j(R), K(() => {
      C && clearTimeout(C);
    }), (t, a) => (o(), r("section", Z, [
      n("header", ee, [
        n("div", null, [
          n("h2", te, d(h.title), 1),
          a[2] || (a[2] = n("p", { class: "contractera-subtitle" }, "Completeaza datele si verifica preview-ul generat de backend.", -1))
        ]),
        n("button", {
          class: "contractera-button contractera-button-primary",
          type: "button",
          disabled: y.value || i.value,
          "data-contractera-generate": "",
          onClick: D
        }, d(i.value ? "Se genereaza..." : "Genereaza"), 9, ae)
      ]),
      h.mobileMode === "tab" ? (o(), r("div", ne, [
        n("button", {
          class: S(["contractera-tab", { "contractera-tab-active": g.value === "form" }]),
          type: "button",
          "data-contractera-tab-form": "",
          onClick: a[0] || (a[0] = (e) => g.value = "form")
        }, " Formular ", 2),
        n("button", {
          class: S(["contractera-tab", { "contractera-tab-active": g.value === "preview" }]),
          type: "button",
          "data-contractera-tab-preview": "",
          onClick: a[1] || (a[1] = (e) => g.value = "preview")
        }, " Preview ", 2)
      ])) : w("", !0),
      b.value ? (o(), r("p", oe, d(b.value), 1)) : w("", !0),
      y.value ? (o(), r("p", re, "Se incarca...")) : (o(), r("div", le, [
        n("form", {
          class: S(["contractera-pane contractera-form", F("form")]),
          "data-contractera-form-pane": "",
          onSubmit: Q(D, ["prevent"])
        }, [
          (o(!0), r(V, null, z(I.value, (e) => (o(), r("label", {
            key: e.key,
            class: "contractera-field"
          }, [
            n("span", null, d(e.label), 1),
            e.input_type === "textarea" || e.input_type === "rich_text" ? (o(), r("textarea", {
              key: 0,
              class: "contractera-input",
              rows: e.input_config?.rows ?? 4,
              "data-contractera-field": e.key,
              value: String(c.value[e.key] ?? ""),
              onInput: (l) => M(e, l.target.value)
            }, null, 40, ie)) : e.input_type === "select" ? (o(), r("select", {
              key: 1,
              class: "contractera-input",
              "data-contractera-field": e.key,
              value: String(c.value[e.key] ?? ""),
              onChange: (l) => M(e, l.target.value)
            }, [
              a[3] || (a[3] = n("option", { value: "" }, "Alege", -1)),
              (o(!0), r(V, null, z(e.input_config?.options ?? [], (l) => (o(), r("option", {
                key: String(l.value),
                value: String(l.value)
              }, d(l.label), 9, ue))), 128))
            ], 40, ce)) : e.input_type === "checkbox" ? (o(), r("input", {
              key: 2,
              class: "contractera-checkbox",
              type: "checkbox",
              "data-contractera-field": e.key,
              checked: !!c.value[e.key],
              onChange: (l) => M(e, l.target.checked)
            }, null, 40, se)) : (o(), r("input", {
              key: 3,
              class: "contractera-input",
              type: e.input_type === "number" ? "number" : e.input_type,
              min: e.input_config?.min,
              max: e.input_config?.max,
              step: e.input_config?.step,
              placeholder: e.input_config?.placeholder,
              "data-contractera-field": e.key,
              value: String(c.value[e.key] ?? ""),
              onInput: (l) => M(e, l.target.value)
            }, null, 40, de)),
            e.help_text ? (o(), r("small", ve, d(e.help_text), 1)) : w("", !0),
            T(e.key) ? (o(), r("small", pe, d(T(e.key)), 1)) : w("", !0)
          ]))), 128))
        ], 34),
        n("aside", {
          class: S(["contractera-pane contractera-preview-pane", F("preview")]),
          "data-contractera-preview-pane": ""
        }, [
          n("div", me, [
            n("span", null, d(u.value ? "Se actualizeaza..." : "Preview"), 1)
          ]),
          n("div", {
            class: "contractera-preview",
            "data-contractera-preview": "",
            innerHTML: $.value || '<p class="contractera-preview-empty">Completeaza formularul pentru preview.</p>'
          }, null, 8, fe),
          x.value.length ? (o(), r("ul", ye, [
            (o(!0), r(V, null, z(x.value, (e) => (o(), r("li", { key: e }, d(e), 1))), 128))
          ])) : w("", !0)
        ], 2)
      ]))
    ]));
  }
}), _e = { class: "contractera-shell contractera-metadata-editor" }, be = { class: "contractera-header" }, ke = { class: "contractera-title" }, ge = ["disabled"], he = {
  key: 0,
  class: "contractera-alert",
  role: "alert"
}, we = {
  key: 1,
  class: "contractera-muted"
}, xe = {
  key: 2,
  class: "contractera-metadata-list"
}, Ce = { class: "contractera-placeholder-key" }, $e = { class: "contractera-placeholder-label-preview" }, Me = { class: "contractera-field" }, Se = ["onUpdate:modelValue", "data-contractera-field-label"], Pe = { class: "contractera-field" }, Ve = ["onUpdate:modelValue"], ze = { class: "contractera-check" }, Ne = ["onUpdate:modelValue"], Ee = { class: "contractera-field contractera-field-wide" }, Te = ["onUpdate:modelValue"], Be = /* @__PURE__ */ O({
  __name: "PlaceholderMetadataEditor",
  props: {
    adapter: {},
    title: { default: "Campuri template" }
  },
  emits: ["saved", "error"],
  setup(h, { emit: N }) {
    const v = h, _ = N, m = s([]), c = s(!0), k = s(!1), f = s(""), $ = L(() => !!v.adapter.updatePlaceholders && !c.value && !k.value);
    async function x() {
      c.value = !0, f.value = "";
      try {
        m.value = await v.adapter.listPlaceholders();
      } catch (y) {
        f.value = "Nu am putut incarca metadata placeholderelor.", _("error", y);
      } finally {
        c.value = !1;
      }
    }
    async function g() {
      if (v.adapter.updatePlaceholders) {
        k.value = !0, f.value = "";
        try {
          m.value = await v.adapter.updatePlaceholders(m.value), _("saved", m.value);
        } catch (y) {
          f.value = "Nu am putut salva metadata placeholderelor.", _("error", y);
        } finally {
          k.value = !1;
        }
      }
    }
    return j(x), (y, u) => (o(), r("section", _e, [
      n("header", be, [
        n("div", null, [
          n("h2", ke, d(h.title), 1),
          u[0] || (u[0] = n("p", { class: "contractera-subtitle" }, "Configureaza etichetele si tipurile de input randate de aplicatia gazda.", -1))
        ]),
        n("button", {
          class: "contractera-button contractera-button-primary",
          type: "button",
          disabled: !$.value,
          "data-contractera-save-metadata": "",
          onClick: g
        }, d(k.value ? "Se salveaza..." : "Salveaza"), 9, ge)
      ]),
      f.value ? (o(), r("p", he, d(f.value), 1)) : w("", !0),
      c.value ? (o(), r("p", we, "Se incarca...")) : (o(), r("div", xe, [
        (o(!0), r(V, null, z(m.value, (i) => (o(), r("article", {
          key: i.key,
          class: "contractera-metadata-row"
        }, [
          n("div", Ce, d(i.key), 1),
          n("div", $e, d(i.label), 1),
          n("label", Me, [
            u[1] || (u[1] = n("span", null, "Eticheta", -1)),
            P(n("input", {
              "onUpdate:modelValue": (p) => i.label = p,
              class: "contractera-input",
              "data-contractera-field-label": i.key,
              type: "text"
            }, null, 8, Se), [
              [B, i.label]
            ])
          ]),
          n("label", Pe, [
            u[3] || (u[3] = n("span", null, "Tip input", -1)),
            P(n("select", {
              "onUpdate:modelValue": (p) => i.input_type = p,
              class: "contractera-input"
            }, [...u[2] || (u[2] = [
              W('<option value="text">Text</option><option value="textarea">Textarea</option><option value="date">Data</option><option value="number">Numar</option><option value="email">Email</option><option value="select">Select</option><option value="checkbox">Checkbox</option><option value="rich_text">Rich text</option>', 8)
            ])], 8, Ve), [
              [X, i.input_type]
            ])
          ]),
          n("label", ze, [
            P(n("input", {
              "onUpdate:modelValue": (p) => i.required = p,
              type: "checkbox"
            }, null, 8, Ne), [
              [Y, i.required]
            ]),
            u[4] || (u[4] = n("span", null, "Obligatoriu", -1))
          ]),
          n("label", Ee, [
            u[5] || (u[5] = n("span", null, "Text ajutator", -1)),
            P(n("input", {
              "onUpdate:modelValue": (p) => i.help_text = p,
              class: "contractera-input",
              type: "text"
            }, null, 8, Te), [
              [B, i.help_text]
            ])
          ])
        ]))), 128))
      ]))
    ]));
  }
});
export {
  Fe as DocumentComposer,
  Be as PlaceholderMetadataEditor
};
