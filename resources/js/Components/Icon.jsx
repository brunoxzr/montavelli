/**
 * Ícones da biblioteca Remix Icon (fonte hospedada localmente, sem CDN).
 * Nomes curtos do sistema -> classe do Remix Icon.
 */
const MAP = {
    instagram: 'instagram-line',
    whatsapp: 'whatsapp-line',
    globe: 'global-line',
    store: 'store-2-line',
    'map-pin': 'map-pin-line',
    mail: 'mail-line',
    phone: 'phone-line',
    tiktok: 'tiktok-line',
    youtube: 'youtube-line',
    facebook: 'facebook-circle-line',
    'shopping-bag': 'shopping-bag-3-line',
    bag: 'shopping-bag-3-line',
    star: 'star-line',
    link: 'link',
    truck: 'truck-line',
    shield: 'shield-check-line',
    medal: 'medal-line',
    award: 'award-line',
    exchange: 'exchange-line',
    lock: 'lock-2-line',
    heart: 'heart-line',
    gift: 'gift-line',
    card: 'bank-card-line',
    sparkle: 'sparkling-line',
    crown: 'vip-crown-2-line',
    search: 'search-line',
    menu: 'menu-line',
    close: 'close-line',
    'arrow-right': 'arrow-right-line',
    'arrow-left': 'arrow-left-line',
    'arrow-up-right': 'arrow-right-up-line',
    'chevron-down': 'arrow-down-s-line',
    'chevron-right': 'arrow-right-s-line',
    'chevron-left': 'arrow-left-s-line',
    share: 'share-forward-line',
    plus: 'add-line',
    minus: 'subtract-line',
    delete: 'delete-bin-6-line',
    edit: 'pencil-line',
    copy: 'file-copy-line',
    eye: 'eye-line',
    'eye-off': 'eye-off-line',
    drag: 'draggable',
    check: 'check-line',
    image: 'image-line',
    upload: 'upload-cloud-2-line',
    crop: 'crop-line',
    zoom: 'zoom-in-line',
    dashboard: 'dashboard-line',
    shirt: 't-shirt-line',
    folder: 'folder-3-line',
    palette: 'palette-line',
    ruler: 'ruler-line',
    links: 'links-line',
    layout: 'layout-top-line',
    page: 'pages-line',
    users: 'team-line',
    user: 'user-3-line',
    settings: 'settings-4-line',
    logout: 'logout-box-r-line',
    external: 'external-link-line',
    cursor: 'cursor-line',
    info: 'information-line',
    alert: 'error-warning-line',
    filter: 'equalizer-line',
    tool: 'tools-line',
    bold: 'bold',
    italic: 'italic',
    underline: 'underline',
    h2: 'h-2',
    h3: 'h-3',
    'list-ul': 'list-unordered',
    'list-ol': 'list-ordered',
    quote: 'double-quotes-l',
    'link-unlink': 'link-unlink',
};

export const BADGE_ICONS = ['truck', 'shield', 'medal', 'award', 'exchange', 'lock', 'card', 'gift', 'heart', 'star', 'sparkle', 'crown', 'whatsapp'];

export default function Icon({ name, className = '', label }) {
    const cls = MAP[name] ?? name;
    return (
        <i
            className={`ri-${cls} inline-flex leading-none ${className}`}
            aria-hidden={label ? undefined : true}
            aria-label={label}
            role={label ? 'img' : undefined}
        />
    );
}
