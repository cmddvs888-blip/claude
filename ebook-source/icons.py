# -*- coding: utf-8 -*-
# Bibliothèque d'icônes SVG (vectorielles, rendu identique partout, y compris mobile)
_P = {
 "globe":'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/>',
 "zap":'<path d="M13 2 5 13h6l-1 9 9-12h-6l1-8z"/>',
 "euro":'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5a4 4 0 1 0 0 7"/><path d="M7.5 11h6M7.5 13.5h5"/>',
 "cap":'<path d="M2 9l10-4 10 4-10 4-10-4z"/><path d="M6 11v4c0 1.2 3 2.6 6 2.6s6-1.4 6-2.6v-4"/>',
 "layers":'<path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M4 13l8 4.5L20 13"/>',
 "gear":'<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="17" r="2"/>',
 "rocket":'<path d="M9 15c-2 .5-3 3-3 5 2 0 4.5-1 5-3"/><path d="M9 15l-2-2c1-6 5-9 11-10 -1 6-4 10-10 11z"/><circle cx="14.5" cy="9.5" r="1.4"/>',
 "check":'<circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.6 2.6L16 9"/>',
 "xmark":'<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
 "refresh":'<path d="M20 11a8 8 0 0 0-14-4"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14 4"/><path d="M20 20v-4h-4"/>',
 "camera":'<path d="M4 8h3l1.6-2h6.8L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.4"/>',
 "clock":'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
 "tag":'<path d="M3 12l8.5-8.5 8.5 1 1 8.5L12.5 21.5z"/><circle cx="15" cy="9" r="1.5"/>',
 "shirt":'<path d="M8.5 4 12 6l3.5-2 4.5 3-2.5 3v10h-11V10L4 7z"/>',
 "chart":'<path d="M5 20V11M12 20V5M19 20v-6"/>',
 "trend":'<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
 "edit":'<path d="M4 20h4L19.5 8.5l-4-4L4 16z"/><path d="M14 6l4 4"/>',
 "wallet":'<path d="M3 8V6.5A1.5 1.5 0 0 1 4.5 5H16"/><path d="M3 8h16.5a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 19.5 18H4.5A1.5 1.5 0 0 1 3 16.5z"/><circle cx="17" cy="13" r="1.3"/>',
 "basket":'<path d="M6 9l2.5-4M18 9l-2.5-4"/><path d="M3 9h18l-1.5 9.5A2 2 0 0 1 17.5 20h-11a2 2 0 0 1-2-1.5z"/><path d="M9 13v3M15 13v3"/>',
 "wind":'<path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5"/><path d="M3 12h15a2.5 2.5 0 1 1-2.5 2.5"/><path d="M3 16h8"/>',
 "upload":'<path d="M12 15V4"/><path d="M8 8l4-4 4 4"/><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/>',
 "box":'<path d="M3 8l9-5 9 5v9l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v9"/>',
 "search":'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/>',
 "target":'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
 "flame":'<path d="M12 3c3 3.5 5 6 5 9.5a5 5 0 0 1-10 0c0-1.8 .8-3 1.8-4 .2 1.7 1 2.6 1.7 2.9C11 12 9.8 9.5 10 7.6c.8 0 1.9-2.2 2-4.6z"/>',
 "shield":'<path d="M12 3l7 3v5c0 5-3 8.2-7 10-4-1.8-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
 "pin":'<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
 "bag":'<path d="M6 8h12l1 12H5z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
 "hanger":'<path d="M12 7a2 2 0 1 1 2-2c0 1.2-1 1.6-2 2.2L4.5 12.5A1.5 1.5 0 0 0 5.5 15h13a1.5 1.5 0 0 0 1-2.5L12 7z"/>',
 "sparkle":'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
 "cart":'<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.2 11h11L21 7H6"/>',
 "list":'<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
 "eye":'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
 "arrow":'<path d="M5 12h14M13 6l6 6-6 6"/>',
 "truck":'<path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
 "heart":'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
}
def ic(name, cls="ic"):
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{_P[name]}</svg>')
def dot(color):
    return f'<span class="cdot" style="background:{color}"></span>'
