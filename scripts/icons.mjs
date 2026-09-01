export const ICONS = {
  onesie:
    '<rect x="38" y="22" width="44" height="50" rx="13"/>' +
    '<rect x="41" y="68" width="17" height="24" rx="7"/>' +
    '<rect x="62" y="68" width="17" height="24" rx="7"/>' +
    '<circle cx="60" cy="22" r="8" fill="#fff" opacity=".85"/>' +
    '<circle cx="60" cy="46" r="5" fill="#fff" opacity=".6"/>',
  frock:
    '<path d="M47 22h26l6 22-7 5 15 43q-26 12-52 0l15-43-7-5z"/>' +
    '<path d="M49 16h22l-2 6q-9 8-18 0z" fill="#fff" opacity=".7"/>',
  tee:
    '<path d="M42 26 30 35l9 16 7-4v48h28V47l7 4 9-16-12-9q-9 8-18 8t-18-8z"/>' +
    '<path d="M51 19q9 8 18 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>',
  hoodie:
    '<path d="M42 30 30 39l9 16 7-4v46h28V51l7 4 9-16-12-9q-9-10-18-10t-18 10z"/>' +
    '<path d="M48 22q12 14 24 0l-4 10q-8 6-16 0z" fill="#fff" opacity=".75"/>' +
    '<rect x="50" y="70" width="20" height="12" rx="4" fill="#fff" opacity=".6"/>',
  pajama:
    '<rect x="34" y="18" width="52" height="36" rx="9"/>' +
    '<path d="M40 60h40l5 33H66l-6-21-6 21H35z"/>' +
    '<path d="M34 56h52v7H34z" fill="#fff" opacity=".55"/>' +
    '<circle cx="60" cy="18" r="6" fill="#fff" opacity=".85"/>',
  dungaree:
    '<rect x="38" y="34" width="44" height="52" rx="10"/>' +
    '<rect x="34" y="24" width="11" height="20" rx="5"/>' +
    '<rect x="75" y="24" width="11" height="20" rx="5"/>' +
    '<path d="M38 44h44v5H38z" fill="#fff" opacity=".5"/>' +
    '<rect x="52" y="54" width="16" height="13" rx="3" fill="#fff" opacity=".8"/>',
  bootie:
    '<path d="M30 66q0-20 18-20 12 0 16-12t15-12q23 0 23 27v17z"/>' +
    '<rect x="24" y="64" width="84" height="14" rx="7"/>' +
    '<circle cx="86" cy="34" r="6" fill="#fff" opacity=".8"/>',
  sneaker:
    '<path d="M28 66q0-18 17-18 12 0 16-11t16-11q23 0 23 25v15z"/>' +
    '<rect x="22" y="64" width="88" height="15" rx="7"/>' +
    '<path d="M50 46l9 8M59 39l9 8M68 32l9 8" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round"/>',
  sandal: (accent) =>
    '<rect x="24" y="60" width="84" height="16" rx="8"/>' +
    `<path d="M38 60q22-30 56-16" stroke="${accent}" stroke-width="7" fill="none" stroke-linecap="round"/>` +
    `<path d="M84 46q-20 2-26 14" stroke="${accent}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  cap:
    '<path d="M28 68q0-36 32-36t32 36z"/>' +
    '<ellipse cx="60" cy="70" rx="38" ry="8"/>' +
    '<circle cx="60" cy="30" r="5" fill="#fff" opacity=".9"/>' +
    '<path d="M40 44q20 8 40 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>',
  beanie:
    '<path d="M31 68q0-35 29-35t29 35z"/>' +
    '<rect x="28" y="64" width="64" height="15" rx="7"/>' +
    '<circle cx="60" cy="27" r="9"/>',
  mitten:
    '<path d="M45 98V58q0-32 17-32t17 32v40z"/>' +
    '<circle cx="45" cy="64" r="11"/>' +
    '<rect x="41" y="86" width="42" height="13" rx="6"/>' +
    '<path d="M62 44v34" stroke="#fff" stroke-width="3" opacity=".5"/>',
  socks:
    '<path d="M48 20h26v38q0 9 9 14 15 9 6 21-9 11-24 2-17-11-17-31z"/>' +
    '<rect x="45" y="14" width="32" height="11" rx="5"/>' +
    '<path d="M61 30v22" stroke="#fff" stroke-width="3" opacity=".5"/>',
  bib:
    '<path d="M60 28q-24 0-28 24-4 28 28 44 32-16 28-44-4-24-28-24z"/>' +
    '<circle cx="60" cy="27" r="9" fill="#fff" opacity=".85"/>' +
    '<circle cx="60" cy="72" r="7" fill="#fff" opacity=".5"/>',
};

export const PALETTES = {
  blush: { c1: "#ffeaf0", c2: "#ffd2de", fg: "#b94f74", acc: "#f6a9bf" },
  sky: { c1: "#e6f1fb", c2: "#cbe2f6", fg: "#4a7cab", acc: "#93bde0" },
  mint: { c1: "#e4f4ec", c2: "#c9ebda", fg: "#47836a", acc: "#95c9ae" },
  butter: { c1: "#fff4dd", c2: "#ffe5ba", fg: "#b9832f", acc: "#f2c87e" },
  lilac: { c1: "#efe9fb", c2: "#dcccf6", fg: "#6f55a4", acc: "#b9a3e6" },
  peach: { c1: "#ffeadf", c2: "#ffd5c0", fg: "#bd6244", acc: "#f4ab90" },
  denim: { c1: "#e8edf5", c2: "#ccd8ea", fg: "#4e6489", acc: "#9db3d4" },
  rose: { c1: "#fdeef3", c2: "#f9d8e4", fg: "#a84a76", acc: "#eda3c1" },
};
