import { defineComponent as Le, ref as d, computed as le, watch as Oe, onMounted as Re, onUnmounted as Qe, resolveComponent as c, resolveDirective as Ge, openBlock as f, createBlock as L, unref as je, withCtx as s, createVNode as l, createElementVNode as n, toDisplayString as r, createElementBlock as y, Fragment as be, renderList as Ee, normalizeClass as k, normalizeStyle as He, withKeys as We, withDirectives as Ye, createTextVNode as h, createCommentVNode as ne } from "vue";
import { message as D, messageBox as _e, send as Ke } from "@koishijs/client";
var Je = {
  name: "zh-cn",
  el: {
    breadcrumb: {
      label: "面包屑"
    },
    colorpicker: {
      confirm: "确定",
      clear: "清空"
    },
    datepicker: {
      now: "此刻",
      today: "今天",
      cancel: "取消",
      clear: "清空",
      confirm: "确定",
      selectDate: "选择日期",
      selectTime: "选择时间",
      startDate: "开始日期",
      startTime: "开始时间",
      endDate: "结束日期",
      endTime: "结束时间",
      prevYear: "前一年",
      nextYear: "后一年",
      prevMonth: "上个月",
      nextMonth: "下个月",
      year: "年",
      month1: "1 月",
      month2: "2 月",
      month3: "3 月",
      month4: "4 月",
      month5: "5 月",
      month6: "6 月",
      month7: "7 月",
      month8: "8 月",
      month9: "9 月",
      month10: "10 月",
      month11: "11 月",
      month12: "12 月",
      weeks: {
        sun: "日",
        mon: "一",
        tue: "二",
        wed: "三",
        thu: "四",
        fri: "五",
        sat: "六"
      },
      months: {
        jan: "一月",
        feb: "二月",
        mar: "三月",
        apr: "四月",
        may: "五月",
        jun: "六月",
        jul: "七月",
        aug: "八月",
        sep: "九月",
        oct: "十月",
        nov: "十一月",
        dec: "十二月"
      }
    },
    select: {
      loading: "加载中",
      noMatch: "无匹配数据",
      noData: "无数据",
      placeholder: "请选择"
    },
    cascader: {
      noMatch: "无匹配数据",
      loading: "加载中",
      placeholder: "请选择",
      noData: "暂无数据"
    },
    pagination: {
      goto: "前往",
      pagesize: "条/页",
      total: "共 {total} 条",
      pageClassifier: "页",
      page: "页",
      prev: "上一页",
      next: "下一页",
      currentPage: "第 {pager} 页",
      prevPages: "向前 {pager} 页",
      nextPages: "向后 {pager} 页",
      deprecationWarning: "你使用了一些已被废弃的用法，请参考 el-pagination 的官方文档"
    },
    messagebox: {
      title: "提示",
      confirm: "确定",
      cancel: "取消",
      error: "输入的数据不合法!"
    },
    upload: {
      deleteTip: "按 delete 键可删除",
      delete: "删除",
      preview: "查看图片",
      continue: "继续上传"
    },
    table: {
      emptyText: "暂无数据",
      confirmFilter: "筛选",
      resetFilter: "重置",
      clearFilter: "全部",
      sumText: "合计"
    },
    tour: {
      next: "下一步",
      previous: "上一步",
      finish: "结束导览"
    },
    tree: {
      emptyText: "暂无数据"
    },
    transfer: {
      noMatch: "无匹配数据",
      noData: "无数据",
      titles: ["列表 1", "列表 2"],
      filterPlaceholder: "请输入搜索内容",
      noCheckedFormat: "共 {total} 项",
      hasCheckedFormat: "已选 {checked}/{total} 项"
    },
    image: {
      error: "加载失败"
    },
    pageHeader: {
      title: "返回"
    },
    popconfirm: {
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    },
    carousel: {
      leftArrow: "上一张幻灯片",
      rightArrow: "下一张幻灯片",
      indicator: "幻灯片切换至索引 {index}"
    }
  }
};
const Xe = { class: "an-page" }, Ze = { class: "an-hero" }, ea = { class: "an-hero-text" }, aa = { class: "an-hero-actions" }, ta = { class: "an-switch" }, la = { class: "an-stats" }, na = { class: "an-stat-head" }, ua = { class: "an-stat-label" }, oa = { class: "an-stat-value" }, sa = { class: "an-stat-track" }, ia = {
  class: "an-tabs",
  role: "tablist"
}, ra = {
  key: 0,
  class: "an-panel"
}, da = { class: "an-toolbar" }, ma = { class: "an-cell-title" }, ca = { class: "an-cell-meta" }, pa = { class: "an-amount" }, va = { class: "an-message" }, fa = ["title"], ga = { class: "an-empty" }, ba = {
  key: 0,
  class: "an-footer"
}, Ea = { class: "an-total" }, _a = {
  key: 1,
  class: "an-panel"
}, ya = { class: "an-toolbar" }, Ca = { class: "an-toolbar-label" }, ka = {
  key: 0,
  class: "an-qr-grid"
}, ha = { class: "an-qr-preview" }, Fa = { class: "an-qr-info" }, Da = { class: "an-qr-head" }, xa = { class: "an-qr-order" }, Ba = { class: "an-qr-state" }, Va = { class: "an-qr-actions" }, Aa = {
  key: 1,
  class: "an-empty"
}, $a = { class: "an-qr-upload" }, qa = ["disabled"], Ta = ["disabled"], Ma = {
  key: 0,
  class: "an-qr-image-preview"
}, Na = 30 * 1e3, Sa = 15 * 1e3, ue = 48 * 1024, Ia = 40 * 1024, wa = /* @__PURE__ */ Le({
  __name: "sponsor",
  setup(N) {
    const K = ["image/png", "image/apng", "image/jpeg", "image/gif", "image/webp", "image/avif", "image/bmp", "image/x-icon"], S = { totalAmountCents: 0, publicCount: 0, hiddenCount: 0, qrCount: 0 }, O = {
      title: "赞助管理",
      description: "",
      currency: "¥",
      showAmounts: !0,
      leaderboardLimit: 10,
      maxQrCount: 4,
      maxImageSize: 2,
      pageSize: 10
    }, $ = d(!1), g = d(!1), oe = d([]), I = d([]), w = d(0), q = d(1), x = d(10), J = d(""), E = d({ ...S }), _ = d({ ...O }), P = d("ranking"), R = d(!0), B = d(!1), V = d(!1), b = d(!1), C = d(""), U = d(""), se = d(null), p = d({ id: 0, name: "", amount: "", message: "", enabled: !0 }), i = d({ id: 0, name: "", image: "", enabled: !0, sortOrder: 0 });
    let Q, G, j = 0, H = 0, W = !1;
    const X = le(() => Math.max(1, Math.ceil(w.value / x.value))), ie = le(() => _.value.showAmounts !== !1), ye = le(() => {
      const a = Math.max(1, E.value.publicCount + E.value.hiddenCount);
      return [
        { key: "total", label: "累计赞助", value: re(E.value.totalAmountCents, _.value.currency, ie.value), ratio: 1 },
        { key: "public", label: "公开记录", value: `${E.value.publicCount} 条`, ratio: E.value.publicCount / a },
        { key: "hidden", label: "隐藏记录", value: `${E.value.hiddenCount} 条`, ratio: E.value.hiddenCount / a },
        { key: "qr", label: "二维码渠道", value: `${E.value.qrCount} 个`, ratio: Math.min(1, E.value.qrCount / Math.max(1, _.value.maxQrCount)) }
      ];
    });
    function re(a, e, u = !0) {
      return u ? `${e || "¥"}${(Number(a || 0) / 100).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "未公开";
    }
    function de(a) {
      if (!a) return "未知";
      const e = new Date(a);
      if (Number.isNaN(e.getTime())) return "未知";
      const u = (o) => String(o).padStart(2, "0");
      return `${e.getFullYear()}-${u(e.getMonth() + 1)}-${u(e.getDate())} ${u(e.getHours())}:${u(e.getMinutes())}`;
    }
    function Ce(a) {
      if (!a) return "未知";
      const e = new Date(a).getTime();
      if (Number.isNaN(e)) return "未知";
      const u = Date.now() - e;
      return u < 6e4 ? "刚刚" : u < 36e5 ? `${Math.floor(u / 6e4)} 分钟前` : u < 864e5 ? `${Math.floor(u / 36e5)} 小时前` : u < 2592e6 ? `${Math.floor(u / 864e5)} 天前` : de(a);
    }
    function Y(a) {
      return (typeof a == "string" ? a : String((a == null ? void 0 : a.message) || a || "")).split(`
`)[0].replace(/^Error:\s*/, "").trim() || "操作没有成功，请稍后再试。";
    }
    function ke(a) {
      return new Promise((e, u) => {
        const o = new FileReader();
        o.onload = () => e(String(o.result || "")), o.onerror = () => u(o.error || new Error("读取图片失败")), o.readAsDataURL(a);
      });
    }
    async function he(a) {
      const e = Math.random().toString(36).slice(2, 14), u = Math.ceil(a.length / ue);
      for (let o = 0; o < u; o++) {
        U.value = `上传图片 ${o + 1}/${u}`;
        const m = a.slice(o * ue, (o + 1) * ue), v = await Z("sponsor/qr/chunk", { uploadId: e, seq: o, total: u, chunk: m });
        if ((v == null ? void 0 : v.ok) === !1) throw new Error(v.message || "图片上传失败，请重新选择图片。");
      }
      return U.value = "", e;
    }
    async function Z(a, ...e) {
      let u;
      try {
        const o = Ke(a, ...e);
        return o ? Promise.race([
          o,
          new Promise((m, v) => {
            u = window.setTimeout(() => v(new Error("控制台请求超时，请稍后重试。")), Sa);
          })
        ]).finally(() => {
          u && window.clearTimeout(u);
        }) : Promise.reject(new Error("与控制台的连接还没有建立，请稍后重试。"));
      } catch (o) {
        return Promise.reject(o);
      }
    }
    async function T(a = !1) {
      if (W) return;
      const e = ++H;
      a || (j += 1, $.value = !0);
      try {
        const u = await Z("sponsor/state", { keyword: J.value.trim(), page: q.value, pageSize: x.value });
        if (W || e !== H) return;
        oe.value = u.rows || [], I.value = u.qrs || [], w.value = Number(u.total || 0), q.value = Number(u.page || 1), x.value = Number(u.pageSize || x.value), E.value = { ...S, ...u.summary || {} }, _.value = { ...O, ...u.settings || {} };
      } catch (u) {
        !W && e === H && !a && D.error(Y(u));
      } finally {
        a || (j = Math.max(0, j - 1), $.value = j > 0);
      }
    }
    function ee() {
      q.value = 1, T();
    }
    function Fe(a) {
      q.value = Math.min(X.value, Math.max(1, Number(a) || 1)), T();
    }
    function me() {
      Q && window.clearInterval(Q), Q = void 0;
    }
    function ce() {
      me(), R.value && (Q = window.setInterval(() => {
        B.value || V.value || g.value || T(!0);
      }, Na));
    }
    function ae(a) {
      p.value = {
        id: (a == null ? void 0 : a.id) || 0,
        name: (a == null ? void 0 : a.name) || "",
        amount: a ? (Number(a.amountCents || 0) / 100).toFixed(2) : "",
        message: (a == null ? void 0 : a.message) || "",
        enabled: a ? a.enabled !== !1 : !0
      }, B.value = !0;
    }
    function pe(a) {
      C.value = "", U.value = "", i.value = {
        id: (a == null ? void 0 : a.id) || 0,
        name: (a == null ? void 0 : a.name) || "",
        image: (a == null ? void 0 : a.image) || "",
        enabled: a ? a.enabled !== !1 : !0,
        sortOrder: (a == null ? void 0 : a.sortOrder) || 0
      }, V.value = !0;
    }
    async function M(a, e, u) {
      if (g.value) return !1;
      g.value = !0;
      try {
        const o = await Z(a, e);
        return (o == null ? void 0 : o.ok) === !1 ? (D.warning(o.message), !1) : (D.success((o == null ? void 0 : o.message) || u), !0);
      } catch (o) {
        return D.error(Y(o)), !1;
      } finally {
        await T(!0), g.value = !1;
      }
    }
    async function De() {
      const a = Number(p.value.amount);
      if (!Number.isFinite(a) || a <= 0) {
        D.warning("赞助金额必须大于 0。");
        return;
      }
      await M("sponsor/save", {
        id: p.value.id || void 0,
        name: p.value.name.trim() || "匿名支持者",
        amount: a,
        message: p.value.message.trim(),
        enabled: p.value.enabled
      }, "赞助记录已保存。") && (B.value = !1);
    }
    async function xe() {
      if (g.value || b.value) return;
      if (!i.value.name.trim()) {
        D.warning("请填写二维码名称。");
        return;
      }
      const a = i.value.image;
      if (!a) {
        D.warning("请选择或填写二维码图片。");
        return;
      }
      const e = {
        id: i.value.id || void 0,
        name: i.value.name.trim(),
        image: a,
        enabled: i.value.enabled,
        sortOrder: Number(i.value.sortOrder) || 0
      };
      if (a.startsWith("data:") && a.length > Ia) {
        b.value = !0, C.value = "";
        try {
          e.uploadId = await he(a), delete e.image;
        } catch (o) {
          C.value = Y(o), D.error(C.value);
          return;
        } finally {
          b.value = !1, U.value = "";
        }
      }
      await M("sponsor/qr/save", e, "二维码已保存。") && (V.value = !1);
    }
    function Be() {
      var a;
      b.value || (a = se.value) == null || a.click();
    }
    async function Ve(a) {
      var m;
      const e = a.target, u = (m = e.files) == null ? void 0 : m[0];
      if (e.value = "", !u) return;
      const o = Math.max(1, Number(_.value.maxImageSize) || 2) * 1024 * 1024;
      if (!K.includes(u.type) || u.size > o) {
        C.value = `请选择不超过 ${_.value.maxImageSize || 2}MB 的 PNG、JPEG、GIF、WebP 或 BMP 图片。`;
        return;
      }
      b.value = !0, C.value = "";
      try {
        i.value.image = await ke(u);
      } catch (v) {
        C.value = Y(v);
      } finally {
        b.value = !1;
      }
    }
    async function Ae(a) {
      await M("sponsor/toggle", { id: a.id, enabled: !a.enabled }, "记录状态已更新。");
    }
    async function $e(a) {
      await M("sponsor/qr/toggle", { id: a.id, enabled: !a.enabled }, "二维码状态已更新。");
    }
    async function qe(a) {
      try {
        await _e.confirm(`确定删除赞助记录 #${a.id} 吗？删除后无法恢复。`, "删除赞助记录", {
          type: "warning",
          confirmButtonText: "删除",
          cancelButtonText: "取消"
        });
      } catch {
        return;
      }
      await M("sponsor/delete", a.id, "赞助记录已删除。");
    }
    async function Te(a) {
      try {
        await _e.confirm(`确定删除二维码“${a.name}”吗？删除后无法恢复。`, "删除二维码", {
          type: "warning",
          confirmButtonText: "删除",
          cancelButtonText: "取消"
        });
      } catch {
        return;
      }
      await M("sponsor/qr/delete", a.id, "二维码已删除。");
    }
    return Oe(R, ce), Re(() => {
      G = (a) => {
        a.key === "Escape" && (B.value = !1, V.value = !1);
      }, window.addEventListener("keydown", G), T(), ce();
    }), Qe(() => {
      W = !0, H += 1, G && window.removeEventListener("keydown", G), me();
    }), (a, e) => {
      const u = c("el-switch"), o = c("k-icon"), m = c("el-button"), v = c("el-input"), te = c("el-option"), Me = c("el-select"), A = c("el-table-column"), Ne = c("el-table"), Se = c("el-pagination"), ve = c("el-image"), F = c("el-form-item"), fe = c("el-form"), ge = c("el-dialog"), Ie = c("el-input-number"), we = c("k-content"), Pe = c("k-layout"), Ue = c("el-config-provider"), ze = Ge("loading");
      return f(), L(Ue, { locale: je(Je) }, {
        default: s(() => [
          l(Pe, { main: "page-sponsor" }, {
            default: s(() => [
              l(we, null, {
                default: s(() => [
                  n("div", Xe, [
                    n("header", Ze, [
                      n("div", ea, [
                        e[21] || (e[21] = n("h1", null, "赞助管理", -1)),
                        n("p", null, r(_.value.description || "维护赞助渠道与公开排行榜。"), 1)
                      ]),
                      n("div", aa, [
                        n("label", ta, [
                          e[22] || (e[22] = n("span", null, "自动刷新", -1)),
                          l(u, {
                            modelValue: R.value,
                            "onUpdate:modelValue": e[0] || (e[0] = (t) => R.value = t)
                          }, null, 8, ["modelValue"])
                        ]),
                        l(m, {
                          loading: $.value,
                          onClick: e[1] || (e[1] = (t) => T())
                        }, {
                          default: s(() => [
                            l(o, { name: "redo" }),
                            e[23] || (e[23] = n("span", null, "刷新", -1))
                          ]),
                          _: 1
                        }, 8, ["loading"]),
                        l(m, {
                          type: "primary",
                          disabled: g.value,
                          onClick: e[2] || (e[2] = (t) => ae())
                        }, {
                          default: s(() => [
                            l(o, { name: "add" }),
                            e[24] || (e[24] = n("span", null, "新增记录", -1))
                          ]),
                          _: 1
                        }, 8, ["disabled"])
                      ])
                    ]),
                    n("section", la, [
                      (f(!0), y(be, null, Ee(ye.value, (t) => (f(), y("button", {
                        key: t.key,
                        type: "button",
                        class: k(["an-stat", `is-${t.key}`])
                      }, [
                        n("span", na, [
                          n("span", ua, r(t.label), 1),
                          e[25] || (e[25] = n("span", { class: "an-stat-dot" }, null, -1))
                        ]),
                        n("span", oa, r(t.value), 1),
                        n("span", sa, [
                          n("span", {
                            class: "an-stat-fill",
                            style: He({ transform: `scaleX(${t.ratio})` })
                          }, null, 4)
                        ])
                      ], 2))), 128))
                    ]),
                    n("nav", ia, [
                      n("button", {
                        type: "button",
                        class: k(["an-tab", { "is-active": P.value === "ranking" }]),
                        onClick: e[3] || (e[3] = (t) => P.value = "ranking")
                      }, [
                        l(o, { name: "clipboard-list" }),
                        e[26] || (e[26] = n("span", null, "赞助排行榜", -1))
                      ], 2),
                      n("button", {
                        type: "button",
                        class: k(["an-tab", { "is-active": P.value === "qr" }]),
                        onClick: e[4] || (e[4] = (t) => P.value = "qr")
                      }, [
                        l(o, { name: "tag" }),
                        e[27] || (e[27] = n("span", null, "收款二维码", -1))
                      ], 2)
                    ]),
                    P.value === "ranking" ? (f(), y("section", ra, [
                      n("div", da, [
                        l(v, {
                          modelValue: J.value,
                          "onUpdate:modelValue": e[5] || (e[5] = (t) => J.value = t),
                          class: "an-search",
                          placeholder: "搜索赞助人或留言，按回车开始搜索",
                          clearable: "",
                          onKeyup: We(ee, ["enter"]),
                          onClear: ee
                        }, null, 8, ["modelValue"]),
                        l(Me, {
                          modelValue: x.value,
                          "onUpdate:modelValue": e[6] || (e[6] = (t) => x.value = t),
                          class: "an-select is-small",
                          onChange: ee
                        }, {
                          default: s(() => [
                            l(te, {
                              value: 10,
                              label: "每页 10 条"
                            }),
                            l(te, {
                              value: 20,
                              label: "每页 20 条"
                            }),
                            l(te, {
                              value: 50,
                              label: "每页 50 条"
                            })
                          ]),
                          _: 1
                        }, 8, ["modelValue"]),
                        l(m, {
                          type: "primary",
                          disabled: g.value,
                          onClick: e[7] || (e[7] = (t) => ae())
                        }, {
                          default: s(() => [
                            l(o, { name: "add" }),
                            e[28] || (e[28] = n("span", null, "新增记录", -1))
                          ]),
                          _: 1
                        }, 8, ["disabled"])
                      ]),
                      Ye((f(), L(Ne, {
                        data: oe.value,
                        "row-key": "id",
                        class: "an-table"
                      }, {
                        empty: s(() => [
                          n("div", ga, [
                            l(o, { name: "box-open" }),
                            e[31] || (e[31] = n("p", { class: "an-empty-title" }, "还没有赞助记录", -1)),
                            e[32] || (e[32] = n("p", { class: "an-empty-desc" }, "点击右上角「新增记录」开始维护", -1))
                          ])
                        ]),
                        default: s(() => [
                          l(A, {
                            label: "排名",
                            width: "76"
                          }, {
                            default: s(({ $index: t }) => [
                              n("span", {
                                class: k(["an-rank", t < 3 ? `rank-${t + 1}` : ""])
                              }, r(t + 1), 3)
                            ]),
                            _: 1
                          }),
                          l(A, {
                            label: "赞助人",
                            "min-width": "180"
                          }, {
                            default: s(({ row: t }) => [
                              n("p", ma, r(t.name || "匿名支持者"), 1),
                              n("p", ca, r(t.platform ? `${t.platform} · ${t.userId || "未知"}` : "控制台记录"), 1)
                            ]),
                            _: 1
                          }),
                          l(A, {
                            label: "金额",
                            width: "130"
                          }, {
                            default: s(({ row: t }) => [
                              n("strong", pa, r(re(t.amountCents, _.value.currency, ie.value)), 1)
                            ]),
                            _: 1
                          }),
                          l(A, {
                            label: "留言",
                            "min-width": "220"
                          }, {
                            default: s(({ row: t }) => [
                              n("span", va, r(t.message || "—"), 1)
                            ]),
                            _: 1
                          }),
                          l(A, {
                            label: "状态",
                            width: "100"
                          }, {
                            default: s(({ row: t }) => [
                              n("span", {
                                class: k(["an-tag", t.enabled ? "is-done" : "is-partial"])
                              }, r(t.enabled ? "公开" : "隐藏"), 3)
                            ]),
                            _: 1
                          }),
                          l(A, {
                            label: "时间",
                            width: "150"
                          }, {
                            default: s(({ row: t }) => [
                              n("span", {
                                title: de(t.createdAt)
                              }, r(Ce(t.createdAt)), 9, fa)
                            ]),
                            _: 1
                          }),
                          l(A, {
                            label: "操作",
                            width: "150",
                            align: "right"
                          }, {
                            default: s(({ row: t }) => [
                              l(m, {
                                size: "small",
                                text: "",
                                disabled: g.value,
                                onClick: (z) => Ae(t)
                              }, {
                                default: s(() => [
                                  h(r(t.enabled ? "隐藏" : "公开"), 1)
                                ]),
                                _: 2
                              }, 1032, ["disabled", "onClick"]),
                              l(m, {
                                size: "small",
                                text: "",
                                onClick: (z) => ae(t)
                              }, {
                                default: s(() => [...e[29] || (e[29] = [
                                  h("编辑", -1)
                                ])]),
                                _: 1
                              }, 8, ["onClick"]),
                              l(m, {
                                size: "small",
                                text: "",
                                class: "an-danger-button",
                                disabled: g.value,
                                onClick: (z) => qe(t)
                              }, {
                                default: s(() => [...e[30] || (e[30] = [
                                  h("删除", -1)
                                ])]),
                                _: 1
                              }, 8, ["disabled", "onClick"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["data"])), [
                        [ze, $.value]
                      ]),
                      w.value > 0 ? (f(), y("footer", ba, [
                        n("span", Ea, "共 " + r(w.value) + " 条，当前第 " + r(q.value) + " / " + r(X.value) + " 页", 1),
                        X.value > 1 ? (f(), L(Se, {
                          key: 0,
                          layout: "prev, pager, next",
                          total: w.value,
                          "current-page": q.value,
                          "page-size": x.value,
                          "pager-count": 5,
                          onCurrentChange: Fe
                        }, null, 8, ["total", "current-page", "page-size"])) : ne("", !0)
                      ])) : ne("", !0)
                    ])) : (f(), y("section", _a, [
                      n("div", ya, [
                        n("span", Ca, "已配置 " + r(I.value.length) + " / " + r(_.value.maxQrCount) + " 个渠道", 1),
                        l(m, {
                          type: "primary",
                          disabled: g.value || I.value.length >= _.value.maxQrCount,
                          onClick: e[8] || (e[8] = (t) => pe())
                        }, {
                          default: s(() => [
                            l(o, { name: "add" }),
                            e[33] || (e[33] = n("span", null, "新增二维码", -1))
                          ]),
                          _: 1
                        }, 8, ["disabled"])
                      ]),
                      I.value.length ? (f(), y("div", ka, [
                        (f(!0), y(be, null, Ee(I.value, (t) => (f(), y("article", {
                          key: t.id,
                          class: k(["an-qr-card", { "is-disabled": !t.enabled }])
                        }, [
                          n("div", ha, [
                            t.image ? (f(), L(ve, {
                              key: 0,
                              src: t.image,
                              alt: t.name || "赞助二维码",
                              fit: "contain",
                              "preview-src-list": [t.image],
                              "preview-teleported": ""
                            }, null, 8, ["src", "alt", "preview-src-list"])) : (f(), L(o, {
                              key: 1,
                              name: "file-archive"
                            }))
                          ]),
                          n("div", Fa, [
                            n("div", Da, [
                              n("strong", null, r(t.name || "赞助方式"), 1),
                              n("span", xa, "#" + r(t.sortOrder), 1)
                            ]),
                            n("div", Ba, [
                              n("span", {
                                class: k(["an-tag", t.enabled ? "is-done" : "is-partial"])
                              }, r(t.enabled ? "已启用" : "已停用"), 3),
                              l(u, {
                                "model-value": t.enabled,
                                disabled: g.value,
                                onChange: (z) => $e(t)
                              }, null, 8, ["model-value", "disabled", "onChange"])
                            ])
                          ]),
                          n("div", Va, [
                            l(m, {
                              size: "small",
                              text: "",
                              onClick: (z) => pe(t)
                            }, {
                              default: s(() => [...e[34] || (e[34] = [
                                h("编辑", -1)
                              ])]),
                              _: 1
                            }, 8, ["onClick"]),
                            l(m, {
                              size: "small",
                              text: "",
                              class: "an-danger-button",
                              disabled: g.value,
                              onClick: (z) => Te(t)
                            }, {
                              default: s(() => [...e[35] || (e[35] = [
                                h("删除", -1)
                              ])]),
                              _: 1
                            }, 8, ["disabled", "onClick"])
                          ])
                        ], 2))), 128))
                      ])) : (f(), y("div", Aa, [
                        l(o, { name: "tag" }),
                        e[36] || (e[36] = n("p", { class: "an-empty-title" }, "还没有二维码", -1)),
                        e[37] || (e[37] = n("p", { class: "an-empty-desc" }, "新增一个赞助渠道", -1))
                      ]))
                    ])),
                    l(ge, {
                      modelValue: B.value,
                      "onUpdate:modelValue": e[14] || (e[14] = (t) => B.value = t),
                      title: p.value.id ? `编辑记录 #${p.value.id}` : "新增赞助记录",
                      width: "620px",
                      "align-center": "",
                      "close-on-click-modal": !1
                    }, {
                      footer: s(() => [
                        l(m, {
                          onClick: e[13] || (e[13] = (t) => B.value = !1)
                        }, {
                          default: s(() => [...e[38] || (e[38] = [
                            h("取消", -1)
                          ])]),
                          _: 1
                        }),
                        l(m, {
                          type: "primary",
                          loading: g.value,
                          onClick: De
                        }, {
                          default: s(() => [...e[39] || (e[39] = [
                            h("保存记录", -1)
                          ])]),
                          _: 1
                        }, 8, ["loading"])
                      ]),
                      default: s(() => [
                        l(fe, {
                          "label-position": "top",
                          class: "an-form"
                        }, {
                          default: s(() => [
                            l(F, { label: "赞助人名称" }, {
                              default: s(() => [
                                l(v, {
                                  modelValue: p.value.name,
                                  "onUpdate:modelValue": e[9] || (e[9] = (t) => p.value.name = t),
                                  maxlength: "40",
                                  placeholder: "匿名支持者"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            l(F, { label: "赞助金额" }, {
                              default: s(() => [
                                l(v, {
                                  modelValue: p.value.amount,
                                  "onUpdate:modelValue": e[10] || (e[10] = (t) => p.value.amount = t),
                                  type: "number",
                                  min: "0.01",
                                  step: "0.01",
                                  placeholder: "0.00"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            l(F, { label: "留言" }, {
                              default: s(() => [
                                l(v, {
                                  modelValue: p.value.message,
                                  "onUpdate:modelValue": e[11] || (e[11] = (t) => p.value.message = t),
                                  type: "textarea",
                                  rows: 4,
                                  maxlength: "200",
                                  placeholder: "可选"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            l(F, { label: "公开到排行榜" }, {
                              default: s(() => [
                                l(u, {
                                  modelValue: p.value.enabled,
                                  "onUpdate:modelValue": e[12] || (e[12] = (t) => p.value.enabled = t)
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "title"]),
                    l(ge, {
                      modelValue: V.value,
                      "onUpdate:modelValue": e[20] || (e[20] = (t) => V.value = t),
                      title: i.value.id ? `编辑二维码 #${i.value.id}` : "新增二维码",
                      width: "620px",
                      "align-center": "",
                      "close-on-click-modal": !1
                    }, {
                      footer: s(() => [
                        l(m, {
                          onClick: e[19] || (e[19] = (t) => V.value = !1)
                        }, {
                          default: s(() => [...e[40] || (e[40] = [
                            h("取消", -1)
                          ])]),
                          _: 1
                        }),
                        l(m, {
                          type: "primary",
                          loading: g.value || b.value,
                          onClick: xe
                        }, {
                          default: s(() => [...e[41] || (e[41] = [
                            h("保存二维码", -1)
                          ])]),
                          _: 1
                        }, 8, ["loading"])
                      ]),
                      default: s(() => [
                        l(fe, {
                          "label-position": "top",
                          class: "an-form"
                        }, {
                          default: s(() => [
                            l(F, { label: "渠道名称" }, {
                              default: s(() => [
                                l(v, {
                                  modelValue: i.value.name,
                                  "onUpdate:modelValue": e[15] || (e[15] = (t) => i.value.name = t),
                                  maxlength: "40",
                                  placeholder: "微信赞助"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            l(F, {
                              class: "an-image-field",
                              label: "二维码图片"
                            }, {
                              default: s(() => [
                                n("div", $a, [
                                  n("input", {
                                    ref_key: "qrFileInput",
                                    ref: se,
                                    class: "an-file-input",
                                    type: "file",
                                    accept: "image/png,image/jpeg,image/gif,image/webp,image/bmp",
                                    disabled: b.value,
                                    onChange: Ve
                                  }, null, 40, qa),
                                  n("button", {
                                    type: "button",
                                    class: k(["an-upload-button", { "is-disabled": b.value }]),
                                    disabled: b.value,
                                    onClick: Be
                                  }, [
                                    l(o, { name: "file-archive" }),
                                    n("span", null, r(b.value ? "读取中" : "选择图片"), 1)
                                  ], 10, Ta),
                                  n("span", {
                                    class: k(["an-qr-hint", { "is-error": C.value }])
                                  }, r(U.value || C.value || "支持 PNG、APNG、JPEG、GIF、WebP、AVIF、BMP、ICO"), 3)
                                ]),
                                i.value.image ? (f(), y("div", Ma, [
                                  l(ve, {
                                    src: i.value.image,
                                    alt: "二维码预览",
                                    fit: "contain",
                                    "preview-src-list": [i.value.image],
                                    "preview-teleported": ""
                                  }, null, 8, ["src", "preview-src-list"])
                                ])) : ne("", !0),
                                l(v, {
                                  modelValue: i.value.image,
                                  "onUpdate:modelValue": e[16] || (e[16] = (t) => i.value.image = t),
                                  type: "url",
                                  placeholder: "也可以粘贴图片链接"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            l(F, { label: "排序" }, {
                              default: s(() => [
                                l(Ie, {
                                  modelValue: i.value.sortOrder,
                                  "onUpdate:modelValue": e[17] || (e[17] = (t) => i.value.sortOrder = t),
                                  min: 0,
                                  max: 9999
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            l(F, { label: "启用" }, {
                              default: s(() => [
                                l(u, {
                                  modelValue: i.value.enabled,
                                  "onUpdate:modelValue": e[18] || (e[18] = (t) => i.value.enabled = t)
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue", "title"])
                  ])
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["locale"]);
    };
  }
}), Pa = (N, K) => {
  const S = N.__vccOpts || N;
  for (const [O, $] of K)
    S[O] = $;
  return S;
}, Ua = /* @__PURE__ */ Pa(wa, [["__scopeId", "data-v-f5659d26"]]), Oa = (N) => {
  N.page({
    path: "/sponsor",
    name: "赞助管理",
    desc: "维护赞助二维码与排行榜",
    icon: "box-open",
    position: "bottom",
    order: 610,
    authority: 4,
    component: Ua
  });
};
export {
  Oa as default
};
