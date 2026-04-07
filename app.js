const USE_SERVER_STORAGE = true;
const API_BASE = "/api";
const app = document.getElementById("app");

const MODULES = [
  { id: "listening", label: "听力", icon: "01" },
  { id: "speaking", label: "口语", icon: "02" },
  { id: "reading", label: "阅读", icon: "03" },
  { id: "writing", label: "写作", icon: "04" },
  { id: "vocabulary", label: "词汇", icon: "05" },
  { id: "grammar", label: "语法", icon: "06" },
];

const SCORED_MODULES = ["listening", "speaking", "reading", "writing"];
const SCHEDULE_SLOTS = Array.from({ length: 14 }, (_, index) => `${index + 7}:00`);
const CAMBRIDGE_SERIES = Array.from({ length: 14 }, (_, index) => `剑桥雅思真题 ${index + 7}`);

const MATERIAL_LIBRARY = {
  listening: [
    "王陆雅思王听力语料库（剑20版）",
    "12天攻破雅思听力",
    ...CAMBRIDGE_SERIES,
    "Official Guide to IELTS",
    "Collins Listening for IELTS",
    "IELTS Trainer 2",
    "雅思听力机考模拟 8.0+ Set 01",
    "雅思听力机考模拟 8.0+ Set 02",
  ],
  speaking: [
    ...CAMBRIDGE_SERIES,
    "Collins Speaking for IELTS",
    "Official Guide to IELTS",
    "IELTS Trainer 2",
    "Mindset for IELTS Level 3",
    "Mindset for IELTS Level 4",
    "Grammar for IELTS",
  ],
  reading: [
    "刘洪波雅思阅读真经 5",
    "刘洪波雅思阅读真经总纲",
    ...CAMBRIDGE_SERIES,
    "Official Guide to IELTS",
    "Collins Reading for IELTS",
    "IELTS Trainer 2",
    "雅思阅读机考模拟 8.0+ Set 01",
    "雅思阅读机考模拟 8.0+ Set 02",
  ],
  writing: [
    ...CAMBRIDGE_SERIES,
    "Collins Writing for IELTS",
    "Official Guide to IELTS",
    "IELTS Trainer 2",
    "Grammar for IELTS",
    "Mindset for IELTS Level 4",
    "Cambridge Grammar for IELTS",
  ],
  vocabulary: [
    "Vocabulary for IELTS",
    "Cambridge Vocabulary for IELTS",
    "English Vocabulary in Use Upper-Intermediate",
    "English Vocabulary in Use Advanced",
    "Official Guide to IELTS",
  ],
  grammar: [
    "Grammar for IELTS",
    "Cambridge Grammar for IELTS",
    "English Grammar in Use",
    "Advanced Grammar in Use",
    "Official Guide to IELTS",
  ],
};

const WELCOME_LIBRARY = {
  encouraging: [
    "今天的进步不需要惊天动地，只需要比昨天更稳一点。",
    "把今天的任务认真完成，你和目标分之间就会更近一步。",
    "先开始，再变强。真正拉开差距的，往往只是持续执行。",
  ],
  gentle: [
    "今天也不用太着急，我们一步一步把目标分数做成现实。",
    "你不是一个人在备考，这个平台会把今天该做的事安静地放好。",
    "把今天过稳，比把今天过满更重要。",
  ],
  formal: [
    "Study with calm precision. Consistency remains the most elegant strategy.",
    "Your preparation is now in motion. Maintain clarity, and let the score follow.",
    "A disciplined day compounds quietly. That is how results become inevitable.",
  ],
};

const TASK_PATTERNS = {
  listening: [
    { action: "整套真题机考演练", durationMultiplier: 1.3, guidance: "使用剑桥真题完整跑一套，严格按机考节奏完成。", materialHint: "剑桥雅思真题", priorityForHighBand: true },
    { action: "Section 1-2 基础稳分训练", durationMultiplier: 0.95, guidance: "优先保证基础场景和细节信息不失分。", materialHint: "剑桥雅思真题", priorityForHighBand: false },
    { action: "Section 3-4 高频陷阱强化", durationMultiplier: 1.05, guidance: "重点盯学术讨论和讲座中的转折与替换。", materialHint: "剑桥雅思真题", priorityForHighBand: true },
    { action: "Section 精听抄写", durationMultiplier: 1.05, guidance: "逐句对照音频，优先抓人名、数字、拼写与转折。", priorityForHighBand: false },
    { action: "同义替换定位训练", durationMultiplier: 0.95, guidance: "边听边标出题干同义替换，建立机考快速定位习惯。", priorityForHighBand: true },
    { action: "错题回炉与陷阱复盘", durationMultiplier: 0.9, guidance: "只回看错题，记录被干扰的原因。", priorityForHighBand: false },
    { action: "语料库拼写循环", durationMultiplier: 0.8, guidance: "拼写、缩写和高频场景词反复默写。", materialHint: "语料库", priorityForHighBand: false },
    { action: "12天突破节奏训练", durationMultiplier: 0.95, guidance: "按 12 天体系推进当天单元，强调速度与准确率。", materialHint: "12天攻破", priorityForHighBand: false },
    { action: "限时机考模拟", durationMultiplier: 1.25, guidance: "严格按机考节奏完成一整套，不中途暂停。", materialHint: "机考模拟", priorityForHighBand: true },
    { action: "答案核对（无解析）", durationMultiplier: 0.7, guidance: "只核对答案与耗时，不做长解析，保留考试手感。", materialHint: "机考模拟", priorityForHighBand: true },
  ],
  speaking: [
    { action: "Part 2 话题表达训练", durationMultiplier: 1.0, guidance: "先 1 分钟准备，再按 2 分钟完整输出。"},
    { action: "答案拓展与素材归纳", durationMultiplier: 0.9, guidance: "把高频话题答案扩展到可复用表达。"},
    { action: "流利度连说练习", durationMultiplier: 0.85, guidance: "不追求完美，优先减少停顿。"},
    { action: "录音回听纠错", durationMultiplier: 0.8, guidance: "回听自己的输出，修正语法与逻辑断点。"},
  ],
  reading: [
    { action: "整套真题机考演练", durationMultiplier: 1.3, guidance: "以完整三篇阅读的顺序做一整套，模拟正式机考时间压力。", materialHint: "剑桥雅思真题", priorityForHighBand: true },
    { action: "Passage 1-2 节奏稳分训练", durationMultiplier: 0.95, guidance: "优先把前两篇做稳，控制耗时与回看次数。", materialHint: "剑桥雅思真题", priorityForHighBand: false },
    { action: "Passage 3 难题突破", durationMultiplier: 1.05, guidance: "集中训练最后一篇的抽象表达与高干扰项。", materialHint: "剑桥雅思真题", priorityForHighBand: true },
    { action: "Heading / Matching 题型专项", durationMultiplier: 0.9, guidance: "专项处理配对题和标题题，减少机考切屏时的丢点。", materialHint: "剑桥雅思真题", priorityForHighBand: true },
    { action: "True False Not Given 专项", durationMultiplier: 0.9, guidance: "只练判断题，压缩犹豫时间。", materialHint: "剑桥雅思真题", priorityForHighBand: true },
    { action: "篇章限时训练", durationMultiplier: 1.0, guidance: "控制每篇时间，先建立稳定节奏。", priorityForHighBand: false },
    { action: "定位与平行阅读训练", durationMultiplier: 0.95, guidance: "专练关键词定位、顺序题与乱序题切换。", priorityForHighBand: true },
    { action: "长难句拆解复盘", durationMultiplier: 0.85, guidance: "挑最难句子拆主干，减少卡顿。", priorityForHighBand: false },
    { action: "真经方法刷题", durationMultiplier: 1.0, guidance: "围绕真经题型方法做针对训练。", materialHint: "真经", priorityForHighBand: false },
    { action: "总纲方法回看", durationMultiplier: 0.8, guidance: "快速复盘题型判断逻辑与做题顺序。", materialHint: "总纲", priorityForHighBand: false },
    { action: "限时机考模拟", durationMultiplier: 1.25, guidance: "用接近真实考试的时间压力完成整套阅读。", materialHint: "机考模拟", priorityForHighBand: true },
    { action: "答案核对（无解析）", durationMultiplier: 0.7, guidance: "只核对答案和正确率，不展开解析，保留机考节奏。", materialHint: "机考模拟", priorityForHighBand: true },
  ],
  writing: [
    { action: "Task 1 思路搭建", durationMultiplier: 0.9, guidance: "先列结构与数据趋势，再下笔。"},
    { action: "Task 2 观点展开", durationMultiplier: 1.05, guidance: "聚焦论点、论证与段落推进。"},
    { action: "范文拆解与仿写", durationMultiplier: 0.85, guidance: "拆结构而不是机械背诵。"},
    { action: "句式优化与改写", durationMultiplier: 0.8, guidance: "把已有表达提炼成更自然的高分句型。"},
  ],
  vocabulary: [
    { action: "高频词循环巩固", durationMultiplier: 0.8, guidance: "用短周期反复复现高频词。"},
    { action: "同义替换训练", durationMultiplier: 0.8, guidance: "围绕听力和阅读题干常见改写做整理。"},
    { action: "主题词汇归类", durationMultiplier: 0.85, guidance: "按教育、科技、环境等主题做积累。"},
    { action: "搭配记忆与造句", durationMultiplier: 0.9, guidance: "优先记搭配，再用自己的句子固定。"},
  ],
  grammar: [
    { action: "核心语法整理", durationMultiplier: 0.8, guidance: "把当前最影响输出准确性的语法先补齐。"},
    { action: "易错点回炉", durationMultiplier: 0.8, guidance: "只做自己近期重复出错的点。"},
    { action: "句型打磨训练", durationMultiplier: 0.9, guidance: "将简单句升级为更自然的复合结构。"},
    { action: "结构强化练习", durationMultiplier: 0.85, guidance: "用短练习稳定时态、从句和连接逻辑。"},
  ],
};

const MOCK_EXAMS = {
  listening: {
    durationMinutes: 32,
    sections: [
      {
        id: "section-1",
        title: "Section 1",
        context: "Student Services Desk",
        summary:
          "你将听到一段关于语言中心报名与学习安排的对话。请根据所听内容填写表格。",
        durationMinutes: 9,
        prompt:
          "A student is registering for an intensive English support programme before an IELTS computer-based test.",
        questions: [
          { number: 1, type: "input", label: "Registration code", answer: "A472" },
          { number: 2, type: "input", label: "Preferred study room", answer: "Maple" },
          { number: 3, type: "input", label: "Mock test day", answer: "Thursday" },
          { number: 4, type: "input", label: "Tutor surname", answer: "Foster" },
        ],
      },
      {
        id: "section-2",
        title: "Section 2",
        context: "Library Orientation",
        summary:
          "你将听到一段关于图书馆资源与借阅规则的说明。请根据所听内容回答问题。",
        durationMinutes: 10,
        prompt:
          "A librarian introduces the IELTS preparation zone and explains how to reserve computer booths.",
        questions: [
          { number: 5, type: "input", label: "Floor number", answer: "3" },
          { number: 6, type: "input", label: "Booth booking limit", answer: "2 hours" },
          { number: 7, type: "input", label: "Quiet zone opens at", answer: "8:30" },
          { number: 8, type: "input", label: "Headphones desk", answer: "west" },
        ],
      },
      {
        id: "section-3",
        title: "Section 3",
        context: "Score Strategy Workshop",
        summary:
          "你将听到导师与学生讨论 8 分以上听力冲刺策略。请记录关键信息。",
        durationMinutes: 13,
        prompt:
          "A tutor explains how to use high-band computer-based mock sets efficiently without over-relying on long answer explanations.",
        questions: [
          { number: 9, type: "input", label: "Recommended weekly mocks", answer: "2" },
          { number: 10, type: "input", label: "Trap focus", answer: "synonyms" },
          { number: 11, type: "input", label: "Review window", answer: "20 minutes" },
          { number: 12, type: "input", label: "Final advice", answer: "stay calm" },
        ],
      },
    ],
  },
  reading: {
    durationMinutes: 34,
    passages: [
      {
        id: "passage-1",
        title: "Passage 1 · Quiet Architecture",
        text: [
          "In several modern learning centres, designers are moving away from loud visual stimulation and are instead shaping spaces that improve concentration through rhythm, material warmth and predictable circulation.",
          "One shared principle is that students work better when transitions feel intuitive. Corridors, seating clusters and lighting changes quietly signal what kind of attention a place is asking for.",
          "The strongest buildings do not merely look impressive. They reduce decision fatigue and protect cognitive energy, especially in environments where long periods of reading and listening are required.",
        ],
        questions: [
          {
            number: 1,
            type: "select",
            label: "The writer says effective study buildings mainly reduce",
            options: ["maintenance costs", "decision fatigue", "teacher workload", "noise complaints"],
            answer: "decision fatigue",
          },
          {
            number: 2,
            type: "select",
            label: "Transitions inside the building help students understand",
            options: ["what attention is needed", "how to find teachers", "where cafeterias are", "when lessons begin"],
            answer: "what attention is needed",
          },
          { number: 3, type: "input", label: "Spaces are designed with visual ____ rather than chaos.", answer: "rhythm" },
          { number: 4, type: "input", label: "The materials are described as having ____.", answer: "warmth" },
        ],
      },
      {
        id: "passage-2",
        title: "Passage 2 · Testing in a Digital Room",
        text: [
          "Computer-based language testing changes the management of time. Candidates no longer scan sheets in the same way; instead, they divide attention between screen sections, on-screen clocks and short bursts of keyboard input.",
          "High-scoring candidates are usually not faster in every single micro-action. They are simply more stable. Their routines are pre-decided: when to skip, when to return and how long to check an uncertain answer.",
          "This stability is why realistic mock environments matter. The closer a practice setting is to the actual test room, the fewer surprises remain on the day of the exam.",
        ],
        questions: [
          {
            number: 5,
            type: "select",
            label: "High scorers are described as mainly being more",
            options: ["creative", "stable", "competitive", "aggressive"],
            answer: "stable",
          },
          { number: 6, type: "input", label: "Candidates divide attention between screens and on-screen ____.", answer: "clocks" },
          { number: 7, type: "input", label: "The best routines are already ____ before the test.", answer: "pre-decided" },
          {
            number: 8,
            type: "select",
            label: "Realistic mock environments help because they leave fewer",
            options: ["teachers", "documents", "surprises", "instructions"],
            answer: "surprises",
          },
        ],
      },
      {
        id: "passage-3",
        title: "Passage 3 · Precision Before Volume",
        text: [
          "Many candidates imagine that advanced preparation means endlessly increasing the amount of practice they do. Yet high-band improvement often comes from narrowing attention: fewer materials, more precise review and cleaner execution.",
          "Teachers who prepare students for 8+ outcomes often ask them to analyse patterns rather than emotions. The useful question is not whether a mistake felt frustrating, but what feature of the item caused the error.",
          "Once this habit forms, review becomes shorter and more purposeful. Students start recognising whether a problem came from vocabulary, structure, distraction or poor pacing.",
        ],
        questions: [
          { number: 9, type: "input", label: "High-band improvement often comes from more ____ review.", answer: "precise" },
          {
            number: 10,
            type: "select",
            label: "Teachers ask students to analyse",
            options: ["patterns", "luck", "hardware", "friendship"],
            answer: "patterns",
          },
          { number: 11, type: "input", label: "A useful review identifies the feature that caused the ____.", answer: "error" },
          { number: 12, type: "input", label: "Students learn whether problems came from pacing or ____.", answer: "distraction" },
        ],
      },
    ],
  },
};

function createDefaultUiState() {
  return {
    authMode: "login",
    sidebarCollapsed: false,
    profileMenuOpen: false,
    recordsView: "calendar",
    recordsMonth: formatMonth(new Date()),
    checkinMonth: formatMonth(new Date()),
    toast: null,
    modal: null,
    completionFlash: null,
    activeTimer: null,
    lastStablePath: "/auth",
    ignoreNextHashChange: false,
    dragTaskId: null,
    sharingDetailId: null,
    studyEntry: null,
    mockPlayer: null,
    mockExamTimer: null,
    bootstrapping: USE_SERVER_STORAGE,
    authPending: false,
    serverError: "",
  };
}

function normalizeUiState(source = {}) {
  return {
    ...createDefaultUiState(),
    ...source,
    toast: null,
    modal: null,
    completionFlash: null,
    activeTimer: null,
    dragTaskId: null,
    studyEntry: null,
    mockPlayer: null,
    mockExamTimer: null,
    authPending: false,
  };
}

function createInitialState() {
  return {
    users: [],
    currentUserId: null,
    sharingRequests: [],
    ui: createDefaultUiState(),
  };
}

function createDefaultOnboarding() {
  return {
    planMode: "system",
    targetScores: {
      overall: "7.5",
      listening: "7.5",
      speaking: "7.0",
      reading: "7.5",
      writing: "6.5",
    },
    currentLevels: {
      listening: "6.0",
      speaking: "5.5",
      reading: "6.0",
      writing: "5.5",
    },
    examDate: addDays(todayISO(), 90),
    materials: [],
    studyDuration: "3",
    dailyStudyHours: "3",
    availability: {
      weekday: [2, 3, 11, 12],
      weekend: [3, 4, 5, 10, 11, 12],
    },
    modules: ["listening", "speaking", "reading", "writing", "vocabulary", "grammar"],
    preferences: {
      mood: "formal",
      welcomeTone: "auto",
      homeSections: ["overview", "modules", "tasks", "records"],
    },
    privacy: {
      allowRequests: true,
      manualApproval: true,
      defaultPrivate: true,
    },
  };
}

function loadState() {
  return createInitialState();
}

function persistState() {
  scheduleServerSync();
}

let state = loadState();
let serverSaveTimeoutId = 0;
let serverSaveInFlight = false;
let serverSaveQueued = false;
let serverSavePromise = null;
let lastServerUserSignature = "";
let lastServerSharingSignature = JSON.stringify([]);

function setState(mutator, options = {}) {
  mutator(state);
  persistState();
  if (options.render !== false) {
    renderApp();
  }
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function pad(num) {
  return String(num).padStart(2, "0");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePassword(value) {
  return String(value || "").replace(/\u00A0/g, " ").trim();
}

function cloneData(value) {
  if (value == null) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    credentials: "same-origin",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }
  if (!response.ok) {
    const requestError = new Error(payload.error || "request_failed");
    requestError.code = payload.error || `http_${response.status}`;
    requestError.status = response.status;
    requestError.detail = payload.detail || "";
    throw requestError;
  }
  return payload;
}

function getAuthErrorMessage(error, isLogin) {
  if (error?.code === "email_exists") {
    return "该邮箱已注册。";
  }
  if (error?.code === "invalid_credentials") {
    return "邮箱或密码不正确。";
  }
  if (error?.code === "missing_fields") {
    return isLogin ? "请填写完整的邮箱和密码。" : "请把注册信息填写完整。";
  }
  if (error?.code === "server_misconfigured") {
    return "服务端环境变量未配置完整，请先补齐 Supabase 数据库连接和会话密钥。";
  }
  return "当前无法连接登录服务，请确认已使用 `npm run dev` 启动，或线上部署环境变量已配置完成。";
}

function getSaveErrorMessage(error) {
  if (error?.code === "email_exists") {
    return "这个邮箱已被其他账号使用。";
  }
  if (error?.code === "unauthorized") {
    return "登录状态已失效，请重新登录。";
  }
  if (error?.code === "server_misconfigured") {
    return "数据库环境变量未配置完整，当前无法保存。";
  }
  return "保存失败，稍后会继续重试。";
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatMonth(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function parseISODate(iso) {
  return new Date(`${iso}T00:00:00`);
}

function addDays(iso, amount) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + amount);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function daysUntil(iso) {
  const target = parseISODate(iso).getTime();
  const now = parseISODate(todayISO()).getTime();
  return Math.max(0, Math.ceil((target - now) / 86400000));
}

function formatDateLabel(iso) {
  const date = parseISODate(iso);
  return date.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function formatDateLong(iso) {
  const date = parseISODate(iso);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) {
    return "0 分钟";
  }
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (!hours) {
    return `${remain} 分钟`;
  }
  if (!remain) {
    return `${hours} 小时`;
  }
  return `${hours} 小时 ${remain} 分钟`;
}

function formatTimer(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value || "");
  } catch (error) {
    return value || "";
  }
}

function hashString(input) {
  return Array.from(input).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function hydrateUser(user) {
  if (!user) {
    return null;
  }
  user.tasks = user.tasks || [];
  user.records = user.records || [];
  user.checkins = user.checkins || [];
  user.calendarEvents = user.calendarEvents || [];
  user.mockSessions = user.mockSessions || {};
  user.showGeneratedPage = Boolean(user.showGeneratedPage);
  return user;
}

function getCurrentUser() {
  return hydrateUser(state.users.find((user) => user.id === state.currentUserId) || null);
}

function usesSystemPlan(user) {
  return (user?.onboarding?.planMode || "system") !== "manual";
}

function serializeUserForServer(user) {
  if (!user) {
    return null;
  }
  const payload = {
    id: user.id,
    nickname: String(user.nickname || "").trim(),
    email: normalizeEmail(user.email),
    createdAt: user.createdAt || new Date().toISOString(),
    onboardingCompleted: Boolean(user.onboardingCompleted),
    onboarding: cloneData(user.onboarding || createDefaultOnboarding()),
    tasks: cloneData(user.tasks || []),
    records: cloneData(user.records || []),
    checkins: cloneData(user.checkins || []),
    calendarEvents: cloneData(user.calendarEvents || []),
    mockSessions: cloneData(user.mockSessions || {}),
    showGeneratedPage: Boolean(user.showGeneratedPage),
  };
  if (user.password) {
    payload.password = normalizePassword(user.password);
  }
  return payload;
}

function currentUserSignature(user = getCurrentUser()) {
  return user ? JSON.stringify(serializeUserForServer(user)) : "";
}

function sharingRequestsSignature(requests = state.sharingRequests) {
  return JSON.stringify(cloneData(requests || []));
}

function applyServerSnapshot(snapshot) {
  const preservedUi = normalizeUiState({
    ...state.ui,
    bootstrapping: false,
    authPending: false,
    serverError: "",
  });

  state.users = Array.isArray(snapshot?.users)
    ? snapshot.users.map((user) => hydrateUser(cloneData(user)))
    : [];
  state.currentUserId = snapshot?.currentUserId || null;
  state.sharingRequests = Array.isArray(snapshot?.sharingRequests)
    ? cloneData(snapshot.sharingRequests)
    : [];
  state.ui = preservedUi;

  lastServerUserSignature = currentUserSignature();
  lastServerSharingSignature = sharingRequestsSignature();
}

async function flushServerSync() {
  if (serverSaveTimeoutId) {
    window.clearTimeout(serverSaveTimeoutId);
    serverSaveTimeoutId = 0;
  }

  if (state.ui.bootstrapping || !state.currentUserId) {
    return;
  }

  const user = getCurrentUser();
  const userSignature = currentUserSignature(user);
  const sharingSignature = sharingRequestsSignature();
  const shouldSaveUser = Boolean(user) && userSignature !== lastServerUserSignature;
  const shouldSaveSharing = sharingSignature !== lastServerSharingSignature;

  if (!shouldSaveUser && !shouldSaveSharing) {
    return;
  }

  if (serverSaveInFlight) {
    serverSaveQueued = true;
    return serverSavePromise;
  }

  serverSaveInFlight = true;
  serverSavePromise = (async () => {
    try {
      const body = {
        currentUser: serializeUserForServer(user),
      };
      if (shouldSaveSharing) {
        body.sharingRequests = cloneData(state.sharingRequests || []);
      }
      const snapshot = await apiRequest("/save-state", {
        method: "POST",
        body,
      });
      applyServerSnapshot(snapshot);
      renderApp();
    } catch (error) {
      if (error?.code === "unauthorized") {
        applyServerSnapshot({ currentUserId: null, users: [], sharingRequests: [] });
        navigate("/auth", { force: true });
      }
      state.ui.serverError = getSaveErrorMessage(error);
      showToast(getSaveErrorMessage(error));
    } finally {
      serverSaveInFlight = false;
      serverSavePromise = null;
      if (serverSaveQueued) {
        serverSaveQueued = false;
        scheduleServerSync();
      }
    }
  })();

  return serverSavePromise;
}

function scheduleServerSync() {
  if (state.ui.bootstrapping || !state.currentUserId) {
    return;
  }
  const userSignature = currentUserSignature();
  const sharingSignature = sharingRequestsSignature();
  if (userSignature === lastServerUserSignature && sharingSignature === lastServerSharingSignature) {
    return;
  }
  if (serverSaveTimeoutId) {
    window.clearTimeout(serverSaveTimeoutId);
  }
  serverSaveTimeoutId = window.setTimeout(() => {
    void flushServerSync();
  }, 280);
}

async function bootstrapFromServer() {
  state.ui.bootstrapping = true;
  renderApp();
  try {
    const snapshot = await apiRequest("/bootstrap");
    applyServerSnapshot(snapshot);
  } catch (error) {
    state.ui = normalizeUiState({
      ...state.ui,
      bootstrapping: false,
      serverError: "当前无法连接 API 或数据库，请检查 `.env.local` / Vercel 环境变量，并确认使用 `npm run dev` 或线上部署地址访问。",
    });
  }
  renderApp();
}

function getModuleLabel(moduleId) {
  return MODULES.find((module) => module.id === moduleId)?.label || moduleId;
}

function getModuleMaterials(moduleId) {
  return (MATERIAL_LIBRARY[moduleId] || []).map((title) => ({
    id: `${moduleId}:${title}`,
    title,
    moduleId,
  }));
}

function getAllMaterials() {
  return MODULES.flatMap((module) => getModuleMaterials(module.id));
}

function getMaterialTitle(materialId) {
  return materialId.split(":").slice(1).join(":");
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getWelcomeMessage(user) {
  const tonePref = user.onboarding.preferences.welcomeTone;
  let tone = tonePref;
  if (tonePref === "auto") {
    const tones = ["encouraging", "gentle", "formal"];
    tone = tones[hashString(`${todayISO()}-${user.id}`) % tones.length];
  }
  const messages = WELCOME_LIBRARY[tone] || WELCOME_LIBRARY.formal;
  return messages[hashString(`${todayISO()}-${user.email}`) % messages.length];
}

function getModuleWeight(user, moduleId) {
  const target = user.onboarding.targetScores;
  const current = user.onboarding.currentLevels;
  const averageGap =
    (toNumber(target.listening, 6.5) - toNumber(current.listening, 5.5) +
      toNumber(target.speaking, 6.5) - toNumber(current.speaking, 5.5) +
      toNumber(target.reading, 6.5) - toNumber(current.reading, 5.5) +
      toNumber(target.writing, 6.5) - toNumber(current.writing, 5.5)) /
    4;

  if (moduleId === "vocabulary") {
    return 1 + Math.max(0.6, averageGap * 0.5);
  }
  if (moduleId === "grammar") {
    return 1 + Math.max(0.4, (toNumber(target.writing, 6.5) - toNumber(current.writing, 5.5)) * 0.65);
  }

  const gap = toNumber(target[moduleId], 6.5) - toNumber(current[moduleId], 5.5);
  return 1 + Math.max(0.3, gap);
}

function getDayCapacity(user, iso) {
  const date = parseISODate(iso);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const activeSlots = isWeekend
    ? user.onboarding.availability.weekend.length
    : user.onboarding.availability.weekday.length;
  const dailyMinutes = toNumber(user.onboarding.dailyStudyHours, 3) * 60;
  if (!activeSlots) {
    return dailyMinutes;
  }
  return Math.min(dailyMinutes, activeSlots * 60);
}

function patternMatchesMaterial(pattern, titles) {
  if (!pattern.materialHint) {
    return true;
  }
  return titles.some((title) => title.includes(pattern.materialHint));
}

function pickTaskPattern(user, moduleId, rotation, titles) {
  const patterns = (TASK_PATTERNS[moduleId] || []).filter((pattern) => patternMatchesMaterial(pattern, titles));
  const fallbackPatterns = (TASK_PATTERNS[moduleId] || []).filter((pattern) => !pattern.materialHint);
  const targetScore = toNumber(
    user.onboarding.targetScores[moduleId],
    toNumber(user.onboarding.targetScores.overall, 6.5)
  );
  const examPressure = daysUntil(user.onboarding.examDate) <= 30;
  const pool = (patterns.length ? patterns : fallbackPatterns).flatMap((pattern) => {
    let repeats = 1;
    if (targetScore >= 8 && pattern.priorityForHighBand) {
      repeats += 2;
    }
    if (examPressure && pattern.action.includes("机考模拟")) {
      repeats += 1;
    }
    return Array.from({ length: repeats }, () => pattern);
  });
  return pool[rotation % pool.length];
}

function pickMaterialName(titles, pattern, index) {
  const filtered = pattern.materialHint
    ? titles.filter((title) => title.includes(pattern.materialHint))
    : titles;
  const pool = filtered.length ? filtered : titles;
  return pool[index % pool.length];
}

function isMockMaterial(materialName = "") {
  return materialName.includes("机考模拟");
}

function isMockTask(task) {
  return Boolean(task) && (task.title.includes("机考模拟") || isMockMaterial(task.materialName));
}

function getMockModuleFromTask(task) {
  if (!task) {
    return "";
  }
  return ["listening", "reading"].includes(task.moduleId) ? task.moduleId : "";
}

function generatePlanTasks(user) {
  const selectedModules = user.onboarding.modules.slice();
  const selectedMaterialIds = new Set(user.onboarding.materials);
  const materialMap = selectedModules.reduce((acc, moduleId) => {
    acc[moduleId] = getModuleMaterials(moduleId)
      .filter((item) => selectedMaterialIds.has(item.id))
      .map((item) => item.title);
    return acc;
  }, {});

  const modulesWithMaterials = selectedModules.filter((moduleId) => materialMap[moduleId]?.length);
  if (!modulesWithMaterials.length) {
    return [];
  }

  const urgencyDays = daysUntil(user.onboarding.examDate);
  const urgencyFactor = urgencyDays <= 30 ? 1.45 : urgencyDays <= 60 ? 1.25 : 1;
  const weights = modulesWithMaterials.map((moduleId) => ({
    moduleId,
    weight: getModuleWeight(user, moduleId) * urgencyFactor,
  }));

  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  const planTasks = [];
  const materialIndex = {};
  const verbIndex = {};

  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const date = addDays(todayISO(), dayOffset);
    const dayBudget = getDayCapacity(user, date);
    const taskCount = dayBudget < 90 ? 1 : dayBudget < 180 ? 2 : 3;
    const estimatedPerTask = Math.max(35, Math.round(dayBudget / taskCount / 5) * 5);
    const rotationSeed = hashString(`${user.id}-${date}`);

    for (let slot = 0; slot < taskCount; slot += 1) {
      const threshold = ((rotationSeed + slot * 17) % 1000) / 1000;
      let cursor = 0;
      let chosenModule = "";

      weights.forEach((item) => {
        cursor += item.weight / totalWeight;
        if (threshold <= cursor && !chosenModule) {
          chosenModule = item.moduleId;
        }
      });

      const moduleId = chosenModule || weights[slot % weights.length].moduleId;
      const titles = materialMap[moduleId];
      materialIndex[moduleId] = materialIndex[moduleId] || 0;
      verbIndex[moduleId] = verbIndex[moduleId] || 0;
      const pattern = pickTaskPattern(user, moduleId, rotationSeed + slot + verbIndex[moduleId], titles);
      const materialName = pickMaterialName(titles, pattern, materialIndex[moduleId]);
      const taskTitle = `《${materialName}》${pattern.action}`;
      const taskMinutes = Math.max(
        30,
        Math.round((estimatedPerTask * (pattern.durationMultiplier || 1)) / 5) * 5
      );

      materialIndex[moduleId] += 1;
      verbIndex[moduleId] += 1;

      planTasks.push({
        id: uid("task"),
        moduleId,
        title: taskTitle,
        materialName,
        date,
        estimatedMinutes: taskMinutes,
        status: "pending",
        sortOrder: dayOffset * 10 + slot + 1,
        notes: "",
        elapsedMs: 0,
        isTimerPaused: false,
        guidance: pattern.guidance || "",
        taskType: isMockMaterial(materialName) ? "mock" : "study",
        source: "system",
        createdAt: new Date().toISOString(),
        completedAt: null,
        lastStudiedAt: null,
        repeatStudyCount: 0,
      });
    }
  }

  return planTasks;
}

function regenerateUserPlan(user) {
  const preservedTasks = (user.tasks || []).filter(
    (task) => task.status === "completed" || task.source === "custom"
  );
  if (!usesSystemPlan(user)) {
    user.tasks = preservedTasks;
    return;
  }
  const freshTasks = generatePlanTasks(user);
  user.tasks = [...preservedTasks, ...freshTasks];
}

function buildStats(user) {
  const today = todayISO();
  const todayTasks = user.tasks.filter((task) => task.date === today);
  const completedToday = todayTasks.filter((task) => task.status === "completed").length;
  const totalToday = todayTasks.length;
  const todayMinutes = user.records
    .filter((record) => record.date === today)
    .reduce((sum, record) => sum + record.durationMinutes, 0);

  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(today, -index));
  const weekTasks = user.tasks.filter((task) => weekDates.includes(task.date));
  const weekCompleted = weekTasks.filter((task) => task.status === "completed").length;
  const weekRate = weekTasks.length ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

  return {
    totalToday,
    completedToday,
    todayMinutes,
    weekRate,
  };
}

function escapeICS(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatICSDateTime(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function getAvailableHours(user, iso) {
  const date = parseISODate(iso);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const slotIndexes = isWeekend ? user.onboarding.availability.weekend : user.onboarding.availability.weekday;
  if (!slotIndexes.length) {
    return [19];
  }
  return slotIndexes.map((index) => index + 7);
}

function buildTaskCalendarEvents(user, tasks) {
  const grouped = tasks.reduce((acc, task) => {
    acc[task.date] = acc[task.date] || [];
    acc[task.date].push(task);
    return acc;
  }, {});

  return Object.entries(grouped).flatMap(([date, items]) => {
    const ordered = items.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const availableHours = getAvailableHours(user, date);
    let currentHour = availableHours[0];
    return ordered.map((task, index) => {
      const start = new Date(`${date}T${pad(currentHour)}:00:00`);
      const end = new Date(start.getTime() + task.estimatedMinutes * 60000);
      const suggestedNext = end.getHours() + (end.getMinutes() > 0 ? 1 : 0);
      currentHour = availableHours[index + 1] || Math.max(currentHour + 1, suggestedNext);
      return {
        uid: `${task.id}@ielts-atelier`,
        summary: `IELTS 学习 · ${getModuleLabel(task.moduleId)} · ${task.title}`,
        description: `${task.materialName}\n预计时长：${formatMinutes(task.estimatedMinutes)}`,
        start,
        end,
        date,
      };
    });
  });
}

function buildCheckinReminderEvents(user, dates) {
  return dates.map((date) => {
    const dayTasks = user.tasks.filter((task) => task.date === date && task.status !== "completed");
    const start = new Date(`${date}T21:00:00`);
    const end = new Date(`${date}T21:20:00`);
    return {
      uid: `checkin-${date}@ielts-atelier`,
      summary: `IELTS 打卡 · 今日任务 ${dayTasks.length} 项`,
      description: dayTasks.length
        ? dayTasks.map((task) => `- ${getModuleLabel(task.moduleId)} · ${task.title}`).join("\n")
        : "今天已无待完成任务，记得完成打卡。",
      start,
      end,
      date,
    };
  });
}

function createICSContent(events) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IELTS Atelier//Study Calendar//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  events.forEach((event) => {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.uid}`);
    lines.push(`DTSTAMP:${formatICSDateTime(new Date())}`);
    lines.push(`DTSTART:${formatICSDateTime(event.start)}`);
    lines.push(`DTEND:${formatICSDateTime(event.end)}`);
    lines.push(`SUMMARY:${escapeICS(event.summary)}`);
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportCalendarForScope(user, scope, moduleId = "") {
  let tasks = [];
  if (scope === "today") {
    tasks = user.tasks.filter((task) => task.date === todayISO() && task.status !== "completed");
  } else if (scope === "week") {
    const days = Array.from({ length: 7 }, (_, index) => addDays(todayISO(), index));
    tasks = user.tasks.filter((task) => days.includes(task.date) && task.status !== "completed");
  } else if (scope === "module-week") {
    const days = Array.from({ length: 7 }, (_, index) => addDays(todayISO(), index));
    tasks = user.tasks.filter(
      (task) => days.includes(task.date) && task.status !== "completed" && task.moduleId === moduleId
    );
  }
  if (!tasks.length) {
    showToast("当前范围内没有可导出的待完成任务。");
    return;
  }
  const dates = Array.from(new Set(tasks.map((task) => task.date)));
  const events = [...buildTaskCalendarEvents(user, tasks), ...buildCheckinReminderEvents(user, dates)];
  const label = scope === "today" ? "today" : scope === "week" ? "7days" : `${moduleId}-7days`;
  downloadTextFile(`ielts-atelier-${label}.ics`, createICSContent(events), "text/calendar");
  showToast("已生成 Apple Calendar 导入文件。");
}

function parseICSDateValue(value) {
  if (!value) {
    return null;
  }
  const normalized = value.replace("Z", "");
  if (normalized.length === 8) {
    return new Date(
      `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}T00:00:00`
    );
  }
  return new Date(
    `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}T${normalized.slice(9, 11)}:${normalized.slice(11, 13)}:00`
  );
}

function parseICSFile(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  const events = [];
  let current = null;
  lines.forEach((line) => {
    if (line === "BEGIN:VEVENT") {
      current = {};
      return;
    }
    if (line === "END:VEVENT") {
      if (current?.summary && current?.start) {
        events.push(current);
      }
      current = null;
      return;
    }
    if (!current) {
      return;
    }
    if (line.startsWith("SUMMARY:")) {
      current.summary = line.slice(8).replace(/\\,/g, ",").replace(/\\n/g, "\n");
    } else if (line.startsWith("DTSTART")) {
      current.start = parseICSDateValue(line.split(":").pop());
    } else if (line.startsWith("DTEND")) {
      current.end = parseICSDateValue(line.split(":").pop());
    } else if (line.startsWith("DESCRIPTION:")) {
      current.description = line.slice(12).replace(/\\,/g, ",").replace(/\\n/g, "\n");
    }
  });
  return events.map((event) => ({
    id: uid("calendar"),
    title: event.summary,
    description: event.description || "",
    date: `${event.start.getFullYear()}-${pad(event.start.getMonth() + 1)}-${pad(event.start.getDate())}`,
    startTime: `${pad(event.start.getHours())}:${pad(event.start.getMinutes())}`,
    endTime: event.end ? `${pad(event.end.getHours())}:${pad(event.end.getMinutes())}` : "",
  }));
}

function getCalendarEventsForDate(user, date) {
  return (user.calendarEvents || []).filter((event) => event.date === date);
}

function getMockSessionKey(moduleId, materialName, taskId = "") {
  return taskId || `${moduleId}:${materialName}`;
}

function getMockExamForMaterial(moduleId, materialName) {
  const resolvedModuleId =
    moduleId && MOCK_EXAMS[moduleId]
      ? moduleId
      : materialName.includes("阅读")
        ? "reading"
        : materialName.includes("听力")
          ? "listening"
          : moduleId;
  const exam = MOCK_EXAMS[resolvedModuleId];
  if (!exam) {
    return null;
  }
  return {
    ...exam,
    materialName,
    title: materialName || `${getModuleLabel(resolvedModuleId)}机考模拟`,
  };
}

function ensureMockSession(user, sessionKey, moduleId, materialName) {
  user.mockSessions[sessionKey] = user.mockSessions[sessionKey] || {
    moduleId,
    materialName,
    answers: {},
    submitted: false,
    showAnswers: false,
    score: 0,
    total: 0,
  };
  return user.mockSessions[sessionKey];
}

function getMockQuestions(exam) {
  if (!exam) {
    return [];
  }
  if (exam.sections) {
    return exam.sections.flatMap((section) => section.questions);
  }
  return exam.passages.flatMap((passage) => passage.questions);
}

function calculateMockScore(exam, answers) {
  const questions = getMockQuestions(exam);
  const correct = questions.filter((question) => {
    const submitted = String(answers[question.number] || "").trim().toLowerCase();
    const expected = String(question.answer || "").trim().toLowerCase();
    return submitted === expected;
  }).length;
  return {
    score: correct,
    total: questions.length,
  };
}

function getMockPlayerPosition(sessionKey, durationMinutes) {
  const player = state.ui.mockPlayer;
  if (!player || player.sessionKey !== sessionKey) {
    return 0;
  }
  const elapsed = player.playing ? player.baseMs + (Date.now() - player.startedAt) : player.baseMs;
  return Math.min(elapsed, durationMinutes * 60000);
}

function getMockExamElapsed(sessionKey, durationMinutes) {
  const examTimer = state.ui.mockExamTimer;
  if (!examTimer || examTimer.sessionKey !== sessionKey) {
    return 0;
  }
  const elapsed = examTimer.running ? examTimer.baseMs + (Date.now() - examTimer.startedAt) : examTimer.baseMs;
  return Math.min(elapsed, durationMinutes * 60000);
}

function getRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/auth";
  const normalized = hash.startsWith("/") ? hash : `/${hash}`;
  const [path, queryString] = normalized.split("?");
  const parts = path.split("/").filter(Boolean);
  return {
    path,
    parts,
    query: new URLSearchParams(queryString || ""),
  };
}

function ensureValidRoute(route, user) {
  if (!user) {
    if (route.parts[0] !== "auth") {
      navigate("/auth", { force: true });
      return false;
    }
    return true;
  }

  if (!user.onboardingCompleted) {
    if (!["onboarding", "generated"].includes(route.parts[0])) {
      navigate("/onboarding", { force: true });
      return false;
    }
    return true;
  }

  if (route.parts[0] === "generated") {
    if (user.showGeneratedPage) {
      return true;
    }
    navigate("/home", { force: true });
    return false;
  }

  if (route.parts[0] === "mock") {
    navigate("/home", { force: true });
    return false;
  }

  if (["auth", "onboarding"].includes(route.parts[0])) {
    navigate("/home", { force: true });
    return false;
  }

  return true;
}

function navigate(path, options = {}) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!options.force && shouldPauseBeforeNavigate(normalized)) {
    setState((draft) => {
      draft.ui.modal = {
        type: "pause-timer",
        nextPath: normalized,
      };
    });
    return;
  }
  if (!normalized.startsWith("/task")) {
    state.ui.studyEntry = null;
  }
  state.ui.lastStablePath = normalized;
  state.ui.ignoreNextHashChange = false;
  persistState();
  window.location.hash = normalized;
}

function shouldPauseBeforeNavigate(nextPath) {
  const currentRoute = getRoute();
  if (!["task", "mock"].includes(currentRoute.parts[0])) {
    return false;
  }
  const activeTimer = state.ui.activeTimer;
  if (!activeTimer) {
    return false;
  }
  const nextRoute = parseRouteFromPath(nextPath);
  const currentTaskId =
    currentRoute.parts[0] === "task" ? currentRoute.parts[1] : currentRoute.query.get("task") || "";
  if (!currentTaskId || activeTimer.taskId !== currentTaskId) {
    return false;
  }
  const nextTaskId =
    nextRoute.parts[0] === "task" ? nextRoute.parts[1] : nextRoute.parts[0] === "mock" ? nextRoute.query.get("task") || "" : "";
  return !(["task", "mock"].includes(nextRoute.parts[0]) && nextTaskId === currentTaskId);
}

function parseRouteFromPath(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const [purePath, queryString] = normalized.split("?");
  return {
    parts: purePath.split("/").filter(Boolean),
    query: new URLSearchParams(queryString || ""),
  };
}

function startTimer(taskId, mode = "normal") {
  const task = getCurrentUser()?.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }
  setState(
    (draft) => {
      draft.ui.studyEntry = { taskId, mode };
      draft.ui.activeTimer = {
        taskId,
        startedAt: Date.now(),
        baseElapsedMs: task.elapsedMs || 0,
      };
      task.isTimerPaused = false;
      task.lastStudiedAt = new Date().toISOString();
    },
    { render: false }
  );
}

function pauseActiveTimer() {
  const activeTimer = state.ui.activeTimer;
  if (!activeTimer) {
    return;
  }
  setState(
    (draft) => {
      const user = getCurrentUser();
      const task = user?.tasks.find((item) => item.id === activeTimer.taskId);
      if (!task) {
        draft.ui.activeTimer = null;
        return;
      }
      task.elapsedMs = activeTimer.baseElapsedMs + (Date.now() - activeTimer.startedAt);
      task.isTimerPaused = true;
      draft.ui.activeTimer = null;
    },
    { render: false }
  );
}

function resetTaskTimer(taskId) {
  setState(
    (draft) => {
      const user = getCurrentUser();
      const task = user?.tasks.find((item) => item.id === taskId);
      if (!task) {
        return;
      }
      task.elapsedMs = 0;
      task.isTimerPaused = false;
      if (draft.ui.activeTimer?.taskId === taskId) {
        draft.ui.activeTimer = null;
      }
    },
    { render: false }
  );
}

function getTaskElapsed(task) {
  const activeTimer = state.ui.activeTimer;
  if (activeTimer?.taskId === task.id) {
    return activeTimer.baseElapsedMs + (Date.now() - activeTimer.startedAt);
  }
  return task.elapsedMs || 0;
}

function completeTask(taskId) {
  const user = getCurrentUser();
  const task = user?.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }
  const active = state.ui.activeTimer?.taskId === taskId;
  const elapsedMs = active ? getTaskElapsed(task) : task.elapsedMs;
  const durationMinutes = Math.max(15, Math.round((elapsedMs || task.estimatedMinutes * 60000) / 60000));

  setState((draft) => {
    const currentUser = getCurrentUser();
    const currentTask = currentUser?.tasks.find((item) => item.id === taskId);
    if (!currentTask) {
      return;
    }
    currentTask.status = "completed";
    currentTask.completedAt = new Date().toISOString();
    currentTask.lastSessionMs = elapsedMs || task.estimatedMinutes * 60000;
    currentTask.elapsedMs = 0;
    currentTask.isTimerPaused = false;
    currentTask.lastStudiedAt = new Date().toISOString();
    currentUser.records.unshift({
      id: uid("record"),
      taskId: currentTask.id,
      moduleId: currentTask.moduleId,
      date: currentTask.date,
      durationMinutes,
      taskName: currentTask.title,
      notes: currentTask.notes || "",
      materialName: currentTask.materialName,
      createdAt: new Date().toISOString(),
    });
    if (draft.ui.activeTimer?.taskId === taskId) {
      draft.ui.activeTimer = null;
    }
    draft.ui.completionFlash = {
      message: "Finished",
      timestamp: Date.now(),
    };
    draft.ui.studyEntry = null;
  });
}

function reorderTasksInGroup(user, taskId, targetTaskId) {
  const dragged = user.tasks.find((task) => task.id === taskId);
  const target = user.tasks.find((task) => task.id === targetTaskId);
  if (!dragged || !target || dragged.moduleId !== target.moduleId || dragged.date !== target.date) {
    return;
  }
  const group = user.tasks
    .filter((task) => task.date === dragged.date && task.moduleId === dragged.moduleId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const fromIndex = group.findIndex((task) => task.id === taskId);
  const toIndex = group.findIndex((task) => task.id === targetTaskId);
  if (fromIndex === -1 || toIndex === -1) {
    return;
  }
  const [moved] = group.splice(fromIndex, 1);
  group.splice(toIndex, 0, moved);
  group.forEach((task, index) => {
    task.sortOrder = index + 1;
  });
}

function moveTaskWithinDay(user, taskId, direction) {
  const task = user.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }
  const sameDay = user.tasks
    .filter((item) => item.date === task.date)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const index = sameDay.findIndex((item) => item.id === taskId);
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || newIndex < 0 || newIndex >= sameDay.length) {
    return;
  }
  const [moved] = sameDay.splice(index, 1);
  sameDay.splice(newIndex, 0, moved);
  sameDay.forEach((item, position) => {
    item.sortOrder = position + 1;
  });
}

function showToast(message) {
  setState((draft) => {
    draft.ui.toast = { message, timestamp: Date.now() };
  });
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    setState((draft) => {
      draft.ui.toast = null;
    });
  }, 2400);
}

function openModal(modal) {
  setState((draft) => {
    draft.ui.modal = modal;
  });
}

function closeModal() {
  setState((draft) => {
    draft.ui.modal = null;
  });
}

function getTodaysTasks(user) {
  return user.tasks
    .filter((task) => task.date === todayISO())
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function getTasksByModule(tasks) {
  return MODULES.map((module) => ({
    module,
    tasks: tasks.filter((task) => task.moduleId === module.id).sort((a, b) => a.sortOrder - b.sortOrder),
  })).filter((group) => group.tasks.length);
}

function getTaskProgress(tasks) {
  const completed = tasks.filter((task) => task.status === "completed").length;
  return tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
}

function buildCalendarMonth(monthStr) {
  const [year, month] = monthStr.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const start = new Date(firstDay);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      iso: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      inMonth: date.getMonth() + 1 === month,
      day: date.getDate(),
    };
  });
}

function getSharingPerspective(user) {
  const outgoing = state.sharingRequests.filter((request) => request.fromUserId === user.id);
  const incoming = state.sharingRequests.filter((request) => request.toEmail === user.email);
  return { outgoing, incoming };
}

function findUserByEmail(email) {
  return state.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function summarizePermissions(permissions) {
  if (permissions.allModules) {
    return "查看打卡、学习记录与全部模块";
  }
  const modules = permissions.modules.map((item) => getModuleLabel(item)).join(" / ");
  const chunks = [];
  if (permissions.checkin) {
    chunks.push("打卡");
  }
  if (permissions.records) {
    chunks.push("学习记录");
  }
  if (modules) {
    chunks.push(modules);
  }
  return chunks.join("、") || "未设置";
}

function canAcceptAutomatically(targetUser) {
  return !targetUser.onboarding.privacy.manualApproval;
}

function getSharingCounterparty(request, currentUser) {
  if (request.fromUserId === currentUser.id) {
    return {
      name: findUserByEmail(request.toEmail)?.nickname || "待接受用户",
      email: request.toEmail,
    };
  }
  const sender = findUserById(request.fromUserId);
  return {
    name: sender?.nickname || "对方用户",
    email: sender?.email || request.toEmail,
  };
}

function renderAuthPage() {
  const isLogin = state.ui.authMode === "login";
  const actionLabel = state.ui.authPending
    ? isLogin
      ? "登录中..."
      : "注册中..."
    : isLogin
      ? "登录进入平台"
      : "注册并开始填写信息";
  const modeHint = "当前为正式多用户模式，账号和学习数据会通过 Vercel API 写入 Supabase Postgres。";
  return `
    <section class="auth-shell">
      <div class="auth-card">
        <div class="auth-brand">
          <div>
            <div class="eyebrow">IELTS Atelier</div>
            <h1 class="display-title">A disciplined<br/>study ritual.</h1>
            <p class="section-subtitle">
              一个偏正式、可双人使用的雅思学习平台原型。你可以注册独立账号，完成首次信息填写，让系统基于目标分数、考试日期、已有资料和时间安排自动生成每日学习任务。
            </p>
          </div>
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-label">核心体验</div>
              <div class="metric-value">学习平台感</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">任务生成依据</div>
              <div class="metric-value">目标 + 时间 + 资料</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">共享逻辑</div>
              <div class="metric-value">默认私密</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">完成反馈</div>
              <div class="metric-value">Finished + 彩带</div>
            </div>
          </div>
        </div>
        <div class="auth-form">
          <div>
            <div class="tab-row">
              <button class="tab-button ${isLogin ? "active" : ""}" data-action="switch-auth-mode" data-mode="login">登录</button>
              <button class="tab-button ${!isLogin ? "active" : ""}" data-action="switch-auth-mode" data-mode="register">注册</button>
            </div>
            <h2 class="section-title">${isLogin ? "欢迎回来" : "创建学习空间"}</h2>
            <p class="section-subtitle">
              ${isLogin ? "使用邮箱和密码进入你的学习主页。" : "注册后将进入 6 步引导流程，并可选择由系统自动排计划，或自己手动制定每日任务。"}
            </p>
            ${state.ui.serverError ? `<div class="helper-text" style="margin-top: 10px; color: var(--accent-red);">${state.ui.serverError}</div>` : ""}
          </div>
          <form data-form="${isLogin ? "login" : "register"}">
            <div class="form-grid">
              ${isLogin ? "" : `
                <div class="field">
                  <label>昵称</label>
                  <input name="nickname" placeholder="例如 Mia" required ${state.ui.authPending ? "disabled" : ""} />
                </div>
              `}
              <div class="field ${isLogin ? "full" : ""}">
                <label>邮箱</label>
                <input name="email" type="email" placeholder="name@example.com" required ${state.ui.authPending ? "disabled" : ""} />
              </div>
              <div class="field ${isLogin ? "" : ""}">
                <label>密码</label>
                <input name="password" type="password" placeholder="请输入密码" required ${state.ui.authPending ? "disabled" : ""} />
              </div>
              ${isLogin ? "" : `
                <div class="field">
                  <label>确认密码</label>
                  <input name="confirmPassword" type="password" placeholder="再次输入密码" required ${state.ui.authPending ? "disabled" : ""} />
                </div>
              `}
              ${isLogin ? "" : `
                <div class="field full">
                  <label>每日计划方式</label>
                  <select name="planMode" ${state.ui.authPending ? "disabled" : ""}>
                    <option value="manual">我自己设置每日计划</option>
                    <option value="system" selected>由系统自动生成计划</option>
                  </select>
                  <div class="helper-text" style="margin-top: 8px;">如果选择自己设置，完成引导后系统不会自动生成首版任务。</div>
                </div>
              `}
            </div>
            <div class="button-row" style="margin-top: 22px;">
              <button class="primary-button" type="submit" ${state.ui.authPending ? "disabled" : ""}>${actionLabel}</button>
            </div>
          </form>
          <div class="auth-footer">
            ${modeHint} 当前版本暂不包含忘记密码流程，适合作为产品原型和前端交互演示。
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderBootstrappingPage() {
  return `
    <section class="auth-shell">
      <div class="auth-card" style="grid-template-columns: 1fr;">
        <div class="auth-form" style="min-height: 320px; justify-content: center;">
          <div class="eyebrow">IELTS Atelier</div>
          <h1 class="display-title" style="max-width: 540px;">正在连接多用户学习空间</h1>
          <p class="section-subtitle">
            平台正在读取账号、任务和共享数据。请先配置 Supabase 数据库连接，并使用 <code>npm run dev</code> 或已部署的 Vercel 地址访问。
          </p>
        </div>
      </div>
    </section>
  `;
}

function renderWizardStepOne(user) {
  const scores = user.onboarding.targetScores;
  return `
    <div class="wizard-body">
      <div>
        <h2 class="section-title">第一步 · 目标分数与考试日期</h2>
        <p class="section-subtitle">系统会先根据目标总分、小分目标和考试日期判断备考强度。</p>
      </div>
      <div class="form-grid">
        <div class="field">
          <label>目标总分</label>
          <select name="target-overall">
            ${["6.0", "6.5", "7.0", "7.5", "8.0", "8.5"].map((value) => `
              <option value="${value}" ${scores.overall === value ? "selected" : ""}>${value}</option>
            `).join("")}
          </select>
        </div>
        ${["listening", "speaking", "reading", "writing"].map((moduleId) => `
          <div class="field">
            <label>${getModuleLabel(moduleId)}目标分</label>
            <select name="target-${moduleId}">
              ${["5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5"].map((value) => `
                <option value="${value}" ${scores[moduleId] === value ? "selected" : ""}>${value}</option>
              `).join("")}
            </select>
          </div>
        `).join("")}
        <div class="field full">
          <label>考试日期</label>
          <input name="examDate" type="date" value="${user.onboarding.examDate}" />
        </div>
      </div>
    </div>
  `;
}

function renderWizardStepTwo(user) {
  const levels = user.onboarding.currentLevels;
  return `
    <div class="wizard-body">
      <div>
        <h2 class="section-title">第二步 · 当前水平</h2>
        <p class="section-subtitle">第一版先采用手动填写，不做测评系统。你可以按照当前真实水平保守填写。</p>
      </div>
      <div class="form-grid">
        ${["listening", "speaking", "reading", "writing"].map((moduleId) => `
          <div class="field">
            <label>当前${getModuleLabel(moduleId)}水平</label>
            <select name="current-${moduleId}">
              ${["4.5", "5.0", "5.5", "6.0", "6.5", "7.0", "7.5"].map((value) => `
                <option value="${value}" ${levels[moduleId] === value ? "selected" : ""}>${value}</option>
              `).join("")}
            </select>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderWizardStepThree(user) {
  const selected = new Set(user.onboarding.materials);
  return `
    <div class="wizard-body">
      <div>
        <h2 class="section-title">第三步 · 已有资料</h2>
        <p class="section-subtitle">系统会优先排你已经勾选的正式出版资料，未勾选资料不会自动安排到计划中。</p>
      </div>
      ${MODULES.map((module) => `
        <div class="surface-card">
          <div class="form-head">
            <div>
              <div class="group-title">${module.label}</div>
              <div class="helper-text">常见实体书与正式出版资料</div>
            </div>
            <span class="badge">${getModuleMaterials(module.id).length} 项</span>
          </div>
          <div class="materials-grid" style="margin-top: 18px;">
            ${getModuleMaterials(module.id).map((material) => `
              <label class="material-option ${selected.has(material.id) ? "selected" : ""}">
                <input
                  type="checkbox"
                  data-action="toggle-material"
                  data-id="${material.id}"
                  ${selected.has(material.id) ? "checked" : ""}
                />
                <div>
                  <strong>${material.title}</strong>
                  <div class="helper-text">${module.label}模块常用资料</div>
                </div>
              </label>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderWizardStepFour(user) {
  return `
    <div class="wizard-body">
      <div>
        <h2 class="section-title">第四步 · 学习周期与空闲时间</h2>
        <p class="section-subtitle">学习周期采用固定选项，空闲时间用课程表式勾选，工作日与周末分开显示。</p>
      </div>
      <div class="form-grid">
        <div class="field">
          <label>准备学习几个月</label>
          <select name="studyDuration">
            ${["1", "2", "3", "6", "12"].map((value) => `
              <option value="${value}" ${user.onboarding.studyDuration === value ? "selected" : ""}>${value} 个月</option>
            `).join("")}
          </select>
        </div>
        <div class="field">
          <label>每天可学习时长</label>
          <select name="dailyStudyHours">
            ${["1", "2", "3", "4", "5", "6"].map((value) => `
              <option value="${value}" ${user.onboarding.dailyStudyHours === value ? "selected" : ""}>${value} 小时</option>
            `).join("")}
          </select>
        </div>
      </div>
      <div class="surface-card">
        <div class="form-head">
          <div>
            <div class="group-title">每周空闲时间表</div>
            <div class="helper-text">点击方格切换状态。工作日和周末分别记录，1 小时一个格子。</div>
          </div>
        </div>
        <div class="schedule-grid" style="margin-top: 18px;">
          <div class="schedule-header"></div>
          ${SCHEDULE_SLOTS.map((slot) => `<div class="schedule-header">${slot}</div>`).join("")}
          <div class="schedule-label">工作日</div>
          ${SCHEDULE_SLOTS.map((slot, index) => `
            <button
              type="button"
              class="schedule-cell ${user.onboarding.availability.weekday.includes(index) ? "active" : ""}"
              data-action="toggle-slot"
              data-kind="weekday"
              data-index="${index}"
            >${user.onboarding.availability.weekday.includes(index) ? "可学" : ""}</button>
          `).join("")}
          <div class="schedule-label">周末</div>
          ${SCHEDULE_SLOTS.map((slot, index) => `
            <button
              type="button"
              class="schedule-cell ${user.onboarding.availability.weekend.includes(index) ? "active" : ""}"
              data-action="toggle-slot"
              data-kind="weekend"
              data-index="${index}"
            >${user.onboarding.availability.weekend.includes(index) ? "可学" : ""}</button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderWizardStepFive(user) {
  const selected = new Set(user.onboarding.modules);
  return `
    <div class="wizard-body">
      <div>
        <h2 class="section-title">第五步 · 当前加入计划的模块</h2>
        <p class="section-subtitle">有些用户前期不想排写作和口语，所以模块支持先选，后续也能在设置页修改。</p>
      </div>
      <div class="module-toggle-grid">
        ${MODULES.map((module) => `
          <label class="module-toggle ${selected.has(module.id) ? "selected" : ""}">
            <input
              type="checkbox"
              data-action="toggle-module"
              data-module="${module.id}"
              ${selected.has(module.id) ? "checked" : ""}
            />
            <div>
              <strong>${module.label}</strong>
              <div class="helper-text">当前${selected.has(module.id) ? "会" : "不会"}加入自动排课</div>
            </div>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function renderWizardStepSix(user) {
  const prefs = user.onboarding.preferences;
  const privacy = user.onboarding.privacy;
  const usesAutoPlan = usesSystemPlan(user);
  return `
    <div class="wizard-body">
      <div>
        <h2 class="section-title">第六步 · 其他设置</h2>
        <p class="section-subtitle">${usesAutoPlan ? "这里保留页面体验设置与授权默认设置。完成后系统将生成你的首版学习计划。" : "这里保留页面体验设置与授权默认设置。完成后会直接进入首页，并保留为自定义计划模式。"}</p>
      </div>
      <div class="settings-grid">
        <div class="surface-card">
          <div class="group-title">页面体验设置</div>
          <div class="helper-text" style="margin-top: 8px;">控制首页气质、欢迎语风格与默认展示区域。</div>
          <div class="form-grid" style="margin-top: 18px;">
            <div class="field">
              <label>整体风格</label>
              <select name="pref-mood">
                <option value="formal" ${prefs.mood === "formal" ? "selected" : ""}>偏正式</option>
                <option value="relaxed" ${prefs.mood === "relaxed" ? "selected" : ""}>偏轻松</option>
              </select>
            </div>
            <div class="field">
              <label>欢迎语气质</label>
              <select name="pref-welcomeTone">
                <option value="auto" ${prefs.welcomeTone === "auto" ? "selected" : ""}>自动轮换</option>
                <option value="encouraging" ${prefs.welcomeTone === "encouraging" ? "selected" : ""}>学习鼓励型</option>
                <option value="gentle" ${prefs.welcomeTone === "gentle" ? "selected" : ""}>温柔陪伴型</option>
                <option value="formal" ${prefs.welcomeTone === "formal" ? "selected" : ""}>高级正式感</option>
              </select>
            </div>
          </div>
          <div style="margin-top: 18px;">
            <div class="muted-label">首页显示区域</div>
            <div class="chip-grid" style="margin-top: 12px;">
              ${[
                ["overview", "概览区"],
                ["modules", "模块卡片"],
                ["tasks", "今天总任务区"],
                ["records", "完成率摘要"],
              ].map(([key, label]) => `
                <button
                  type="button"
                  class="toggle-chip ${prefs.homeSections.includes(key) ? "active" : ""}"
                  data-action="toggle-home-section"
                  data-key="${key}"
                >${label}</button>
              `).join("")}
            </div>
          </div>
        </div>
        <div class="surface-card">
          <div class="group-title">授权默认设置</div>
          <div class="helper-text" style="margin-top: 8px;">决定其他人是否能给你发起查看请求，以及是否需要你手动接受。</div>
          <div class="module-toggle-grid" style="margin-top: 18px;">
            ${[
              ["allowRequests", "允许别人向我发起授权请求", privacy.allowRequests],
              ["manualApproval", "授权请求需要我手动接受", privacy.manualApproval],
              ["defaultPrivate", "默认学习内容全部私密", privacy.defaultPrivate],
            ].map(([key, label, checked]) => `
              <label class="toggle-option ${checked ? "selected" : ""}">
                <input
                  type="checkbox"
                  data-action="toggle-privacy-setting"
                  data-key="${key}"
                  ${checked ? "checked" : ""}
                />
                <div>
                  <strong>${label}</strong>
                </div>
              </label>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderOnboardingPage(user) {
  const step = clamp(Number(getRoute().query.get("step") || 1), 1, 6);
  const progress = Math.round((step / 6) * 100);
  const usesAutoPlan = usesSystemPlan(user);
  const content = [
    renderWizardStepOne(user),
    renderWizardStepTwo(user),
    renderWizardStepThree(user),
    renderWizardStepFour(user),
    renderWizardStepFive(user),
    renderWizardStepSix(user),
  ][step - 1];

  return `
    <section class="wizard-shell">
      <div class="wizard-card">
        <div class="wizard-meta">
          <div>
            <div class="eyebrow">Onboarding</div>
            <h1 class="section-title" style="margin-top: 14px;">${user.nickname} 的学习信息填写</h1>
            <p class="section-subtitle">${usesAutoPlan ? "完成 6 步后，系统会先展示“你的计划已生成”页面，再带你进入首页。" : "完成 6 步后会直接进入首页，你可以保留系统基础结构并自己添加每日任务。"}</p>
          </div>
          <div class="metric-card">
            <div class="metric-label">当前进度</div>
            <div class="metric-value">${step} / 6</div>
          </div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
        ${content}
        <div class="button-row" style="margin-top: 30px;">
          ${step > 1 ? `<button class="ghost-button" data-action="wizard-prev" data-step="${step}">上一步</button>` : ""}
          ${step < 6 ? `<button class="primary-button" data-action="wizard-next" data-step="${step}">下一步</button>` : `<button class="primary-button" data-action="finish-onboarding">${usesAutoPlan ? "生成学习计划" : "完成设置并进入首页"}</button>`}
        </div>
      </div>
    </section>
  `;
}

function renderGeneratedPage(user) {
  const previewTasks = user.tasks.filter((task) => task.date === todayISO()).slice(0, 4);
  return `
    <section class="generated-shell">
      <div class="generated-card">
        <div class="eyebrow">Plan Ready</div>
        <h1 class="display-title" style="font-size: clamp(44px, 5vw, 74px); margin-top: 20px;">你的计划已生成</h1>
        <p class="section-subtitle">
          目标分数、考试倒计时、已加入模块与首日任务都已经准备好了。接下来你可以直接进入首页开始今天的学习。
        </p>
        <div class="summary-grid">
          <div class="stat-card">
            <div class="metric-label">目标总分</div>
            <div class="stat-value">${user.onboarding.targetScores.overall}</div>
          </div>
          <div class="stat-card">
            <div class="metric-label">考试倒计时</div>
            <div class="stat-value">${daysUntil(user.onboarding.examDate)} 天</div>
          </div>
          <div class="stat-card">
            <div class="metric-label">本期模块</div>
            <div class="stat-value">${user.onboarding.modules.map((item) => getModuleLabel(item)).join(" / ")}</div>
          </div>
        </div>
        <div class="surface-card" style="margin-top: 24px;">
          <div class="form-head">
            <div>
              <div class="group-title">第一天任务预览</div>
              <div class="helper-text">${formatDateLabel(todayISO())}</div>
            </div>
          </div>
          <div class="record-list" style="margin-top: 18px;">
            ${previewTasks.map((task) => `
              <div class="task-card">
                <div class="task-line">
                  <div>
                    <div class="task-name">${task.title}</div>
                    <div class="helper-text">${getModuleLabel(task.moduleId)} · ${task.materialName}</div>
                  </div>
                  <span class="badge">${formatMinutes(task.estimatedMinutes)}</span>
                </div>
              </div>
            `).join("") || `<div class="empty-card">你当前没有可排入的资料。可以返回引导页补勾选资料后重新生成计划。</div>`}
          </div>
        </div>
        <div class="button-row" style="margin-top: 28px;">
          <button class="primary-button" data-action="enter-home">进入首页</button>
        </div>
      </div>
    </section>
  `;
}

function renderSidebar(route) {
  const navItems = [
    { path: "/home", label: "首页", icon: "H" },
    ...MODULES.map((module) => ({ path: `/module/${module.id}`, label: module.label, icon: module.icon })),
    { path: "/records", label: "我的学习记录", icon: "R" },
    { path: "/checkin", label: "打卡", icon: "C" },
  ];

  return `
    <aside class="sidebar">
      <div class="sidebar-card">
        <div class="brand-lockup">
          <div class="brand-mark">IA</div>
          <div class="brand-text">
            <strong>IELTS Atelier</strong>
            <span>Study Dashboard</span>
          </div>
        </div>
        <button class="icon-button" data-action="toggle-sidebar">${state.ui.sidebarCollapsed ? "展开侧栏" : "收起侧栏"}</button>
        <nav class="sidebar-nav">
          ${navItems.map((item) => `
            <a
              href="#${item.path}"
              class="sidebar-link ${route.path === item.path ? "active" : ""}"
              data-path="${item.path}"
              data-action="navigate"
            >
              <span>${item.icon}</span>
              <span>${item.label}</span>
            </a>
          `).join("")}
        </nav>
        <div class="sidebar-hint">
          首页强调模块入口与今天总任务区。完整学习计划与共享授权放在右上角个人入口中。
        </div>
        <div class="sidebar-footer">Canvas-like structure, elevated finish.</div>
      </div>
    </aside>
  `;
}

function renderTopbar(user, route, title, subtitle) {
  const stats = buildStats(user);
  return `
    <div class="topbar">
      <div>
        <div class="eyebrow">Welcome, ${user.nickname}</div>
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      <div class="topbar-meta">
        <div class="metric-card">
          <div class="metric-label">今日完成</div>
          <div class="metric-value">${stats.completedToday}/${stats.totalToday || 0}</div>
        </div>
        <div class="profile-area">
          <button class="profile-trigger" data-action="toggle-profile-menu">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="avatar">${user.nickname.slice(0, 1).toUpperCase()}</div>
              <div style="text-align:left;">
                <strong>${user.nickname}</strong>
                <div class="helper-text">${user.email}</div>
              </div>
            </div>
            <span>▾</span>
          </button>
          ${state.ui.profileMenuOpen ? `
            <div class="profile-menu">
              ${[
                ["/settings", "个人设置", "账号、目标与时间安排"],
                ["/sharing", "共享 / 授权", "发起、接受和撤销共享关系"],
                ["/full-plan", "完整学习计划", "查看未来 7 天学习安排"],
              ].map(([path, label, desc]) => `
                <button class="dropdown-item" data-action="navigate" data-path="${path}">
                  <strong>${label}</strong>
                  <span class="helper-text">${desc}</span>
                </button>
              `).join("")}
              <button class="dropdown-item" data-action="logout">
                <strong>退出登录</strong>
                <span class="helper-text">返回登录页</span>
              </button>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderModuleCards(user) {
  const todayTasks = getTodaysTasks(user);
  return `
    <div class="card-grid">
      ${MODULES.map((module) => {
        const moduleTasks = todayTasks.filter((task) => task.moduleId === module.id);
        const remaining = moduleTasks.filter((task) => task.status !== "completed").length;
        const progress = getTaskProgress(moduleTasks);
        return `
          <article class="module-card">
            <div class="module-card-head">
              <span class="module-badge active">${module.icon}</span>
              <button class="tiny-button" data-action="navigate" data-path="/module/${module.id}">进入模块</button>
            </div>
            <div>
              <div class="module-card-title">${module.label}</div>
              <div class="helper-text">今天剩余 ${remaining} 个任务</div>
            </div>
            <div>
              <div class="row-between">
                <span class="muted-label">今日完成进度</span>
                <strong>${progress}%</strong>
              </div>
              <div class="progress-track" style="margin-top: 10px;"><span style="width:${progress}%"></span></div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderAppleCalendarCard(user, scope = "week", moduleId = "") {
  const importedCount = user.calendarEvents.length;
  return `
    <div class="surface-card">
      <div class="group-head">
        <div>
          <div class="group-title">Apple Calendar 联动</div>
          <div class="helper-text">导出学习任务与打卡提醒，也可以把 Apple Calendar 的 `.ics` 日历导回系统。</div>
        </div>
        <span class="badge">已导入 ${importedCount} 条日程</span>
      </div>
      <div class="button-row" style="margin-top: 16px;">
        <button class="secondary-button" data-action="export-calendar" data-scope="${scope}" data-module="${moduleId}">导出到 Apple Calendar</button>
        <button class="ghost-button" data-action="pick-calendar-file">导入 Apple Calendar .ics</button>
      </div>
    </div>
  `;
}

function renderImportedEventsBlock(user, date) {
  const events = getCalendarEventsForDate(user, date);
  if (!events.length) {
    return "";
  }
  return `
    <div style="margin-top: 12px;">
      <div class="muted-label" style="margin-bottom: 10px;">Apple Calendar 日程</div>
      <div class="record-list">
        ${events.map((event) => `
          <div class="record-card imported-event-card">
            <div class="record-head">
              <div>
                <div class="record-title">${event.title}</div>
                <div class="helper-text">${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}</div>
              </div>
              <span class="badge">外部日程</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderMockEntrySection(user, moduleId) {
  return "";
}

function renderTaskCard(task, options = {}) {
  const isCompleted = task.status === "completed";
  const startLabel = isCompleted ? "再次学习" : "开始学习";
  const route = getRoute();
  const isTaskRoute = route.parts[0] === "task" && route.parts[1] === task.id;
  const draggable = options.draggable && !isCompleted ? "true" : "false";
  const badgeLabel = isMockTask(task)
    ? "机考模拟"
    : task.source === "custom"
      ? "自定义"
      : isCompleted
        ? "已完成"
        : "待开始";
  return `
    <div
      class="task-card ${isCompleted ? "completed" : ""}"
      draggable="${draggable}"
      data-task-id="${task.id}"
      data-drop-task="${task.id}"
    >
      <div class="task-line">
        <div>
          <div class="task-name">${task.title}</div>
          <div class="helper-text">${getModuleLabel(task.moduleId)} · ${task.materialName || "自定义材料"} · 预计 ${formatMinutes(task.estimatedMinutes)}</div>
        </div>
        <span class="badge">${badgeLabel}</span>
      </div>
      <div class="task-actions">
        <div class="helper-text">${isCompleted && task.completedAt ? `完成于 ${formatDateLong(task.date)}` : `归属模块：${getModuleLabel(task.moduleId)}`}</div>
        <div class="button-row">
          <button
            class="tiny-button primary"
            data-action="open-task"
            data-task-id="${task.id}"
            data-mode="${isCompleted ? "restudy" : "normal"}"
          >${startLabel}</button>
          ${!isCompleted ? `<button class="tiny-button" data-action="complete-task" data-task-id="${task.id}">完成</button>` : ""}
          ${isTaskRoute ? `<button class="tiny-button" data-action="navigate" data-path="/home">返回首页</button>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderTaskGroupSection(tasks, options = {}) {
  const pending = tasks.filter((task) => task.status !== "completed");
  const completed = tasks.filter((task) => task.status === "completed");
  return `
    ${pending.map((task) => renderTaskCard(task, options)).join("")}
    ${completed.length ? `
      <div style="margin-top: 8px;">
        <div class="muted-label" style="margin-bottom: 10px;">已完成</div>
        <div class="record-list">
          ${completed.map((task) => renderTaskCard(task, options)).join("")}
        </div>
      </div>
    ` : ""}
  `;
}

function renderHomePage(user) {
  const stats = buildStats(user);
  const todayTasks = getTodaysTasks(user);
  const groupedTasks = getTasksByModule(todayTasks);
  const preferences = user.onboarding.preferences;
  const visibleSections = new Set(preferences.homeSections);

  return `
    ${visibleSections.has("overview") ? `
      <div class="hero-card surface-card">
        <div class="hero-copy">
          <div class="hero-kicker">Today's Focus</div>
          <h2>${getWelcomeMessage(user)}</h2>
          <p>
            你的目标总分是 ${user.onboarding.targetScores.overall}，考试日期为 ${formatDateLong(user.onboarding.examDate)}。系统会优先安排你已拥有的资料，并根据薄弱项与考试倒计时自动调节强度。
          </p>
        </div>
        <div class="summary-grid">
          <div class="stat-card">
            <div class="metric-label">考试倒计时</div>
            <div class="stat-value">${daysUntil(user.onboarding.examDate)} 天</div>
          </div>
          <div class="stat-card">
            <div class="metric-label">目标总分</div>
            <div class="stat-value">${user.onboarding.targetScores.overall}</div>
          </div>
          <div class="stat-card">
            <div class="metric-label">今日学习时长</div>
            <div class="stat-value">${formatMinutes(stats.todayMinutes)}</div>
          </div>
        </div>
      </div>
    ` : ""}
    ${visibleSections.has("modules") ? renderModuleCards(user) : ""}
    <div class="grid-two">
      <section class="surface-card">
        <div class="group-head">
          <div>
            <div class="group-title">今天总任务区</div>
            <div class="helper-text">按模块分组展示，可在组内拖动调整排序。</div>
          </div>
          <button class="tiny-button" data-action="open-custom-task-modal" data-date="${todayISO()}">新增自定义任务</button>
        </div>
        <div class="task-group" style="margin-top: 18px;">
          ${visibleSections.has("tasks") ? groupedTasks.map((group) => `
            <div class="surface-card">
              <div class="group-head">
                <div class="group-title">${group.module.label}</div>
                <span class="badge">${group.tasks.filter((item) => item.status !== "completed").length} 个待完成</span>
              </div>
              <div class="record-list" style="margin-top: 16px;">
                ${renderTaskGroupSection(group.tasks, { draggable: true })}
              </div>
            </div>
          `).join("") : `<div class="empty-card">你已在页面体验设置中隐藏今天总任务区。</div>`}
          ${!groupedTasks.length ? `<div class="empty-card">今天暂时没有任务。可以前往完整学习计划查看未来安排，或在设置里重新生成计划。</div>` : ""}
        </div>
      </section>
      <section class="record-list">
        <div class="surface-card">
          <div class="group-title">学习节奏摘要</div>
          <div class="stats-grid" style="grid-template-columns: 1fr; margin-top: 18px;">
            <div class="stat-card">
              <div class="metric-label">今日完成情况</div>
              <div class="stat-value">${stats.completedToday}/${stats.totalToday || 0}</div>
            </div>
            <div class="stat-card">
              <div class="metric-label">本周完成率</div>
              <div class="stat-value">${stats.weekRate}%</div>
            </div>
            <div class="stat-card">
              <div class="metric-label">当前加入模块</div>
              <div class="stat-value">${user.onboarding.modules.length} 个</div>
            </div>
          </div>
        </div>
        ${visibleSections.has("records") ? `
          <div class="surface-card">
            <div class="group-head">
              <div class="group-title">最近完成记录</div>
              <button class="tiny-button" data-action="navigate" data-path="/records">查看全部</button>
            </div>
            <div class="record-list" style="margin-top: 16px;">
              ${user.records.slice(0, 4).map((record) => `
                <div class="record-card">
                  <div class="record-head">
                    <div>
                      <div class="record-title">${record.taskName}</div>
                      <div class="helper-text">${getModuleLabel(record.moduleId)} · ${record.materialName}</div>
                    </div>
                    <span class="badge">${formatMinutes(record.durationMinutes)}</span>
                  </div>
                </div>
              `).join("") || `<div class="empty-card">完成任务后，这里会显示最近学习记录。</div>`}
            </div>
          </div>
        ` : ""}
      </section>
    </div>
  `;
}

function renderModulePage(user, moduleId) {
  const module = MODULES.find((item) => item.id === moduleId);
  const todayTasks = getTodaysTasks(user).filter((task) => task.moduleId === moduleId);
  const upcoming = user.tasks
    .filter((task) => task.moduleId === moduleId && task.date > todayISO())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return `
    <div class="surface-card">
      <div class="group-head">
        <div>
          <div class="eyebrow">${module?.label || "模块"}</div>
          <h2 class="section-title" style="margin-top: 10px;">今日任务</h2>
          <p class="section-subtitle">系统会根据目标分、已有资料、时间安排和薄弱项自动分配该模块任务。</p>
        </div>
        <div class="button-row">
          <button class="tiny-button" data-action="open-custom-task-modal" data-date="${todayISO()}" data-module="${moduleId}">新增自定义任务</button>
          ${["listening", "reading"].includes(moduleId) ? `<button class="secondary-button" data-action="export-calendar" data-scope="module-week" data-module="${moduleId}">导出本模块 7 天到 Apple Calendar</button>` : ""}
        </div>
      </div>
      <div class="record-list" style="margin-top: 18px;">
        ${todayTasks.length ? renderTaskGroupSection(todayTasks) : `<div class="empty-card">今天这个模块没有安排任务。你可以在设置里调整加入模块和学习强度。</div>`}
      </div>
    </div>
    <div class="surface-card" style="margin-top: 22px;">
      <div class="group-head">
        <div class="group-title">未来安排预览</div>
        <button class="tiny-button" data-action="navigate" data-path="/full-plan">查看完整学习计划</button>
      </div>
      <div class="record-list" style="margin-top: 16px;">
        ${upcoming.map((task) => `
          <div class="record-card">
            <div class="record-head">
              <div>
                <div class="record-title">${task.title}</div>
                <div class="helper-text">${formatDateLabel(task.date)} · ${task.materialName}</div>
              </div>
              <span class="badge">${formatMinutes(task.estimatedMinutes)}</span>
            </div>
          </div>
        `).join("") || `<div class="empty-card">未来 7 天内暂未安排该模块更多任务。</div>`}
      </div>
    </div>
    ${renderMockEntrySection(user, moduleId)}
  `;
}

function ensureTaskRouteTimer(task) {
  if (task.status === "completed" && state.ui.studyEntry?.taskId !== task.id) {
    return;
  }
  if (state.ui.activeTimer?.taskId === task.id) {
    return;
  }
  if (task.elapsedMs > 0 && task.isTimerPaused) {
    return;
  }
  startTimer(task.id, state.ui.studyEntry?.mode || "normal");
}

function renderTaskDetailPage(user, taskId) {
  const task = user.tasks.find((item) => item.id === taskId);
  if (!task) {
    return `<div class="empty-card">未找到该任务。</div>`;
  }
  ensureTaskRouteTimer(task);
  const elapsed = getTaskElapsed(task);
  const isPaused = task.isTimerPaused && state.ui.activeTimer?.taskId !== task.id;
  const isCompleted = task.status === "completed";
  const canRestudy = isCompleted || state.ui.studyEntry?.mode === "restudy";

  return `
    <div class="task-layout">
      <section class="record-list">
        <div class="surface-card">
          <div class="eyebrow">${getModuleLabel(task.moduleId)}</div>
          <h2 class="section-title" style="margin-top: 12px;">${task.title}</h2>
          <p class="section-subtitle">进入页面后计时会自动开始。离开页面时会提醒是否暂停计时，你也可以在这里记录今天的学习备注。</p>
          <div class="summary-grid" style="margin-top: 18px;">
            <div class="stat-card">
              <div class="metric-label">使用资料</div>
              <div class="stat-value">${task.materialName}</div>
            </div>
            <div class="stat-card">
              <div class="metric-label">预计时长</div>
              <div class="stat-value">${formatMinutes(task.estimatedMinutes)}</div>
            </div>
            <div class="stat-card">
              <div class="metric-label">任务日期</div>
              <div class="stat-value">${formatDateLong(task.date)}</div>
            </div>
          </div>
        </div>
        <div class="surface-card">
          <div class="group-head">
            <div>
              <div class="group-title">任务说明</div>
              <div class="helper-text">第一版先做到资料级任务，不拆到某页某篇。</div>
            </div>
          </div>
          <div class="detail-stack" style="margin-top: 16px;">
            <div>
              <div class="detail-key">操作建议</div>
              <div class="detail-value">${task.guidance || `围绕《${task.materialName}》完成今天的 ${task.title.replace(`《${task.materialName}》`, "")}。`}</div>
            </div>
            <div>
              <div class="detail-key">学习备注</div>
              <textarea
                placeholder="记录今天哪里没懂、学到了哪里、明天继续什么"
                data-action="update-task-notes"
                data-task-id="${task.id}"
              >${task.notes || ""}</textarea>
            </div>
          </div>
        </div>
      </section>
      <aside class="record-list">
        <div class="timer-panel">
          <div class="detail-key">学习计时器</div>
          <div class="timer-display" id="timer-display">${formatTimer(elapsed)}</div>
          <div class="helper-text" style="margin-top: 10px;">
            ${isPaused ? "你上次离开时已暂停计时。" : state.ui.activeTimer?.taskId === task.id ? "计时进行中。" : "当前未在计时。"}
          </div>
          <div class="button-row" style="margin-top: 18px;">
            ${isPaused ? `<button class="secondary-button" data-action="continue-timer" data-task-id="${task.id}">继续上次计时</button>` : ""}
            ${isPaused || canRestudy ? `<button class="ghost-button" data-action="restart-timer" data-task-id="${task.id}">重新开始</button>` : ""}
            ${!isCompleted ? `<button class="primary-button" data-action="complete-task" data-task-id="${task.id}">完成任务</button>` : `<button class="primary-button" data-action="record-restudy" data-task-id="${task.id}">记录本次学习</button>`}
          </div>
        </div>
        <div class="surface-card">
          <div class="group-title">${isCompleted ? "再次学习模式" : "完成逻辑"}</div>
          <div class="helper-text" style="margin-top: 10px;">
            ${isCompleted
              ? "已完成任务不会混在未完成任务里。你可以通过“再次学习”重新进入并记录新的学习时间。"
              : "点击完成后会触发 Finished 反馈与彩带庆祝效果，并写入学习记录。"}
          </div>
          <div class="button-row" style="margin-top: 18px;">
            <button class="tiny-button" data-action="navigate" data-path="/home">返回首页</button>
            <button class="tiny-button" data-action="navigate" data-path="/records">查看学习记录</button>
          </div>
        </div>
      </aside>
    </div>
  `;
}

function renderMockPage(user, moduleId) {
  const route = getRoute();
  const fallbackMockMaterial =
    getModuleMaterials(moduleId).find((material) => isMockMaterial(material.title))?.title || "";
  const materialName = safeDecodeURIComponent(route.query.get("material") || fallbackMockMaterial);
  const taskId = route.query.get("task") || "";
  const exam = getMockExamForMaterial(moduleId, materialName);
  if (!exam) {
    return `<div class="empty-card">暂未找到这套机考模拟。</div>`;
  }

  const sessionKey = getMockSessionKey(moduleId, materialName, taskId);
  const session = ensureMockSession(user, sessionKey, moduleId, materialName);
  const questions = getMockQuestions(exam);
  const durationMs = exam.durationMinutes * 60000;
  const examElapsed = getMockExamElapsed(sessionKey, exam.durationMinutes);
  const examRemaining = Math.max(0, durationMs - examElapsed);
  const positionMs = moduleId === "listening" ? getMockPlayerPosition(sessionKey, exam.durationMinutes) : 0;
  const progress = moduleId === "listening" ? Math.round((positionMs / durationMs) * 100) : 0;
  const activeSectionIndex =
    moduleId === "listening"
      ? exam.sections.findIndex((section, index) => {
          const boundary = exam.sections.slice(0, index + 1).reduce((sum, item) => sum + item.durationMinutes, 0) * 60000;
          return positionMs <= boundary;
        })
      : -1;
  const visibleListeningIndex = activeSectionIndex === -1 ? exam.sections.length - 1 : activeSectionIndex;
  const listeningSection = moduleId === "listening" ? exam.sections[visibleListeningIndex] : null;
  const linkedTask = taskId ? user.tasks.find((task) => task.id === taskId) : null;

  return `
    <div class="record-list">
      <div class="surface-card mock-exam-frame">
        <div class="mock-exam-topbar">
          <div class="mock-brand-block">
            <strong>IELTS on Computer</strong>
            <span>Prototype Exam Interface</span>
          </div>
          <div class="mock-exam-meta">
            <span class="badge">${moduleId === "listening" ? "Listening" : "Reading"}</span>
            <span class="badge">${questions.length} Questions</span>
            <span class="badge">${exam.durationMinutes} Minutes</span>
          </div>
        </div>
        <div class="group-head" style="margin-top: 18px;">
          <div>
            <div class="eyebrow">${moduleId === "listening" ? "Listening CBT" : "Reading CBT"}</div>
            <h2 class="section-title" style="margin-top: 10px;">${exam.title}</h2>
            <p class="section-subtitle">界面按机考风格高保真还原，当前题目内容为原型示例；支持资料入口、提交答案和看答案，不展示解析。</p>
          </div>
          <div class="button-row">
            ${taskId ? `<button class="ghost-button" data-action="navigate" data-path="/task/${taskId}">返回任务页</button>` : `<button class="ghost-button" data-action="navigate" data-path="/module/${moduleId}">返回模块页</button>`}
            <button class="secondary-button" data-action="reset-mock-session" data-session-key="${encodeURIComponent(sessionKey)}">重置本套</button>
          </div>
        </div>
        <div class="mock-exam-toolbar">
          <div class="mock-exam-status">
            <div class="detail-key">Exam Timer</div>
            <div class="mock-exam-time" id="mock-exam-time">${formatTimer(examRemaining)}</div>
          </div>
          <div class="button-row">
            <button class="tiny-button primary" data-action="toggle-mock-exam" data-session-key="${encodeURIComponent(sessionKey)}" data-duration="${exam.durationMinutes}">
              ${state.ui.mockExamTimer?.sessionKey === sessionKey && state.ui.mockExamTimer?.running ? "暂停考试" : "开始考试"}
            </button>
            <button class="tiny-button" data-action="reset-mock-exam" data-session-key="${encodeURIComponent(sessionKey)}" data-duration="${exam.durationMinutes}">重置倒计时</button>
          </div>
        </div>
      </div>
      <div class="mock-layout">
        <section class="mock-main surface-card">
          ${moduleId === "listening" ? `
            <div class="mock-player">
              <div class="row-between">
                <div>
                  <div class="detail-key">Audio Prototype</div>
                  <div class="detail-value" id="mock-player-label">${listeningSection.title} · ${listeningSection.context}</div>
                </div>
                <div class="button-row">
                  <button class="tiny-button primary" data-action="toggle-mock-player" data-session-key="${encodeURIComponent(sessionKey)}" data-duration="${exam.durationMinutes}">
                    ${state.ui.mockPlayer?.sessionKey === sessionKey && state.ui.mockPlayer?.playing ? "暂停" : "播放原型"}
                  </button>
                  <button class="tiny-button" data-action="reset-mock-player" data-session-key="${encodeURIComponent(sessionKey)}">重置播放器</button>
                </div>
              </div>
              <div class="progress-track mock-progress" style="margin-top: 12px;"><span id="mock-player-bar" style="width:${progress}%"></span></div>
              <div class="helper-text" id="mock-player-time" style="margin-top: 10px;">${formatTimer(positionMs)} / ${formatTimer(durationMs)} · 当前显示 ${listeningSection.title}</div>
            </div>
            <div class="record-list" style="margin-top: 18px;">
              <div class="mock-panel">
                <div class="group-title">${listeningSection.title}</div>
                <div class="helper-text" style="margin-top: 8px;">${listeningSection.summary}</div>
                <div class="mock-script-block">${listeningSection.prompt}</div>
              </div>
              ${exam.sections.map((section, index) => `
                <button
                  class="mock-tab ${index === visibleListeningIndex ? "active" : ""}"
                  data-action="jump-mock-section"
                  data-session-key="${encodeURIComponent(sessionKey)}"
                  data-position="${exam.sections.slice(0, index).reduce((sum, item) => sum + item.durationMinutes, 0) * 60000}"
                >${section.title}</button>
              `).join("")}
            </div>
          ` : `
            <div class="record-list">
              <div class="mock-reading-header">
                <span class="badge">Passages 1-3</span>
                <span class="helper-text">左侧文章区，右侧答题区，尽量接近机考双栏阅读体验。</span>
              </div>
              ${exam.passages.map((passage) => `
                <article class="mock-panel">
                  <div class="group-title">${passage.title}</div>
                  <div class="reading-passage">
                    ${passage.text.map((paragraph) => `<p>${paragraph}</p>`).join("")}
                  </div>
                </article>
              `).join("")}
            </div>
          `}
        </section>
        <aside class="mock-sidebar surface-card">
          <div class="group-head">
            <div>
              <div class="group-title">答题区</div>
              <div class="helper-text">题号导航、输入锁定与提交反馈按机考逻辑组织。</div>
            </div>
            <span class="badge">${questions.length} 题</span>
          </div>
          <div class="question-nav" style="margin-top: 16px;">
            ${questions.map((question) => `
              <button class="question-chip ${session.answers[question.number] ? "filled" : ""} ${session.showAnswers ? (String(session.answers[question.number] || "").trim().toLowerCase() === String(question.answer).trim().toLowerCase() ? "correct" : "wrong") : ""}">${question.number}</button>
            `).join("")}
          </div>
          <div class="record-list" style="margin-top: 18px;">
            ${questions.map((question) => `
              <div class="mock-question-card">
                <div class="detail-key">Question ${question.number}</div>
                <div class="helper-text" style="margin: 6px 0 12px;">${question.label}</div>
                ${question.type === "select" ? `
                  <select
                    class="mock-answer-input"
                    data-action="mock-answer"
                    data-session-key="${encodeURIComponent(sessionKey)}"
                    data-question="${question.number}"
                    ${session.submitted ? "disabled" : ""}
                  >
                    <option value="">Select</option>
                    ${question.options.map((option) => `<option value="${option}" ${session.answers[question.number] === option ? "selected" : ""}>${option}</option>`).join("")}
                  </select>
                ` : `
                  <input
                    class="mock-answer-input"
                    data-action="mock-answer"
                    data-session-key="${encodeURIComponent(sessionKey)}"
                    data-question="${question.number}"
                    value="${session.answers[question.number] || ""}"
                    placeholder="Type your answer"
                    ${session.submitted ? "disabled" : ""}
                  />
                `}
                ${session.showAnswers ? `<div class="mock-answer-result">正确答案：${question.answer}</div>` : ""}
              </div>
            `).join("")}
          </div>
          <div class="button-row" style="margin-top: 18px;">
            ${!session.submitted ? `<button class="primary-button" data-action="submit-mock" data-session-key="${encodeURIComponent(sessionKey)}" data-module="${moduleId}" data-material="${encodeURIComponent(materialName)}">提交答案</button>` : ""}
            ${session.submitted ? `<button class="secondary-button" data-action="show-mock-answers" data-session-key="${encodeURIComponent(sessionKey)}">看答案</button>` : ""}
            ${linkedTask && linkedTask.status !== "completed" ? `<button class="ghost-button" data-action="complete-task" data-task-id="${linkedTask.id}">完成当前任务</button>` : ""}
          </div>
          ${session.submitted ? `<div class="mock-score-banner">本次得分 ${session.score} / ${session.total}</div>` : ""}
        </aside>
      </div>
    </div>
  `;
}

function renderFullPlanPage(user) {
  const upcomingDays = Array.from({ length: 7 }, (_, index) => addDays(todayISO(), index));
  return `
    <div class="record-list">
      ${renderAppleCalendarCard(user, "week")}
      <div class="surface-card">
        <div class="group-head">
          <div>
            <div class="group-title">自定义任务</div>
            <div class="helper-text">你可以自己添加任务，系统任务会保留，不会被替换。</div>
          </div>
          <button class="primary-button" data-action="open-custom-task-modal" data-date="${todayISO()}">新增自定义任务</button>
        </div>
      </div>
      ${upcomingDays.map((date) => {
        const dayTasks = user.tasks
          .filter((task) => task.date === date)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        return `
          <section class="surface-card">
            <div class="group-head">
              <div>
                <div class="group-title">${formatDateLabel(date)}</div>
                <div class="helper-text">默认查看未来 7 天学习安排，当前版本支持调整任务顺序。</div>
              </div>
              <span class="badge">${dayTasks.length} 个任务</span>
            </div>
            <div class="record-list" style="margin-top: 16px;">
              ${dayTasks.map((task) => `
                <div class="task-card ${task.status === "completed" ? "completed" : ""}">
                  <div class="task-line">
                    <div>
                      <div class="task-name">${task.title}</div>
                      <div class="helper-text">${getModuleLabel(task.moduleId)} · ${task.materialName} · ${formatMinutes(task.estimatedMinutes)}</div>
                    </div>
                    <div class="button-row">
                      <button class="tiny-button" data-action="move-plan-task" data-task-id="${task.id}" data-direction="up">上移</button>
                      <button class="tiny-button" data-action="move-plan-task" data-task-id="${task.id}" data-direction="down">下移</button>
                    </div>
                  </div>
                </div>
              `).join("") || `<div class="empty-card">这一天暂无安排。</div>`}
            </div>
            ${renderImportedEventsBlock(user, date)}
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function renderRecordsPage(user) {
  const stats = buildStats(user);
  const view = state.ui.recordsView;
  const monthGrid = buildCalendarMonth(state.ui.recordsMonth);
  const recordsByDate = user.records.reduce((acc, record) => {
    acc[record.date] = acc[record.date] || [];
    acc[record.date].push(record);
    return acc;
  }, {});
  const groupedByModule = MODULES.map((module) => ({
    module,
    records: user.records.filter((record) => record.moduleId === module.id),
  })).filter((group) => group.records.length);

  return `
    <div class="surface-card">
      <div class="group-head">
        <div>
          <div class="group-title">学习记录</div>
          <div class="helper-text">支持日历视图和列表视图，默认展示日历。</div>
        </div>
        <div class="view-switch">
          <button class="view-button ${view === "calendar" ? "active" : ""}" data-action="switch-records-view" data-view="calendar">日历视图</button>
          <button class="view-button ${view === "list" ? "active" : ""}" data-action="switch-records-view" data-view="list">列表视图</button>
        </div>
      </div>
      <div class="summary-grid">
        <div class="stat-card">
          <div class="metric-label">今天完成了几个任务</div>
          <div class="stat-value">${stats.completedToday}/${stats.totalToday || 0}</div>
        </div>
        <div class="stat-card">
          <div class="metric-label">本周完成率</div>
          <div class="stat-value">${stats.weekRate}%</div>
        </div>
        <div class="stat-card">
          <div class="metric-label">今日总学习时长</div>
          <div class="stat-value">${formatMinutes(stats.todayMinutes)}</div>
        </div>
      </div>
    </div>
    ${view === "calendar" ? `
      <div class="surface-card" style="margin-top: 22px;">
        <div class="calendar-head">
          <div class="group-title">${state.ui.recordsMonth}</div>
          <div class="button-row">
            <button class="tiny-button" data-action="change-records-month" data-direction="-1">上个月</button>
            <button class="tiny-button" data-action="change-records-month" data-direction="1">下个月</button>
          </div>
        </div>
        <div class="calendar-grid" style="margin-top: 18px;">
          ${["一", "二", "三", "四", "五", "六", "日"].map((label) => `<div class="schedule-header">${label}</div>`).join("")}
          ${monthGrid.map((day) => {
            const records = recordsByDate[day.iso] || [];
            const totalMinutes = records.reduce((sum, record) => sum + record.durationMinutes, 0);
            return `
              <button class="calendar-cell ${day.inMonth ? "" : "inactive"} ${day.iso === todayISO() ? "today" : ""}" data-action="select-record-date" data-date="${day.iso}">
                <strong>${day.day}</strong>
                <span class="helper-text">${totalMinutes ? formatMinutes(totalMinutes) : "暂无记录"}</span>
              </button>
            `;
          }).join("")}
        </div>
      </div>
      <div class="surface-card" style="margin-top: 22px;">
        <div class="group-title">日期详情</div>
        <div class="record-list" style="margin-top: 16px;">
          ${(() => {
            const selectedDate = state.ui.selectedRecordDate || todayISO();
            const selectedRecords = recordsByDate[selectedDate] || [];
            return selectedRecords.map((record) => `
              <div class="record-card">
                <div class="record-head">
                  <div>
                    <div class="record-title">${record.taskName}</div>
                    <div class="helper-text">${getModuleLabel(record.moduleId)} · ${record.materialName}</div>
                  </div>
                  <span class="badge">${formatMinutes(record.durationMinutes)}</span>
                </div>
              </div>
            `).join("") || `<div class="empty-card">${formatDateLong(selectedDate)} 没有已完成任务。</div>`;
          })()}
        </div>
      </div>
    ` : `
      <div class="record-list" style="margin-top: 22px;">
        ${groupedByModule.map((group) => `
          <div class="surface-card">
            <div class="group-head">
              <div>
                <div class="group-title">${group.module.label}</div>
                <div class="helper-text">总学习时长 ${formatMinutes(group.records.reduce((sum, record) => sum + record.durationMinutes, 0))}</div>
              </div>
            </div>
            <div class="record-list" style="margin-top: 16px;">
              ${group.records.slice(0, 8).map((record) => `
                <div class="record-card">
                  <div class="record-head">
                    <div>
                      <div class="record-title">${record.taskName}</div>
                      <div class="helper-text">${formatDateLabel(record.date)} · ${record.materialName}</div>
                    </div>
                    <span class="badge">${formatMinutes(record.durationMinutes)}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("") || `<div class="empty-card">还没有学习记录，完成任务后这里会显示历史。</div>`}
      </div>
    `}
  `;
}

function renderCheckinPage(user) {
  const monthGrid = buildCalendarMonth(state.ui.checkinMonth);
  const checkedDates = new Set(user.checkins);
  const todayChecked = checkedDates.has(todayISO());
  const todayTasks = getTodaysTasks(user);
  const importedToday = getCalendarEventsForDate(user, todayISO());
  return `
    <div class="surface-card">
      <div class="group-head">
        <div>
          <div class="group-title">打卡页</div>
          <div class="helper-text">使用单独按钮打卡，并把今天的任务与 Apple Calendar 联动信息放在同一区域。</div>
        </div>
        <div class="button-row">
          <button class="primary-button" data-action="check-in-today" ${todayChecked ? "disabled" : ""}>${todayChecked ? "今日已打卡" : "今日打卡"}</button>
          <button class="secondary-button" data-action="export-calendar" data-scope="today">导出今日任务 + 打卡到 Apple Calendar</button>
          <button class="ghost-button" data-action="pick-calendar-file">导入 Apple Calendar .ics</button>
        </div>
      </div>
      <div class="grid-two" style="margin-top: 18px;">
        <div class="surface-card">
          <div class="group-title">今天要打卡的任务</div>
          <div class="record-list" style="margin-top: 14px;">
            ${todayTasks.map((task) => `
              <div class="record-card">
                <div class="record-head">
                  <div>
                    <div class="record-title">${task.title}</div>
                    <div class="helper-text">${getModuleLabel(task.moduleId)} · ${formatMinutes(task.estimatedMinutes)}</div>
                  </div>
                  <span class="badge">${task.status === "completed" ? "已完成" : "待完成"}</span>
                </div>
              </div>
            `).join("") || `<div class="empty-card">今天没有待打卡任务。</div>`}
          </div>
        </div>
        <div class="surface-card">
          <div class="group-title">今天的 Apple Calendar 日程</div>
          <div class="record-list" style="margin-top: 14px;">
            ${importedToday.map((event) => `
              <div class="record-card imported-event-card">
                <div class="record-head">
                  <div>
                    <div class="record-title">${event.title}</div>
                    <div class="helper-text">${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}</div>
                  </div>
                  <span class="badge">Apple</span>
                </div>
              </div>
            `).join("") || `<div class="empty-card">还没有导入 Apple Calendar 日程。</div>`}
          </div>
        </div>
      </div>
    </div>
    <div class="surface-card" style="margin-top: 22px;">
      <div class="calendar-head">
        <div class="group-title">${state.ui.checkinMonth}</div>
        <div class="button-row">
          <button class="tiny-button" data-action="change-checkin-month" data-direction="-1">上个月</button>
          <button class="tiny-button" data-action="change-checkin-month" data-direction="1">下个月</button>
        </div>
      </div>
      <div class="calendar-grid" style="margin-top: 18px;">
        ${["一", "二", "三", "四", "五", "六", "日"].map((label) => `<div class="schedule-header">${label}</div>`).join("")}
        ${monthGrid.map((day) => {
          const dayTaskCount = user.tasks.filter((task) => task.date === day.iso).length;
          const dayEventCount = getCalendarEventsForDate(user, day.iso).length;
          return `
            <div class="calendar-cell ${day.inMonth ? "" : "inactive"} ${day.iso === todayISO() ? "today" : ""}">
              <strong>${day.day}</strong>
              ${checkedDates.has(day.iso) ? `<div class="checkin-mark">✓</div>` : `<div class="helper-text">未打卡</div>`}
              <div class="helper-text">${dayTaskCount} 任务 · ${dayEventCount} 日程</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderSharingPage(user) {
  const perspective = getSharingPerspective(user);
  const detailRequest =
    state.sharingRequests.find((request) => request.id === state.ui.sharingDetailId) ||
    perspective.outgoing[0] ||
    perspective.incoming[0] ||
    null;

  return `
    <div class="sharing-grid">
      <div class="surface-card">
        <div class="group-title">新增授权</div>
        <p class="section-subtitle">通过对方注册邮箱发起共享请求。默认私密，对方接受后才生效。</p>
        <form data-form="sharing-request" style="margin-top: 18px;">
          <div class="form-grid">
            <div class="field full">
              <label>对方注册邮箱</label>
              <input name="email" type="email" placeholder="friend@example.com" required />
            </div>
          </div>
          <div class="module-toggle-grid" style="margin-top: 18px;">
            ${[
              ["checkin", "看打卡"],
              ["records", "看学习记录"],
              ["allModules", "看全部模块"],
            ].map(([key, label]) => `
              <label class="toggle-option">
                <input type="checkbox" name="${key}" />
                <div><strong>${label}</strong></div>
              </label>
            `).join("")}
          </div>
          <div style="margin-top: 18px;">
            <div class="muted-label">部分模块授权</div>
            <div class="module-toggle-grid" style="margin-top: 12px;">
              ${MODULES.map((module) => `
                <label class="toggle-option">
                  <input type="checkbox" name="module-${module.id}" />
                  <div><strong>${module.label}</strong></div>
                </label>
              `).join("")}
            </div>
          </div>
          <div class="button-row" style="margin-top: 18px;">
            <button class="primary-button" type="submit">发起授权</button>
          </div>
        </form>
      </div>
      <div class="surface-card">
        <div class="group-head">
          <div>
            <div class="group-title">我已经授权给谁了</div>
            <div class="helper-text">点击任意记录可查看权限细节或撤销。</div>
          </div>
        </div>
        <div class="sharing-list" style="margin-top: 18px;">
          ${perspective.outgoing.map((request) => `
            <button class="sharing-card" data-action="open-sharing-detail" data-request-id="${request.id}">
              <div class="sharing-row">
                <div>
                  <div class="record-title">${getSharingCounterparty(request, user).name}</div>
                  <div class="helper-text">${summarizePermissions(request.permissions)}</div>
                </div>
                <span class="status-badge ${request.status}">${request.status === "accepted" ? "已生效" : request.status === "pending" ? "待接受" : "已撤销"}</span>
              </div>
            </button>
          `).join("") || `<div class="empty-card">你还没有发出任何共享请求。</div>`}
        </div>
      </div>
      <div class="surface-card">
        <div class="group-head">
          <div>
            <div class="group-title">谁正在授权我看</div>
            <div class="helper-text">接收到请求后，需要你接受才会生效。</div>
          </div>
        </div>
        <div class="sharing-list" style="margin-top: 18px;">
          ${perspective.incoming.map((request) => `
            <div class="sharing-card">
              <div class="sharing-row">
                <div>
                  <div class="record-title">${findUserById(request.fromUserId)?.nickname || "对方用户"}</div>
                  <div class="helper-text">${request.toEmail} · ${summarizePermissions(request.permissions)}</div>
                </div>
                <span class="status-badge ${request.status}">${request.status === "accepted" ? "已接受" : request.status === "pending" ? "待处理" : "已结束"}</span>
              </div>
              ${request.status === "pending" ? `
                <div class="button-row" style="margin-top: 16px;">
                  <button class="tiny-button primary" data-action="accept-sharing" data-request-id="${request.id}">接受</button>
                </div>
              ` : ""}
            </div>
          `).join("") || `<div class="empty-card">目前没有人正在向你共享学习内容。</div>`}
        </div>
      </div>
      <div class="surface-card">
        <div class="group-title">授权细节</div>
        ${detailRequest ? `
          <div class="detail-stack" style="margin-top: 18px;">
            <div>
              <div class="detail-key">对方</div>
              <div class="detail-value">${getSharingCounterparty(detailRequest, user).name}</div>
            </div>
            <div>
              <div class="detail-key">邮箱</div>
              <div class="detail-value">${getSharingCounterparty(detailRequest, user).email}</div>
            </div>
            <div>
              <div class="detail-key">状态</div>
              <div class="detail-value">${detailRequest.status === "accepted" ? "已生效" : detailRequest.status === "pending" ? "待接受" : "已撤销"}</div>
            </div>
            <div>
              <div class="detail-key">授权内容</div>
              <div class="detail-value">${summarizePermissions(detailRequest.permissions)}</div>
            </div>
            <div class="button-row">
              <button class="tiny-button danger" data-action="revoke-sharing" data-request-id="${detailRequest.id}">撤销授权</button>
            </div>
          </div>
        ` : `<div class="empty-card" style="margin-top: 18px;">选择一条授权关系后，这里会显示名字、邮箱和授权范围。</div>`}
      </div>
    </div>
  `;
}

function renderSettingsPage(user) {
  const onboarding = user.onboarding;
  const selectedMaterials = new Set(onboarding.materials);
  return `
    <div class="record-list">
      <section class="surface-card">
        <div class="group-title">账号信息</div>
        <form data-form="settings-account" style="margin-top: 18px;">
          <div class="form-grid">
            <div class="field">
              <label>昵称</label>
              <input name="nickname" value="${user.nickname}" required />
            </div>
            <div class="field">
              <label>邮箱</label>
              <input name="email" type="email" value="${user.email}" required />
            </div>
            <div class="field full">
              <label>修改密码</label>
              <input name="password" type="password" placeholder="不修改可留空" />
            </div>
          </div>
          <div class="button-row" style="margin-top: 18px;">
            <button class="primary-button" type="submit">保存账号信息</button>
          </div>
        </form>
      </section>
      <section class="surface-card">
        <div class="group-title">学习目标信息</div>
        <form data-form="settings-study" style="margin-top: 18px;">
          <div class="form-grid">
            <div class="field">
              <label>目标总分</label>
              <input name="overall" value="${onboarding.targetScores.overall}" />
            </div>
            ${["listening", "speaking", "reading", "writing"].map((moduleId) => `
              <div class="field">
                <label>${getModuleLabel(moduleId)}目标分</label>
                <input name="${moduleId}" value="${onboarding.targetScores[moduleId]}" />
              </div>
            `).join("")}
            <div class="field">
              <label>考试日期</label>
              <input name="examDate" type="date" value="${onboarding.examDate}" />
            </div>
            <div class="field">
              <label>学习周期</label>
              <select name="studyDuration">
                ${["1", "2", "3", "6", "12"].map((value) => `<option value="${value}" ${onboarding.studyDuration === value ? "selected" : ""}>${value} 个月</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>每日计划方式</label>
              <select name="planMode">
                <option value="manual" ${onboarding.planMode === "manual" ? "selected" : ""}>我自己设置每日计划</option>
                <option value="system" ${onboarding.planMode !== "manual" ? "selected" : ""}>由系统自动生成计划</option>
              </select>
            </div>
          </div>
          <div class="button-row" style="margin-top: 18px;">
            <button class="primary-button" type="submit">${usesSystemPlan(user) ? "保存目标并重排计划" : "保存目标设置"}</button>
          </div>
        </form>
      </section>
      <section class="surface-card">
        <div class="group-title">时间安排信息</div>
        <form data-form="settings-time" style="margin-top: 18px;">
          <div class="form-grid">
            <div class="field">
              <label>每天可学习时长</label>
              <select name="dailyStudyHours">
                ${["1", "2", "3", "4", "5", "6"].map((value) => `<option value="${value}" ${onboarding.dailyStudyHours === value ? "selected" : ""}>${value} 小时</option>`).join("")}
              </select>
            </div>
          </div>
          <div style="margin-top: 18px;">
            <div class="muted-label">当前加入计划的模块</div>
            <div class="chip-grid" style="margin-top: 12px;">
              ${MODULES.map((module) => `
                <button
                  type="button"
                  class="toggle-chip ${onboarding.modules.includes(module.id) ? "active" : ""}"
                  data-action="toggle-module-from-settings"
                  data-module="${module.id}"
                >${module.label}</button>
              `).join("")}
            </div>
          </div>
          <div style="margin-top: 18px;">
            <div class="muted-label">工作日空闲时间</div>
            <div class="button-row" style="margin-top: 10px;">
              ${SCHEDULE_SLOTS.map((slot, index) => `
                <button
                  type="button"
                  class="slot-button ${onboarding.availability.weekday.includes(index) ? "active" : ""}"
                  data-action="toggle-slot"
                  data-kind="weekday"
                  data-index="${index}"
                >${slot}</button>
              `).join("")}
            </div>
          </div>
          <div style="margin-top: 18px;">
            <div class="muted-label">周末空闲时间</div>
            <div class="button-row" style="margin-top: 10px;">
              ${SCHEDULE_SLOTS.map((slot, index) => `
                <button
                  type="button"
                  class="slot-button ${onboarding.availability.weekend.includes(index) ? "active" : ""}"
                  data-action="toggle-slot"
                  data-kind="weekend"
                  data-index="${index}"
                >${slot}</button>
              `).join("")}
            </div>
          </div>
          <div class="button-row" style="margin-top: 18px;">
            <button class="primary-button" type="submit">保存时间安排并重排计划</button>
          </div>
        </form>
      </section>
      <section class="surface-card">
        <div class="group-title">已有资料</div>
        <div class="helper-text" style="margin-top: 8px;">这里可以随时更改你当前拥有并允许系统使用的材料，保存后会重新生成计划。</div>
        <form data-form="settings-materials" style="margin-top: 18px;">
          <div class="record-list">
            ${MODULES.map((module) => `
              <div class="surface-card">
                <div class="form-head">
                  <div>
                    <div class="group-title">${module.label}</div>
                    <div class="helper-text">勾选后才会进入自动排课</div>
                  </div>
                  <span class="badge">${getModuleMaterials(module.id).length} 项</span>
                </div>
                <div class="materials-grid" style="margin-top: 16px;">
                  ${getModuleMaterials(module.id).map((material) => `
                    <label class="material-option ${selectedMaterials.has(material.id) ? "selected" : ""}">
                      <input type="checkbox" name="material" value="${material.id}" ${selectedMaterials.has(material.id) ? "checked" : ""} />
                      <div>
                        <strong>${material.title}</strong>
                        <div class="helper-text">${module.label}模块资料</div>
                      </div>
                    </label>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
          <div class="button-row" style="margin-top: 18px;">
            <button class="primary-button" type="submit">保存资料并重排计划</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function findUserById(id) {
  return state.users.find((user) => user.id === id) || null;
}

function renderMainLayout(user, route) {
  const titleMap = {
    home: ["学习首页", "以模块入口、今天总任务区和目标信息为核心。"],
    records: ["我的学习记录", "回顾过去学了什么，并查看简单完成率。"],
    checkin: ["打卡", "单独打卡按钮配合日历视图，强调连续感。"],
    sharing: ["共享 / 授权", "学习内容默认私密，可指定对象授权查看。"],
    settings: ["个人设置", "管理账号信息、学习目标与时间安排。"],
    "full-plan": ["完整学习计划", "查看未来 7 天学习安排，并调整任务顺序。"],
  };

  const [title, subtitle] =
    route.parts[0] === "module"
      ? [`${getModuleLabel(route.parts[1])}模块`, "先展示今日任务，再给出未来安排预览。"]
      : route.parts[0] === "task"
        ? ["任务详情页", "开始学习、自动计时、写备注并完成任务。"]
        : titleMap[route.parts[0]] || ["学习平台", "正式学习平台感的前端原型。"];

  let body = "";
  if (route.parts[0] === "home") {
    body = renderHomePage(user);
  } else if (route.parts[0] === "module") {
    body = renderModulePage(user, route.parts[1]);
  } else if (route.parts[0] === "task") {
    body = renderTaskDetailPage(user, route.parts[1]);
  } else if (route.parts[0] === "records") {
    body = renderRecordsPage(user);
  } else if (route.parts[0] === "checkin") {
    body = renderCheckinPage(user);
  } else if (route.parts[0] === "sharing") {
    body = renderSharingPage(user);
  } else if (route.parts[0] === "settings") {
    body = renderSettingsPage(user);
  } else if (route.parts[0] === "full-plan") {
    body = renderFullPlanPage(user);
  } else {
    body = renderHomePage(user);
  }

  return `
    <div class="app-layout ${state.ui.sidebarCollapsed ? "sidebar-collapsed" : ""}">
      ${renderSidebar(route)}
      <main class="content-shell">
        ${renderTopbar(user, route, title, subtitle)}
        ${body}
      </main>
    </div>
  `;
}

function renderToast() {
  if (!state.ui.toast) {
    return "";
  }
  return `<div class="toast">${state.ui.toast.message}</div>`;
}

function renderCompletionFlash() {
  if (!state.ui.completionFlash || Date.now() - state.ui.completionFlash.timestamp > 1400) {
    return "";
  }
  return `
    <div class="confetti-layer">
      ${Array.from({ length: 28 }, (_, index) => {
        const left = Math.random() * 100;
        const drift = `${Math.random() * 16 - 8}vw`;
        const colors = ["#f0ddb2", "#fff4d9", "#d7b67c", "#f6e3b6"];
        return `
          <span class="confetti-piece" style="left:${left}vw; top:${-10 - Math.random() * 20}vh; background:${colors[index % colors.length]}; --x-end:${drift}; animation-delay:${Math.random() * 120}ms;"></span>
        `;
      }).join("")}
    </div>
    <div class="completion-overlay"><div class="completion-banner">${state.ui.completionFlash.message}</div></div>
  `;
}

function renderModal() {
  const modal = state.ui.modal;
  if (!modal) {
    return "";
  }

  if (modal.type === "pause-timer") {
    return `
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="group-title">离开当前任务前暂停计时？</div>
          <p class="section-subtitle">你正处于任务学习中。离开页面前，可以先暂停计时，下次进入时继续。</p>
          <div class="button-row" style="margin-top: 22px;">
            <button class="primary-button" data-action="confirm-pause-and-navigate" data-path="${modal.nextPath}">暂停并离开</button>
            <button class="ghost-button" data-action="dismiss-modal">继续留在这里</button>
          </div>
        </div>
      </div>
    `;
  }

  if (modal.type === "confirm-revoke") {
    return `
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="group-title">确认撤销授权？</div>
          <p class="section-subtitle">撤销后对方将立即失去查看权限。</p>
          <div class="button-row" style="margin-top: 22px;">
            <button class="primary-button" data-action="confirm-revoke-sharing" data-request-id="${modal.requestId}">确认撤销</button>
            <button class="ghost-button" data-action="dismiss-modal">取消</button>
          </div>
        </div>
      </div>
    `;
  }

  if (modal.type === "custom-task") {
    return `
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="group-title">新增自定义任务</div>
          <p class="section-subtitle">自定义任务会和系统任务并存，后续重新生成计划时也会保留。</p>
          <div class="form-grid" style="margin-top: 18px;">
            <div class="field">
              <label>任务名称</label>
              <input id="custom-task-title" placeholder="例如：阅读错题二刷" />
            </div>
            <div class="field">
              <label>模块</label>
              <select id="custom-task-module">
                ${MODULES.map((module) => `<option value="${module.id}" ${modal.moduleId === module.id ? "selected" : ""}>${module.label}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>日期</label>
              <input id="custom-task-date" type="date" value="${modal.date || todayISO()}" />
            </div>
            <div class="field">
              <label>预计时长</label>
              <select id="custom-task-duration">
                ${["20", "30", "45", "60", "75", "90", "120"].map((value) => `<option value="${value}">${value} 分钟</option>`).join("")}
              </select>
            </div>
            <div class="field full">
              <label>材料</label>
              <input id="custom-task-material" placeholder="例如：剑桥雅思真题 14 / 自己整理的清单" />
            </div>
            <div class="field full">
              <label>说明</label>
              <textarea id="custom-task-guidance" placeholder="例如：只做 Passage 3，做完后对答案并标记错题原因"></textarea>
            </div>
          </div>
          <div class="button-row" style="margin-top: 22px;">
            <button class="primary-button" data-action="confirm-custom-task">添加任务</button>
            <button class="ghost-button" data-action="dismiss-modal">取消</button>
          </div>
        </div>
      </div>
    `;
  }

  return "";
}

function renderApp() {
  if (state.ui.bootstrapping) {
    app.innerHTML = `<div class="page-shell">${renderBootstrappingPage()}${renderToast()}${renderCompletionFlash()}${renderModal()}</div><input id="calendar-import-input" type="file" accept=".ics,text/calendar" class="hidden" />`;
    return;
  }
  const user = getCurrentUser();
  const route = getRoute();
  if (!ensureValidRoute(route, user)) {
    return;
  }

  state.ui.lastStablePath = route.path;
  persistState();

  let html = "";
  if (!user) {
    html = renderAuthPage();
  } else if (!user.onboardingCompleted && route.parts[0] === "onboarding") {
    html = renderOnboardingPage(user);
  } else if (!user.onboardingCompleted && route.parts[0] === "generated") {
    html = renderGeneratedPage(user);
  } else if (route.parts[0] === "generated") {
    html = renderGeneratedPage(user);
  } else {
    html = renderMainLayout(user, route);
  }

  app.innerHTML = `<div class="page-shell">${html}${renderToast()}${renderCompletionFlash()}${renderModal()}</div><input id="calendar-import-input" type="file" accept=".ics,text/calendar" class="hidden" />`;
}

async function handleAuthSubmit(formData, isLogin) {
  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));
  const nickname = String(formData.get("nickname") || "").trim();
  const confirmPassword = normalizePassword(formData.get("confirmPassword"));
  const planMode = formData.get("planMode") === "manual" ? "manual" : "system";

  if (!isLogin && password !== confirmPassword) {
    showToast("两次输入的密码不一致。");
    return;
  }

  if (!email || !password || (!isLogin && !nickname)) {
    showToast(isLogin ? "请填写完整的邮箱和密码。" : "请把注册信息填写完整。");
    return;
  }

  setState((draft) => {
    draft.ui.authPending = true;
    draft.ui.serverError = "";
  });
  try {
    const snapshot = await apiRequest(isLogin ? "/login" : "/register", {
      method: "POST",
      body: isLogin
        ? { email, password }
        : { nickname, email, password, planMode },
    });
    applyServerSnapshot(snapshot);
    state.ui.authMode = "login";
    state.ui.profileMenuOpen = false;
    const user = getCurrentUser();
    navigate(user?.onboardingCompleted ? "/home" : "/onboarding?step=1", { force: true });
  } catch (error) {
    setState((draft) => {
      draft.ui.authPending = false;
      draft.ui.serverError = getAuthErrorMessage(error, isLogin);
    });
    showToast(getAuthErrorMessage(error, isLogin));
  }
}

async function handleLogout() {
  pauseActiveTimer();
  try {
    await flushServerSync();
    const snapshot = await apiRequest("/logout", {
      method: "POST",
    });
    applyServerSnapshot(snapshot);
  } catch (error) {
    applyServerSnapshot({ currentUserId: null, users: [], sharingRequests: [] });
    state.ui.serverError = getSaveErrorMessage(error);
  }
  state.ui.profileMenuOpen = false;
  navigate("/auth", { force: true });
}

function updateOnboardingField(name, value) {
  setState(
    () => {
      const user = getCurrentUser();
      if (!user) {
        return;
      }
      if (name.startsWith("target-")) {
        user.onboarding.targetScores[name.replace("target-", "")] = value;
      } else if (name.startsWith("current-")) {
        user.onboarding.currentLevels[name.replace("current-", "")] = value;
      } else if (name === "examDate") {
        user.onboarding.examDate = value;
      } else if (name === "studyDuration") {
        user.onboarding.studyDuration = value;
      } else if (name === "dailyStudyHours") {
        user.onboarding.dailyStudyHours = value;
      } else if (name === "pref-mood") {
        user.onboarding.preferences.mood = value;
      } else if (name === "pref-welcomeTone") {
        user.onboarding.preferences.welcomeTone = value;
      }
    },
    { render: false }
  );
}

function moveMonth(monthStr, delta) {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return formatMonth(date);
}

function bindGlobalEvents() {
  app.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) {
      return;
    }
    const action = actionTarget.dataset.action;

    if (action === "switch-auth-mode") {
      setState((draft) => {
        draft.ui.authMode = actionTarget.dataset.mode;
      });
      return;
    }

    if (action === "wizard-prev") {
      const step = Number(actionTarget.dataset.step || 1);
      navigate(`/onboarding?step=${step - 1}`, { force: true });
      return;
    }

    if (action === "wizard-next") {
      const step = Number(actionTarget.dataset.step || 1);
      navigate(`/onboarding?step=${step + 1}`, { force: true });
      return;
    }

    if (action === "finish-onboarding") {
      setState((draft) => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        regenerateUserPlan(user);
        user.onboardingCompleted = true;
        user.showGeneratedPage = usesSystemPlan(user);
      });
      if (usesSystemPlan(getCurrentUser())) {
        navigate("/generated", { force: true });
      } else {
        showToast("已进入自定义计划模式，你可以自行添加每日任务。");
        navigate("/home", { force: true });
      }
      return;
    }

    if (action === "toggle-material") {
      const materialId = actionTarget.dataset.id;
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        const selected = new Set(user.onboarding.materials);
        if (selected.has(materialId)) {
          selected.delete(materialId);
        } else {
          selected.add(materialId);
        }
        user.onboarding.materials = Array.from(selected);
      });
      return;
    }

    if (action === "toggle-slot") {
      const kind = actionTarget.dataset.kind;
      const index = Number(actionTarget.dataset.index);
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        const list = new Set(user.onboarding.availability[kind]);
        if (list.has(index)) {
          list.delete(index);
        } else {
          list.add(index);
        }
        user.onboarding.availability[kind] = Array.from(list).sort((a, b) => a - b);
      });
      return;
    }

    if (action === "toggle-module" || action === "toggle-module-from-settings") {
      const moduleId = actionTarget.dataset.module;
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        const current = new Set(user.onboarding.modules);
        if (current.has(moduleId)) {
          current.delete(moduleId);
        } else {
          current.add(moduleId);
        }
        user.onboarding.modules = Array.from(current);
      });
      return;
    }

    if (action === "toggle-home-section") {
      const key = actionTarget.dataset.key;
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        const sections = new Set(user.onboarding.preferences.homeSections);
        if (sections.has(key)) {
          sections.delete(key);
        } else {
          sections.add(key);
        }
        user.onboarding.preferences.homeSections = Array.from(sections);
      });
      return;
    }

    if (action === "toggle-privacy-setting") {
      const key = actionTarget.dataset.key;
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        user.onboarding.privacy[key] = !user.onboarding.privacy[key];
      });
      return;
    }

    if (action === "enter-home") {
      setState((draft) => {
        const user = getCurrentUser();
        if (user) {
          user.showGeneratedPage = false;
        }
      }, { render: false });
      navigate("/home", { force: true });
      return;
    }

    if (action === "toggle-sidebar") {
      setState((draft) => {
        draft.ui.sidebarCollapsed = !draft.ui.sidebarCollapsed;
      });
      return;
    }

    if (action === "toggle-profile-menu") {
      setState((draft) => {
        draft.ui.profileMenuOpen = !draft.ui.profileMenuOpen;
      });
      return;
    }

    if (action === "navigate") {
      const path = actionTarget.dataset.path;
      setState((draft) => {
        draft.ui.profileMenuOpen = false;
      }, { render: false });
      navigate(path);
      return;
    }

    if (action === "logout") {
      void handleLogout();
      return;
    }

    if (action === "open-task") {
      const taskId = actionTarget.dataset.taskId;
      const mode = actionTarget.dataset.mode;
      setState((draft) => {
        draft.ui.studyEntry = { taskId, mode };
        draft.ui.profileMenuOpen = false;
      }, { render: false });
      navigate(`/task/${taskId}`);
      return;
    }

    if (action === "complete-task") {
      completeTask(actionTarget.dataset.taskId);
      return;
    }

    if (action === "continue-timer") {
      startTimer(actionTarget.dataset.taskId, "normal");
      renderApp();
      return;
    }

    if (action === "restart-timer") {
      const taskId = actionTarget.dataset.taskId;
      resetTaskTimer(taskId);
      startTimer(taskId, "restudy");
      renderApp();
      return;
    }

    if (action === "record-restudy") {
      const taskId = actionTarget.dataset.taskId;
      const user = getCurrentUser();
      const task = user?.tasks.find((item) => item.id === taskId);
      if (!task) {
        return;
      }
      const minutes = Math.max(15, Math.round(getTaskElapsed(task) / 60000));
      setState((draft) => {
        const currentUser = getCurrentUser();
        const currentTask = currentUser?.tasks.find((item) => item.id === taskId);
        if (!currentTask) {
          return;
        }
        currentTask.repeatStudyCount += 1;
        currentTask.lastSessionMs = getTaskElapsed(currentTask);
        currentUser.records.unshift({
          id: uid("record"),
          taskId: currentTask.id,
          moduleId: currentTask.moduleId,
          date: todayISO(),
          durationMinutes: minutes,
          taskName: `${currentTask.title}（再次学习）`,
          notes: currentTask.notes || "",
          materialName: currentTask.materialName,
          createdAt: new Date().toISOString(),
        });
        currentTask.elapsedMs = 0;
        currentTask.isTimerPaused = false;
        draft.ui.activeTimer = null;
        draft.ui.studyEntry = null;
      });
      showToast("再次学习已记录到学习记录中。");
      return;
    }

    if (action === "switch-records-view") {
      setState((draft) => {
        draft.ui.recordsView = actionTarget.dataset.view;
      });
      return;
    }

    if (action === "change-records-month") {
      const delta = Number(actionTarget.dataset.direction);
      setState((draft) => {
        draft.ui.recordsMonth = moveMonth(draft.ui.recordsMonth, delta);
      });
      return;
    }

    if (action === "select-record-date") {
      setState((draft) => {
        draft.ui.selectedRecordDate = actionTarget.dataset.date;
      });
      return;
    }

    if (action === "change-checkin-month") {
      const delta = Number(actionTarget.dataset.direction);
      setState((draft) => {
        draft.ui.checkinMonth = moveMonth(draft.ui.checkinMonth, delta);
      });
      return;
    }

    if (action === "check-in-today") {
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        if (!user.checkins.includes(todayISO())) {
          user.checkins.unshift(todayISO());
        }
      });
      showToast("今日打卡成功。");
      return;
    }

    if (action === "pick-calendar-file") {
      document.getElementById("calendar-import-input")?.click();
      return;
    }

    if (action === "export-calendar") {
      const user = getCurrentUser();
      if (!user) {
        return;
      }
      exportCalendarForScope(user, actionTarget.dataset.scope, actionTarget.dataset.module || "");
      return;
    }

    if (action === "open-sharing-detail") {
      setState((draft) => {
        draft.ui.sharingDetailId = actionTarget.dataset.requestId;
      });
      return;
    }

    if (action === "accept-sharing") {
      const requestId = actionTarget.dataset.requestId;
      setState(() => {
        const request = state.sharingRequests.find((item) => item.id === requestId);
        if (!request) {
          return;
        }
        request.status = "accepted";
        request.acceptedAt = new Date().toISOString();
      });
      showToast("授权已接受。");
      return;
    }

    if (action === "revoke-sharing") {
      openModal({ type: "confirm-revoke", requestId: actionTarget.dataset.requestId });
      return;
    }

    if (action === "confirm-revoke-sharing") {
      const requestId = actionTarget.dataset.requestId;
      setState((draft) => {
        const request = draft.sharingRequests.find((item) => item.id === requestId);
        if (!request) {
          return;
        }
        request.status = "revoked";
        draft.ui.modal = null;
      });
      showToast("授权已撤销。");
      return;
    }

    if (action === "dismiss-modal") {
      closeModal();
      return;
    }

    if (action === "confirm-pause-and-navigate") {
      const nextPath = actionTarget.dataset.path;
      pauseActiveTimer();
      setState((draft) => {
        draft.ui.modal = null;
      }, { render: false });
      navigate(nextPath, { force: true });
      return;
    }

    if (action === "submit-mock") {
      const sessionKey = decodeURIComponent(actionTarget.dataset.sessionKey || "");
      const moduleId = actionTarget.dataset.module;
      const materialName = decodeURIComponent(actionTarget.dataset.material || "");
      setState((draft) => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        const session = ensureMockSession(user, sessionKey, moduleId, materialName);
        const exam = getMockExamForMaterial(moduleId, materialName);
        const result = calculateMockScore(exam, session.answers);
        session.submitted = true;
        session.score = result.score;
        session.total = result.total;
        if (draft.ui.mockExamTimer?.sessionKey === sessionKey) {
          draft.ui.mockExamTimer.running = false;
        }
      });
      showToast("答案已提交。");
      return;
    }

    if (action === "show-mock-answers") {
      const sessionKey = decodeURIComponent(actionTarget.dataset.sessionKey || "");
      setState((draft) => {
        const user = getCurrentUser();
        const session = user?.mockSessions[sessionKey];
        if (!session) {
          return;
        }
        session.showAnswers = true;
      });
      return;
    }

    if (action === "reset-mock-session") {
      const sessionKey = decodeURIComponent(actionTarget.dataset.sessionKey || "");
      setState((draft) => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        delete user.mockSessions[sessionKey];
        if (draft.ui.mockPlayer?.sessionKey === sessionKey) {
          draft.ui.mockPlayer = null;
        }
        if (draft.ui.mockExamTimer?.sessionKey === sessionKey) {
          draft.ui.mockExamTimer = null;
        }
      });
      showToast("本套机考模拟已重置。");
      return;
    }

    if (action === "toggle-mock-player") {
      const sessionKey = decodeURIComponent(actionTarget.dataset.sessionKey || "");
      const durationMs = Number(actionTarget.dataset.duration || 0) * 60000;
      setState((draft) => {
        const player = draft.ui.mockPlayer;
        if (player?.sessionKey === sessionKey && player.playing) {
          player.baseMs = Math.min(player.baseMs + (Date.now() - player.startedAt), durationMs);
          player.playing = false;
          return;
        }
        draft.ui.mockPlayer = {
          sessionKey,
          playing: true,
          startedAt: Date.now(),
          baseMs: player?.sessionKey === sessionKey ? player.baseMs : 0,
          durationMs,
        };
      });
      return;
    }

    if (action === "toggle-mock-exam") {
      const sessionKey = decodeURIComponent(actionTarget.dataset.sessionKey || "");
      const durationMs = Number(actionTarget.dataset.duration || 0) * 60000;
      setState((draft) => {
        const timer = draft.ui.mockExamTimer;
        if (timer?.sessionKey === sessionKey && timer.running) {
          timer.baseMs = Math.min(timer.baseMs + (Date.now() - timer.startedAt), durationMs);
          timer.running = false;
          return;
        }
        draft.ui.mockExamTimer = {
          sessionKey,
          durationMs,
          running: true,
          startedAt: Date.now(),
          baseMs: timer?.sessionKey === sessionKey ? timer.baseMs : 0,
        };
      });
      return;
    }

    if (action === "reset-mock-exam") {
      const sessionKey = decodeURIComponent(actionTarget.dataset.sessionKey || "");
      const durationMs = Number(actionTarget.dataset.duration || 0) * 60000;
      setState((draft) => {
        draft.ui.mockExamTimer = {
          sessionKey,
          durationMs,
          running: false,
          startedAt: Date.now(),
          baseMs: 0,
        };
      });
      return;
    }

    if (action === "reset-mock-player") {
      const sessionKey = decodeURIComponent(actionTarget.dataset.sessionKey || "");
      setState((draft) => {
        if (draft.ui.mockPlayer?.sessionKey === sessionKey) {
          draft.ui.mockPlayer = {
            sessionKey,
            playing: false,
            startedAt: Date.now(),
            baseMs: 0,
            durationMs: draft.ui.mockPlayer.durationMs || 0,
          };
        } else {
          draft.ui.mockPlayer = {
            sessionKey,
            playing: false,
            startedAt: Date.now(),
            baseMs: 0,
            durationMs: 0,
          };
        }
      });
      return;
    }

    if (action === "jump-mock-section") {
      const sessionKey = decodeURIComponent(actionTarget.dataset.sessionKey || "");
      const position = Number(actionTarget.dataset.position || 0);
      setState((draft) => {
        draft.ui.mockPlayer = {
          sessionKey,
          playing: false,
          startedAt: Date.now(),
          baseMs: position,
          durationMs: draft.ui.mockPlayer?.durationMs || 0,
        };
      });
      return;
    }

    if (action === "move-plan-task") {
      const taskId = actionTarget.dataset.taskId;
      const direction = actionTarget.dataset.direction;
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        moveTaskWithinDay(user, taskId, direction);
      });
      return;
    }

    if (action === "open-custom-task-modal") {
      openModal({
        type: "custom-task",
        date: actionTarget.dataset.date || todayISO(),
        moduleId: actionTarget.dataset.module || "",
      });
      return;
    }

    if (action === "confirm-custom-task") {
      const title = document.getElementById("custom-task-title")?.value?.trim() || "";
      const moduleId = document.getElementById("custom-task-module")?.value || "listening";
      const date = document.getElementById("custom-task-date")?.value || todayISO();
      const duration = Number(document.getElementById("custom-task-duration")?.value || 30);
      const materialName = document.getElementById("custom-task-material")?.value?.trim() || "自定义材料";
      const guidance = document.getElementById("custom-task-guidance")?.value?.trim() || "";
      if (!title) {
        showToast("请先填写任务名称。");
        return;
      }
      setState((draft) => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        user.tasks.push({
          id: uid("task"),
          moduleId,
          title,
          materialName,
          date,
          estimatedMinutes: duration,
          status: "pending",
          sortOrder: user.tasks.filter((task) => task.date === date).length + 1,
          notes: "",
          elapsedMs: 0,
          isTimerPaused: false,
          guidance,
          taskType: "custom",
          source: "custom",
          createdAt: new Date().toISOString(),
          completedAt: null,
          lastStudiedAt: null,
          repeatStudyCount: 0,
        });
        draft.ui.modal = null;
      });
      showToast("自定义任务已加入计划。");
      return;
    }
  });

  app.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
      return;
    }

    if (target.dataset.action === "mock-answer") {
      const sessionKey = decodeURIComponent(target.dataset.sessionKey || "");
      const questionNumber = Number(target.dataset.question);
      setState(
        () => {
          const user = getCurrentUser();
          const route = getRoute();
          const moduleId = route.parts[1];
          const materialName = decodeURIComponent(route.query.get("material") || "");
          const session = user ? ensureMockSession(user, sessionKey, moduleId, materialName) : null;
          if (!session) {
            return;
          }
          session.answers[questionNumber] = target.value;
        },
        { render: false }
      );
      return;
    }

    if (target.closest('[data-form="login"]') || target.closest('[data-form="register"]')) {
      return;
    }

    updateOnboardingField(target.name, target.value);
  });

  app.addEventListener("input", (event) => {
    const target = event.target;
    if (target.dataset?.action === "mock-answer") {
      const sessionKey = decodeURIComponent(target.dataset.sessionKey || "");
      const questionNumber = Number(target.dataset.question);
      setState(
        () => {
          const user = getCurrentUser();
          const route = getRoute();
          const moduleId = route.parts[1];
          const materialName = decodeURIComponent(route.query.get("material") || "");
          const session = user ? ensureMockSession(user, sessionKey, moduleId, materialName) : null;
          if (!session) {
            return;
          }
          session.answers[questionNumber] = target.value;
        },
        { render: false }
      );
      return;
    }
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }
    if (target.dataset.action === "update-task-notes") {
      const taskId = target.dataset.taskId;
      setState(
        () => {
          const user = getCurrentUser();
          const task = user?.tasks.find((item) => item.id === taskId);
          if (!task) {
            return;
          }
          task.notes = target.value;
        },
        { render: false }
      );
    }
  });

  app.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    const formType = form.dataset.form;
    const formData = new FormData(form);

    if (formType === "login") {
      await handleAuthSubmit(formData, true);
      return;
    }

    if (formType === "register") {
      await handleAuthSubmit(formData, false);
      return;
    }

    if (formType === "sharing-request") {
      const email = String(formData.get("email") || "").trim().toLowerCase();
      const currentUser = getCurrentUser();
      const targetUser = findUserByEmail(email);
      if (!email || !currentUser || email === currentUser.email.toLowerCase()) {
        showToast("请输入有效的对方注册邮箱。");
        return;
      }
      if (targetUser && !targetUser.onboarding.privacy.allowRequests) {
        showToast("对方当前不允许接收授权请求。");
        return;
      }
      const permissions = {
        checkin: Boolean(formData.get("checkin")),
        records: Boolean(formData.get("records")),
        allModules: Boolean(formData.get("allModules")),
        modules: MODULES.filter((module) => formData.get(`module-${module.id}`)).map((module) => module.id),
      };
      setState((draft) => {
        draft.sharingRequests.unshift({
          id: uid("share"),
          fromUserId: currentUser.id,
          toEmail: email,
          status: targetUser && canAcceptAutomatically(targetUser) ? "accepted" : "pending",
          permissions,
          createdAt: new Date().toISOString(),
          acceptedAt: targetUser && canAcceptAutomatically(targetUser) ? new Date().toISOString() : null,
        });
      });
      form.reset();
      showToast(targetUser && canAcceptAutomatically(targetUser) ? "授权已自动生效。" : "授权请求已发出，等待对方接受。");
      return;
    }

    if (formType === "settings-account") {
      const nickname = String(formData.get("nickname") || "").trim();
      const email = normalizeEmail(formData.get("email"));
      const password = normalizePassword(formData.get("password"));
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return;
      }
      if (state.users.some((user) => user.id !== currentUser.id && normalizeEmail(user.email) === email)) {
        showToast("这个邮箱已被其他账号使用。");
        return;
      }
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        user.nickname = nickname;
        user.email = email;
        if (password) {
          user.password = password;
        }
      });
      showToast("账号信息已更新。");
      return;
    }

    if (formType === "settings-study") {
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        user.onboarding.targetScores.overall = String(formData.get("overall") || user.onboarding.targetScores.overall);
        ["listening", "speaking", "reading", "writing"].forEach((moduleId) => {
          user.onboarding.targetScores[moduleId] = String(formData.get(moduleId) || user.onboarding.targetScores[moduleId]);
        });
        user.onboarding.examDate = String(formData.get("examDate") || user.onboarding.examDate);
        user.onboarding.studyDuration = String(formData.get("studyDuration") || user.onboarding.studyDuration);
        user.onboarding.planMode = formData.get("planMode") === "manual" ? "manual" : "system";
        regenerateUserPlan(user);
      });
      showToast(usesSystemPlan(getCurrentUser()) ? "学习目标已保存，计划已重新生成。" : "学习目标已保存，当前为自定义计划模式。");
      return;
    }

    if (formType === "settings-time") {
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        user.onboarding.dailyStudyHours = String(formData.get("dailyStudyHours") || user.onboarding.dailyStudyHours);
        regenerateUserPlan(user);
      });
      showToast(usesSystemPlan(getCurrentUser()) ? "时间安排已保存，计划已重新生成。" : "时间安排已保存，当前为自定义计划模式。");
      return;
    }

    if (formType === "settings-materials") {
      const selected = formData.getAll("material").map((item) => String(item));
      setState(() => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        user.onboarding.materials = selected;
        regenerateUserPlan(user);
      });
      showToast(usesSystemPlan(getCurrentUser()) ? "已有资料已更新，计划已重新生成。" : "已有资料已更新，当前为自定义计划模式。");
    }
  });

  app.addEventListener("change", async (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.id === "calendar-import-input") {
      const file = target.files?.[0];
      if (!file) {
        return;
      }
      const text = await file.text();
      const events = parseICSFile(text);
      setState((draft) => {
        const user = getCurrentUser();
        if (!user) {
          return;
        }
        user.calendarEvents = events;
      });
      target.value = "";
      showToast(`已导入 ${events.length} 条 Apple Calendar 日程。`);
    }
  });

  app.addEventListener("dragstart", (event) => {
    const target = event.target.closest("[data-task-id]");
    if (!target) {
      return;
    }
    const taskId = target.dataset.taskId;
    state.ui.dragTaskId = taskId;
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", taskId);
    }
  });

  app.addEventListener("dragover", (event) => {
    const target = event.target.closest("[data-drop-task]");
    if (!target) {
      return;
    }
    event.preventDefault();
  });

  app.addEventListener("drop", (event) => {
    const target = event.target.closest("[data-drop-task]");
    if (!target) {
      return;
    }
    event.preventDefault();
    const dragTaskId = state.ui.dragTaskId || event.dataTransfer?.getData("text/plain");
    const targetTaskId = target.dataset.dropTask;
    if (!dragTaskId || !targetTaskId || dragTaskId === targetTaskId) {
      return;
    }
    setState(() => {
      const user = getCurrentUser();
      if (!user) {
        return;
      }
      reorderTasksInGroup(user, dragTaskId, targetTaskId);
    });
  });

  document.addEventListener("click", (event) => {
    const menu = event.target.closest(".profile-area");
    if (!menu && state.ui.profileMenuOpen) {
      setState((draft) => {
        draft.ui.profileMenuOpen = false;
      });
    }
  });
}

function updateMockPlayerUI() {
  const route = getRoute();
  if (route.parts[0] !== "mock" || !state.ui.mockPlayer?.playing) {
    return;
  }
  const durationMs = state.ui.mockPlayer.durationMs || 1;
  const elapsed = state.ui.mockPlayer.baseMs + (Date.now() - state.ui.mockPlayer.startedAt);
  const clamped = Math.min(elapsed, durationMs);
  const progress = Math.round((clamped / durationMs) * 100);
  const bar = document.getElementById("mock-player-bar");
  const time = document.getElementById("mock-player-time");
  if (bar) {
    bar.style.width = `${progress}%`;
  }
  if (time) {
    time.textContent = `${formatTimer(clamped)} / ${formatTimer(durationMs)}`;
  }
  if (elapsed >= durationMs) {
    setState((draft) => {
      if (!draft.ui.mockPlayer) {
        return;
      }
      draft.ui.mockPlayer.baseMs = draft.ui.mockPlayer.durationMs || draft.ui.mockPlayer.baseMs;
      draft.ui.mockPlayer.playing = false;
    });
  }
}

function updateMockExamUI() {
  const route = getRoute();
  if (route.parts[0] !== "mock" || !state.ui.mockExamTimer) {
    return;
  }
  const timer = state.ui.mockExamTimer;
  const durationMs = timer.durationMs || 1;
  const elapsed = timer.running ? timer.baseMs + (Date.now() - timer.startedAt) : timer.baseMs;
  const clamped = Math.min(elapsed, durationMs);
  const remaining = Math.max(0, durationMs - clamped);
  const node = document.getElementById("mock-exam-time");
  if (node) {
    node.textContent = formatTimer(remaining);
  }
  if (elapsed >= durationMs && timer.running) {
    setState((draft) => {
      if (!draft.ui.mockExamTimer) {
        return;
      }
      draft.ui.mockExamTimer.baseMs = draft.ui.mockExamTimer.durationMs || draft.ui.mockExamTimer.baseMs;
      draft.ui.mockExamTimer.running = false;
    });
  }
}

function bindWindowEvents() {
  window.addEventListener("hashchange", () => {
    if (state.ui.ignoreNextHashChange) {
      state.ui.ignoreNextHashChange = false;
      return;
    }
    const route = getRoute();
    if (shouldPauseBeforeNavigate(route.path)) {
      state.ui.ignoreNextHashChange = true;
      window.location.hash = state.ui.lastStablePath;
      openModal({
        type: "pause-timer",
        nextPath: route.path,
      });
      return;
    }
    renderApp();
  });

  window.addEventListener("beforeunload", (event) => {
    if (state.ui.activeTimer) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  window.setInterval(() => {
    if (!state.ui.activeTimer) {
      updateMockPlayerUI();
      updateMockExamUI();
      return;
    }
    const timerEl = document.getElementById("timer-display");
    const user = getCurrentUser();
    const task = user?.tasks.find((item) => item.id === state.ui.activeTimer.taskId);
    if (timerEl && task) {
      timerEl.textContent = formatTimer(getTaskElapsed(task));
    }
    updateMockPlayerUI();
    updateMockExamUI();
  }, 1000);

  window.setInterval(() => {
    if (state.ui.completionFlash && Date.now() - state.ui.completionFlash.timestamp > 1400) {
      setState((draft) => {
        draft.ui.completionFlash = null;
      });
    }
  }, 800);
}

bindGlobalEvents();
bindWindowEvents();

if (!window.location.hash) {
  window.location.hash = "/auth";
}

renderApp();
void bootstrapFromServer();
