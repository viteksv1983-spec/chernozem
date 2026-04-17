// ═══════════════════════════════════════════════════════
//  КиївЧорнозем — Site Content Types & Defaults
//  All editable content lives here. Components read from
//  ContentContext, admin panel writes to it + localStorage.
// ═══════════════════════════════════════════════════════

export interface BenefitItem {
  title: string;
  desc: string;
}

export interface ReviewItem {
  name: string;
  role: string;
  initials: string;
  rating: number;
  text: string;
  date: string;
  photoOverride?: string; // base64 or URL
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface TruckDeliveryItem {
  truck: string;
  capacity: string;
  volume: string;
  price: string;
  priceMin: number;
  priceMax: number;
  note: string;
  usageLabel: string;
  highlight: boolean;
  segments: number; // 1–12, capacity bar fill
  maxTons: number;  // used by calculator auto-select
}

export interface HowItWorksStep {
  num: string;
  title: string;
  desc: string;
  note: string;
}

export interface WhoIsItForSegment {
  id: string;
  label: string;
  title: string;
  desc: string;
  points: string[];
  tag: string;
}

// ─── SEO Settings ────────────────────────────────────────────
export interface SeoSettings {
  /** <title> · рекомендовано 50–60 символів */
  title: string;
  /** <meta name="description"> · рекомендовано 140–160 символів */
  description: string;
  /** <meta name="keywords"> · через кому */
  keywords: string;
  /** <link rel="canonical"> · повна URL сторінки */
  canonicalUrl: string;
  /** <meta name="robots"> */
  robots: string;
  /** og:title · якщо порожнє — використовується title */
  ogTitle: string;
  /** og:description · якщо порожнє — використовується description */
  ogDescription: string;
  /** og:image · повна URL картинки 1200×630px */
  ogImage: string;
  /** og:url */
  ogUrl: string;
  /** Широта складу (geo-координати) */
  geoLat: string;
  /** Довгота складу */
  geoLng: string;
  /** Цінова категорія: "$" | "$$" | "$$$" */
  priceRange: string;
}

// ─── SEO Text Block ────────────────────────────────────────────��──────────────
// Editorial section at the bottom of the landing page.
// Targets informational + long-tail queries; strengthens E-E-A-T signals.
// Each field maps 1:1 to an editable input in the admin panel SEO tab.
export interface SeoTextBlock {
  /** Show / hide the section on the site */
  enabled: boolean;
  /** <h2> — section heading. Keep keyword-rich, 50–70 chars */
  h2: string;
  /** Opening paragraph — 2–3 sentences, sets the topic */
  intro: string;
  /** Block 1 <h3> + body — Product education: what is chernozem */
  h3_1: string;
  body1: string;
  /** Block 2 <h3> + body — USP: why buy from us */
  h3_2: string;
  body2: string;
  /** Block 3 <h3> + body — Pricing anchor */
  h3_3: string;
  body3: string;
  /** Block 4 <h3> + body — Geo coverage */
  h3_4: string;
  body4: string;
}

// ─── Image Alt Text ───────────────────────────────────────────────────────────
// Keys match SiteContent["images"] — one alt per image slot.
export type ImageAlts = {
  heroPhoto:          string;
  truckDelivery:      string;
  gardenResult:       string;
  homeowner:          string;
  lawnPhoto:          string;
  gardenSegmentPhoto: string;
  landscapePhoto:     string;
  agroPhoto:          string;
  truckZil:           string;
  truckKamaz:         string;
  truckMaz:           string;
  truckVolvo:         string;
};

/**
 * SEO-optimised default alt texts (Ukrainian).
 * Exported so AdminPage can use them as placeholders and auto-fill defaults.
 */
export const IMAGE_ALT_DEFAULTS: ImageAlts = {
  heroPhoto:          "Чорнозем насипом — КиївЧорнозем, доставка по Києву",
  truckDelivery:      "Доставка чорнозему самоскидом по Києву та Київській області",
  gardenResult:       "Результат засипки чорнозему в саду — зелений газон",
  homeowner:          "Задоволений клієнт КиївЧорнозем — дачник з Київщини",
  lawnPhoto:          "Газон з родючим чорноземом для приватного будинку",
  gardenSegmentPhoto: "Город після засипки чорноземом — ідеальний ґрунт для рослин",
  landscapePhoto:     "Ландшафтне озеленення з чорноземом — парки та сади",
  agroPhoto:          "Чорнозем для агровиробництва та сільського господарства",
  truckZil:           "Самоскид ЗІЛ — доставка 3–5 тонн чорнозему по Києву",
  truckKamaz:         "Самоскид КАМАЗ — доставка 10–15 тонн чорнозему по Київщині",
  truckMaz:           "Самоскид МАЗ — доставка 15–20 тонн чорнозему",
  truckVolvo:         "Самоскид ВОЛЬВО — доставка 20–35 тонн чорнозему",
};

// ─── Full SiteContent type ────────────────────────────────────────────────────
export interface SiteContent {
  general: {
    companyName: string;
    phone: string;
    phoneRaw: string;
    address: string;
    iban: string;
    bankName: string;
    fopName: string;
    workingHours: string;
    foundedYear: string;
    clientsCount: string;
  };
  hero: {
    badge: string;
    headlineLine1: string;
    headlineAccent: string;
    headlineLine2: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    imageOverride: string;
  };
  benefits: BenefitItem[];
  howItWorks: HowItWorksStep[];
  whoIsItFor: WhoIsItForSegment[];
  pricing: {
    bulkPricePerTon: number;
    bagPrice: number;
    bagWeightKg: number;
    minTons: number;
    delivery: TruckDeliveryItem[];
  };
  reviews: ReviewItem[];
  faq: FaqItem[];
  images: {
    // Hero
    heroPhoto: string;
    // SocialProof gallery
    truckDelivery: string;
    gardenResult: string;
    homeowner: string;
    // WhoIsItFor segments (4 categories)
    lawnPhoto: string;
    gardenSegmentPhoto: string;
    landscapePhoto: string;
    agroPhoto: string;
    // Truck photos in Pricing section
    truckZil: string;
    truckKamaz: string;
    truckMaz: string;
    truckVolvo: string;
  };
  /** Editable alt-text for every image slot — auto-populated with SEO defaults */
  imageAlts: ImageAlts;
  finalCta: {
    urgencyBadge: string;
    headline1: string;
    headlineAccent: string;
    subtext: string;
  };
  seo: SeoSettings;
  /** Bottom-of-page SEO editorial text block */
  seoText: SeoTextBlock;
}

// ─── Shared truck calculator utility ─────────────────────────────────────────
export interface TruckInfo {
  name: string;
  capacity: string;
  priceMin: number;
  priceMax: number;
  trips: number;
}

export function getRecommendedTruck(
  tons: number,
  delivery: TruckDeliveryItem[]
): TruckInfo {
  if (!delivery || delivery.length === 0) {
    return { name: "КАМАЗ", capacity: "10–15 т", priceMin: 2000, priceMax: 3500, trips: 1 };
  }
  const sorted = [...delivery].sort((a, b) => a.maxTons - b.maxTons);
  const match = sorted.find((d) => tons <= d.maxTons);
  if (match) {
    return {
      name: match.truck,
      capacity: match.capacity.replace("≈ ", ""),
      priceMin: match.priceMin,
      priceMax: match.priceMax,
      trips: 1,
    };
  }
  const last = sorted[sorted.length - 1];
  const trips = Math.ceil(tons / last.maxTons);
  return {
    name: last.truck,
    capacity: last.capacity.replace("≈ ", ""),
    priceMin: last.priceMin * trips,
    priceMax: last.priceMax * trips,
    trips,
  };
}

export const DEFAULT_CONTENT: SiteContent = {
  general: {
    companyName: "КиївЧорнозем",
    phone: "+38 (098) 111 6059",
    phoneRaw: "+380981116059",
    address: "вул. Перевальна 17, Київ",
    iban: "UA543220010000026005340084054",
    bankName: "УНІВЕРСИТСАЛ БАНК",
    fopName: "ФОП Свєтличний Сергій Олександрович",
    workingHours: "8:00 – 20:00",
    foundedYear: "2015",
    clientsCount: "2 000",
  },
  hero: {
    badge: "Прямі поставки чорнозему • Київ та область",
    headlineLine1: "Чорнозем з",
    headlineAccent: "доставкою",
    headlineLine2: "по Києву та області",
    subheadline:
      "Прямо від виробника. Без посередників. ЗІЛ, КАМАЗ, МАЗ, ВОЛЬВО — 5 до 35 тонн на ваш об'єкт.",
    ctaPrimary: "Замовити чорнозем",
    ctaSecondary: "Розрахувати вартість",
    imageOverride: "",
  },
  benefits: [
    {
      title: "Ми — виробник",
      desc: "Купуєте напряму у виробника. Жодних посередників, жодних надбавок. Прямі поставки з кар'єру.",
    },
    {
      title: "Склад у Києві",
      desc: "Можна приїхати та особисто оглянути чорнозем на нашому складі до покупки. Переконайтесь у якості самі.",
    },
    {
      title: "За якість відповідаємо",
      desc: "Кращий чорнозем у Києві — це не слова. Без торфу, глини, глею, бур'янів та коренів. Чистий природний ґрунт.",
    },
    {
      title: "У зручний для вас час",
      desc: "Доставка з 8:00 до 20:00. Узгоджуємо день та час, які зручні саме вам — без жорстких вікон.",
    },
    {
      title: "Без домішок",
      desc: "Без торфу, глини, глею, бур'янів та коренів. Розсипчастий, насичений гумусом. Екологічно чистий ґрунт.",
    },
    {
      title: "Сьогодні на сьогодні",
      desc: "Будь-який об'єм — у день замовлення або наступного дня. Телефонуйте зараз, і ми узгодимо найближчу доставку.",
    },
    {
      title: "Автопарк 5–35 тонн",
      desc: "Власний парк самоскидів: ЗІЛ, КАМАЗ, МАЗ, ВОЛЬВО. Оберемо підходящий під ваш в'їзд та об'єм.",
    },
    {
      title: "Чорнозем у мішках",
      desc: "Є фасований чорнозем у мішках по 50 кг — 100 грн/мішок. Зручно для балконів, клумб та невеликих робіт.",
    },
  ],
  howItWorks: [
    {
      num: "01",
      title: "Залиште заявку",
      desc: "Зателефонуйте нам або заповніть форму на сайті. Менеджер відповість протягом 5 хвилин у робочий час.",
      note: "Без очікування та черг",
    },
    {
      num: "02",
      title: "Узгодимо деталі",
      desc: "Обговоримо об'єм, тип ґрунту, точну адресу та зручну дату доставки. Все фіксуємо документально.",
      note: "Точність і прозорість",
    },
    {
      num: "03",
      title: "Доставка самоскидом",
      desc: "Власний парк самоскидів доставить чорнозем прямо на вашу ділянку у погоджений час. ЗІЛ, КАМАЗ, МАЗ або ВОЛЬВО — залежно від об'єму.",
      note: "Пунктуально та надійно",
    },
    {
      num: "04",
      title: "Оплата після вивантаження",
      desc: "Оплачуєте лише коли ґрунт вже на місці. Готівка або безготівковий розрахунок.",
      note: "Повний захист покупця",
    },
  ],
  whoIsItFor: [
    {
      id: "lawn",
      label: "Для газону",
      title: "Ідеальний газон починається з правильного ґрунту",
      desc: "Рівний родючий шар чорнозему створює основу для густого, здорового газону, який не висохн влітку і витримає заморозки.",
      points: [
        "Без каміння та будівельного сміття",
        "Рівна структура для укладки рулонного газону",
        "Правильний дренаж",
      ],
      tag: "Приватні домоволодіння",
    },
    {
      id: "garden",
      label: "Для городу",
      title: "Багатий урожай щосезону",
      desc: "Високий вміст гумусу в нашому чорноземі забезпечує овочеві культури всіма необхідними поживними речовинами без хімічних добавок.",
      points: [
        "Високий вміст органіки",
        "Нейтральний pH (6.5–7.0)",
        "Вологоємність та повітропроникність",
      ],
      tag: "Садівники та городники",
    },
    {
      id: "landscape",
      label: "Для ландшафту",
      title: "Основа для проєктів будь-якої складності",
      desc: "Працюємо з ландшафтними компаніями та забудовниками. Великі об'єми, чіткі терміни, документація для здачі об'єктів.",
      points: [
        "Великотоннажні поставки",
        "Графік під ваш проєкт",
        "Повна документація",
      ],
      tag: "Ландшафтні компанії",
    },
    {
      id: "agro",
      label: "Для сільського госп.",
      title: "Об'ємні поставки для аграрного сектору",
      desc: "Поповнення виснаженого ґрунту, рекультивація, підготовка полів. Гнучкі умови для великих аграрних замовників.",
      points: [
        "Поставки від 50 м³",
        "Договірні умови",
        "Паспорт якості на партію",
      ],
      tag: "Агробізнес",
    },
  ],
  pricing: {
    bulkPricePerTon: 350,
    bagPrice: 100,
    bagWeightKg: 50,
    minTons: 5,
    delivery: [
      {
        truck: "ЗІЛ",
        capacity: "≈ 5–7 т",
        volume: "≈ 3–4 м³",
        price: "1 250 – 2 500 грн",
        priceMin: 1250,
        priceMax: 2500,
        note: "Для вузьких дворів та в'їздів",
        usageLabel: "Вузькі двори, дача, невеликий город",
        highlight: false,
        segments: 3,
        maxTons: 7,
      },
      {
        truck: "КАМАЗ",
        capacity: "≈ 10–15 т",
        volume: "≈ 6–9 м³",
        price: "2 000 – 3 500 грн",
        priceMin: 2000,
        priceMax: 3500,
        note: "Найпопулярніший варіант",
        usageLabel: "Приватна ділянка, сад, газон",
        highlight: true,
        segments: 6,
        maxTons: 15,
      },
      {
        truck: "МАЗ",
        capacity: "≈ 12–20 т",
        volume: "≈ 7–12 м³",
        price: "1 700 – 4 500 грн",
        priceMin: 1700,
        priceMax: 4500,
        note: "Оптимально за об'ємом і ціною",
        usageLabel: "Великі ділянки, котеджний двір",
        highlight: false,
        segments: 9,
        maxTons: 20,
      },
      {
        truck: "ВОЛЬВО",
        capacity: "≈ 25–35 т",
        volume: "≈ 14–20 м³",
        price: "3 200 – 6 000 грн",
        priceMin: 3200,
        priceMax: 6000,
        note: "Для великих об'ємів та будмайданчиків",
        usageLabel: "Будмайданчики, поля, масштабні роботи",
        highlight: false,
        segments: 12,
        maxTons: 35,
      },
    ],
  },
  reviews: [
    {
      name: "Олег Семенченко",
      role: "Власник дачі, Бровари",
      initials: "ОС",
      rating: 5,
      text: "Замовляв 8 кубів для городу. Привезли наступного дня вранці, як і обіцяли. Ґрунт чистий, без сміття, запах землі справжній. Вже посадили томати — зійшло все швидко. Рекомендую!",
      date: "Березень 2026",
    },
    {
      name: "Ірина Клименко",
      role: "Ландшафтний дизайнер, Київ",
      initials: "ІК",
      rating: 5,
      text: "Працюємо з цією компанією постійно — вже 3-й сезон. Всі проєкти здаємо вчасно, в тому числі завдяки надійним поставкам чорнозему. Документи в порядку, об'єм чесний.",
      date: "Квітень 2026",
    },
    {
      name: "Андрій Василенко",
      role: "Забудовник котеджного містечка",
      initials: "АВ",
      rating: 5,
      text: "Потрібно було 120 кубів для благоустрою містечка. Впорались за 3 дні, привозили суворо за графіком. Якість ґрунту підтверджена лабораторією. Звертатимусь знову.",
      date: "Травень 2026",
    },
  ],
  faq: [
    {
      q: "Який мінімальний об'єм замовлення?",
      a: "Для доставки насипом — мінімальне замовення від 5 тонн (це приблизно один кузов ЗІЛа). Для чорнозему в мішках — від 1 мішка (50 кг, 100 грн). Також доступний самовивіз зі складу за адресою: вул. Перевальна 17, Київ.",
    },
    {
      q: "Як швидко привезуть чорнозем?",
      a: "Доставка можлива сьогодні на сьогодні або наступного дня — залежно від зайнятості транспорту. Працюємо з 8:00 до 20:00. Зателефонуйте нам, і ми узгодимо зручний для вас час. Наші водії-професіонали заїдуть навіть у вузькі двори та ворота.",
    },
    {
      q: "Які є варіанти оплати?",
      a: "Приймаємо готівкою водієві або безготівковим переказом на розрахунковий рахунок ФОП Свєтличний Сергій Олександрович (IBAN: UA543220010000026005340084054, УНІВЕРСИТСАЛ БАНК). Оплата здійснюється за фактом доставки та вивантаження. Жодної передоплати.",
    },
    {
      q: "Як переконатися у якості чорнозему?",
      a: "Ви можете приїхати та особисто оглянути чорнозем на нашому складі в Києві до замовлення. Наш чорнозем — без торфу, глини, глею, бур'янів та коренів. Розсипчастий, насичений гумусом, екологічно чистий. За якість землі ми відповідаємо особисто.",
    },
    {
      q: "В яких районах Києва та області ви працюєте?",
      a: "Доставляємо чорнозем по всьому Києву та Київській області. Вартість доставки розраховується від нашого складу (вул. Перевальна 17, Київ). Перед підтвердженням замовлення менеджер уточнить точну вартість з урахуванням вашої адреси.",
    },
  ],
  images: {
    heroPhoto: "",
    truckDelivery: "",
    gardenResult: "",
    homeowner: "",
    lawnPhoto: "",
    gardenSegmentPhoto: "",
    landscapePhoto: "",
    agroPhoto: "",
    truckZil: "",
    truckKamaz: "",
    truckMaz: "",
    truckVolvo: "",
  },
  imageAlts: { ...IMAGE_ALT_DEFAULTS },
  finalCta: {
    urgencyBadge: "Сезонний попит: встигніть замовити до підвищення цін",
    headline1: "Готові до посіву?",
    headlineAccent: "Починайте з правильної землі.",
    subtext:
      "Кожен день без родючого ґрунту — це втрачений сезон. Залиште заявку зараз і ми доставимо чорнозем вже завтра.",
  },
  seo: {
    title: "Чорнозем з доставкою по Києву — від 350 грн/т | КиївЧорнозем",
    description: "Чорнозем з доставкою по Києву від виробника. Без посередників. ЗІЛ, КАМАЗ, МАЗ, ВОЛЬВО — 5–35 т. Мішки 50 кг — 100 грн. Працюємо з 2015. ☎ 098 111 6059",
    keywords: "чорнозем Київ, купити чорнозем, доставка чорнозему, чорнозем ціна, ґрунт Київ, купити ґрунт Київ, чорнозем мішки, чорнозем тонна, чорнозем Київська область, чорнозем насипом",
    canonicalUrl: "https://chernozem.com.ua/",
    robots: "index, follow",
    ogTitle: "КиївЧорнозем — Чорнозем з доставкою по Києву від виробника",
    ogDescription: "Купуйте чорнозем напряму від виробника без посередників. ЗІЛ, КАМАЗ, МАЗ, ВОЛЬВО — від 5 до 35 тонн. Мішки 50 кг — 100 грн. Доставка по Києву та Київській області. Дзвоніть: +38 (098) 111 6059",
    ogImage: "https://chernozem.com.ua/og-image.jpg",
    ogUrl: "https://chernozem.com.ua/",
    geoLat: "50.4017",
    geoLng: "30.6420",
    priceRange: "$$",
  },

  // ── SEO Text Block ─────────────────────────────────────────────────────────
  // Professionally-written Ukrainian copy targeting informational + long-tail
  // queries. Strengthens E-E-A-T. Written at senior SEO copywriter level.
  seoText: {
    enabled: true,

    h2: "Купити чорнозем у Києві: що це таке, чому важливо і як замовити",

    intro: "Чорнозем — це не просто темна земля. Це живий ґрунтовий горизонт, що формується тисячоліттями з перегнилих рослинних решток, мінералів і мікроорганізмів. Він утримує вологу, вивільняє поживні речовини саме тоді, коли вони потрібні рослинам, і перетворює будь-яку ділянку — від балконної клумби до фермерського поля — на родючу землю. «КиївЧорнозем» доставляє справжній природний чорнозем по Києву та Київській області з 2015 року.",

    h3_1: "Що таке справжній чорнозем і чим він відрізняється від «суміші»",
    body1: "На ринку нерідко продають так звану «рослинну землю» — суміш торфу, піску й глини з темним барвником. Візуально схоже, але вже за сезон такий ґрунт злежується, погано пропускає воду і не дає рослинам і половини необхідних речовин. Справжній чорнозем відрізняється за трьома ознаками: зернисто-грудкувата структура (розсипається в руках, але не порошить), насичено-чорний колір від гумусу (не від барвника), нейтральний pH у діапазоні 6.5–7.0. Вміст гумусу в нашому ґрунті — від 4 до 6%. Цього достатньо для газону, городу, саду та ландшафтного озеленення без додаткових добрив протягом трьох-п'яти сезонів поспіль.",

    h3_2: "Від виробника без посередників — ось у чому наша ключова відмінність",
    body2: "Коли ви купуєте чорнозем через посередника, до фінальної ціни автоматично додається 30–50% накрутки, а відповідальність за якість розчиняється між ланками ланцюжка. «КиївЧорнозем» — це пряма поставка від виробника: ми контролюємо якість ґрунту на всіх етапах від кар'єру до вашої ділянки. Власний парк самоскидів ЗІЛ, КАМАЗ, МАЗ та ВОЛЬВО дозволяє доставити від 3 до 35 тонн за один рейс — без перевантажень і додаткових витрат. Оплачуєте після вивантаження: жодних передоплат і ризиків. Понад 2 000 клієнтів за десять років роботи — наш найкращий аргумент.",

    h3_3: "Ціна чорнозему в Києві у 2026 році — прозоро і без сюрпризів",
    body3: "Вартість чорнозему насипом у 2026 році становить 350 грн за тонну при мінімальному замовленні від 5 тонн. Чорнозем у мішках по 50 кг — 100 грн за од��ницю: ідеально для балконів, клумб та невеликих садових робіт. Доставка самоскидом по Києву та Київській області коштує від 1 250 грн (ЗІЛ, 3–7 тонн) до 6 000 грн (ВОЛЬВО, 25–35 тонн). Ціна фіксується в момент оформлення замовлення і не змінюється — навіть якщо доставка переноситься на наступний день. Точну суму з урахуванням вашої адреси менеджер назве протягом п'яти хвилин після дзвінка.",

    h3_4: "Де ми доставляємо чорнозем — Київ та вся Київська область",
    body4: "Ми доставляємо чорнозем по всіх десяти районах Києва: Голосіївському, Дарницькому, Деснянському, Дніпровському, Оболонському, Печерському, Подільському, Святошинському, Солом'янському та Шевченківському. Регулярно виконуємо замовлення по всій Київській області: Бровари, Бориспіль, Бориспільський район, Вишневе, Вишгород, Обухів, Фастів, Біла Церква, Ірпінь, Буча, Ворзель, Гостомель, Коцюбинське та прилеглі населені пункти в радіусі 80 км від нашого складу на вул. Перевальна 17. Вартість доставки за межі міста розраховується індивідуально залежно від відстані та маршруту.",
  },
};

export const STORAGE_KEY = "kyivchornozem_content";
export const ADMIN_PASSWORD_KEY = "kyivchornozem_admin_auth";
export const ADMIN_PASSWORD = "admin2025"; // Default — overridden once hash is set

// ─── IDB key for images (avoids 5 MB localStorage cap) ──────
export const IMAGES_IDB_KEY = "site_images_v1";
// ─── localStorage key for admin password hash ────────────────
const ADMIN_HASH_KEY = "kc_admin_pwd_hash_v1";
const SALT = "kyivchornozem_2025";

async function sha256hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function checkPassword(input: string): Promise<boolean> {
  const inputHash = await sha256hex(input + SALT);
  const stored    = localStorage.getItem(ADMIN_HASH_KEY);
  if (stored) return inputHash === stored;
  const defaultHash = await sha256hex(ADMIN_PASSWORD + SALT);
  return inputHash === defaultHash;
}

export async function changeAdminPassword(newPassword: string): Promise<void> {
  const hash = await sha256hex(newPassword + SALT);
  localStorage.setItem(ADMIN_HASH_KEY, hash);
}

export function loadContent(): SiteContent {
  // ── SSR guard: localStorage does not exist on the server ──────────────
  if (typeof window === "undefined") return DEFAULT_CONTENT;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTENT;
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    const merged = deepMerge(DEFAULT_CONTENT, parsed) as SiteContent;
    const result: SiteContent = {
      ...merged,
      benefits:   Array.isArray(merged.benefits)   ? merged.benefits   : DEFAULT_CONTENT.benefits,
      howItWorks: Array.isArray(merged.howItWorks) ? merged.howItWorks : DEFAULT_CONTENT.howItWorks,
      whoIsItFor: Array.isArray(merged.whoIsItFor) ? merged.whoIsItFor : DEFAULT_CONTENT.whoIsItFor,
      reviews:    Array.isArray(merged.reviews)    ? merged.reviews    : DEFAULT_CONTENT.reviews,
      faq:        Array.isArray(merged.faq)        ? merged.faq        : DEFAULT_CONTENT.faq,
      pricing: {
        ...DEFAULT_CONTENT.pricing,
        ...merged.pricing,
        delivery: Array.isArray(merged.pricing?.delivery)
          ? merged.pricing.delivery.map(d => ({ ...DEFAULT_CONTENT.pricing.delivery[0], ...d }))
          : DEFAULT_CONTENT.pricing.delivery,
      },
      // Images served from IndexedDB async — start with empty placeholders
      images: DEFAULT_CONTENT.images,
      seo:       { ...DEFAULT_CONTENT.seo,       ...(merged.seo       ?? {}) },
      imageAlts: { ...DEFAULT_CONTENT.imageAlts, ...(merged.imageAlts ?? {}) },
      seoText:   { ...DEFAULT_CONTENT.seoText,   ...(merged.seoText   ?? {}) },
    };

    // ── Migration: fix headlineLine2 "по Києву" → "по Києву та області" ──
    if (result.hero.headlineLine2 === "по Києву") {
      result.hero.headlineLine2 = "по Києву та області";
      const clean = { ...result, images: DEFAULT_CONTENT.images };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    }

    // ── Migration: clean up long badge from localStorage to stop flashing ──
    if (result.hero.badge && /клієнтів/i.test(result.hero.badge)) {
      result.hero.badge = "Прямі поставки чорнозему • Київ та область";
      const clean = { ...result, images: DEFAULT_CONTENT.images };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    }

    // ── Migration: if old localStorage still has base64 images, move to IDB ──
    const oldImages = (merged as SiteContent).images ?? {};
    const hasOldImages = Object.values(oldImages).some(
      (v) => typeof v === "string" && v.startsWith("data:")
    );
    if (hasOldImages) {
      import("./storage").then(({ idbSet }) => {
        idbSet(IMAGES_IDB_KEY, oldImages).then(() => {
          const clean = { ...result, images: DEFAULT_CONTENT.images };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        }).catch(console.warn);
      });
    }

    return result;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function loadImagesAsync(): Promise<SiteContent["images"]> {
  try {
    const { idbGet } = await import("./storage");
    const imgs = await idbGet<SiteContent["images"]>(IMAGES_IDB_KEY);
    return imgs ? { ...DEFAULT_CONTENT.images, ...imgs } : DEFAULT_CONTENT.images;
  } catch {
    return DEFAULT_CONTENT.images;
  }
}

export function saveContent(content: SiteContent): void {
  try {
    const textOnly: SiteContent = { ...content, images: DEFAULT_CONTENT.images };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(textOnly));
  } catch {
    console.error("Failed to save content to localStorage");
  }
  import("./storage").then(({ idbSet }) => {
    idbSet(IMAGES_IDB_KEY, content.images).catch(console.warn);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(defaults: any, overrides: any): any {
  if (typeof defaults !== "object" || defaults === null) return overrides ?? defaults;
  if (typeof overrides !== "object" || overrides === null) return defaults;
  if (Array.isArray(defaults)) return Array.isArray(overrides) ? overrides : defaults;
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    result[key] = deepMerge(defaults[key], overrides[key]);
  }
  return result;
}