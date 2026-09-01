(() => {
  'use strict';

  const STORAGE_KEY = 'takamol-offline-demo-v1';
  const TOTAL_STAGES = 9;
  const app = document.getElementById('app');

  const INDICATORS = [
    { key: 'daily_steps', label: 'متوسط الخطوات اليومية', unit: 'خطوة/يوم', source: 'ملخص جهاز', reference: 7500, scale: 2500, weight: -0.24 },
    { key: 'active_minutes', label: 'دقائق النشاط اليومية', unit: 'دقيقة/يوم', source: 'ملخص جهاز', reference: 35, scale: 20, weight: -0.20 },
    { key: 'sedentary_minutes', label: 'دقائق الخمول اليومية', unit: 'دقيقة/يوم', source: 'ملخص جهاز', reference: 520, scale: 150, weight: 0.17 },
    { key: 'sleep_minutes', label: 'مدة النوم', unit: 'دقيقة/ليلة', source: 'ملخص جهاز', reference: 420, scale: 75, weight: -0.11 },
    { key: 'sleep_efficiency', label: 'كفاءة النوم', unit: '%', source: 'ملخص جهاز', reference: 85, scale: 10, weight: -0.10 },
    { key: 'resting_heart_rate', label: 'نبض الراحة', unit: 'نبضة/دقيقة', source: 'ملخص جهاز', reference: 68, scale: 12, weight: 0.14 },
    { key: 'heart_rate_variability', label: 'تباين نبض القلب', unit: 'مللي ثانية', source: 'ملخص جهاز', reference: 45, scale: 18, weight: -0.10 },
    { key: 'vo2max_estimate', label: 'تقدير اللياقة القلبية', unit: 'مل/كجم/دقيقة', source: 'تقدير جهاز', reference: 38, scale: 9, weight: -0.14 },
    { key: 'respiratory_rate', label: 'معدل التنفس أثناء الراحة', unit: 'نفس/دقيقة', source: 'ملخص جهاز', reference: 16, scale: 3, weight: 0.07 },
    { key: 'activity_consistency', label: 'انتظام النشاط الأسبوعي', unit: '%', source: 'مشتق مجمّع', reference: 70, scale: 20, weight: -0.10 },
    { key: 'weekly_workouts', label: 'جلسات التمرين الأسبوعية', unit: 'جلسة/أسبوع', source: 'مشتق مجمّع', reference: 3, scale: 2, weight: -0.08 },
    { key: 'recovery_index', label: 'مؤشر التعافي التجريبي', unit: 'مؤشر', source: 'مشتق مجمّع', reference: 70, scale: 18, weight: -0.08 },
    { key: 'bmi', label: 'مؤشر كتلة الجسم المصرح به', unit: 'كجم/م²', source: 'بيان مصرح به', reference: 25, scale: 5, weight: 0.13 },
    { key: 'smoking_exposure', label: 'التعرض للتدخين المصرح به', unit: 'نطاق 0–3', source: 'بيان مصرح به', reference: 0, scale: 1, weight: 0.18 },
    { key: 'chronic_condition_count', label: 'عدد الحالات المصرح بها', unit: 'عدد', source: 'بيان مصرح به', reference: 0, scale: 1.5, weight: 0.16 },
    { key: 'medication_adherence', label: 'انتظام الدواء المصرح به', unit: '%', source: 'تقرير ذاتي', reference: 90, scale: 20, weight: -0.06 },
    { key: 'checkup_recency_months', label: 'مدة منذ آخر فحص دوري', unit: 'شهر', source: 'تقرير ذاتي', reference: 12, scale: 12, weight: 0.07 },
  ];

  const PROFILES = {
    sami: {
      id: 'sami',
      name: 'سامي وائل',
      initial: 'س',
      age: 50,
      subtitle: 'حامل وثيقة تركيبي — نشاط مستقر',
      movement: '10,900 خطوة/يوم',
      consistency: '82% انتظام أسبوعي',
      tone: 'good',
      values: {
        daily_steps: 10900, active_minutes: 58, sedentary_minutes: 420, sleep_minutes: 450,
        sleep_efficiency: 89, resting_heart_rate: 62, heart_rate_variability: 58, vo2max_estimate: 44,
        respiratory_rate: 14, activity_consistency: 82, weekly_workouts: 4, recovery_index: 78,
        bmi: 23.5, smoking_exposure: 0, chronic_condition_count: 0, medication_adherence: 94,
        checkup_recency_months: 8,
      },
    },
    marwan: {
      id: 'marwan',
      name: 'مروان فؤاد',
      initial: 'م',
      age: 50,
      subtitle: 'حامل وثيقة تركيبي — نشاط متقطع',
      movement: '2,800 خطوة/يوم',
      consistency: '28% انتظام أسبوعي',
      tone: 'watch',
      values: {
        daily_steps: 2800, active_minutes: 12, sedentary_minutes: 730, sleep_minutes: 330,
        sleep_efficiency: 67, resting_heart_rate: 82, heart_rate_variability: 22, vo2max_estimate: 26,
        respiratory_rate: 19, activity_consistency: 28, weekly_workouts: 0, recovery_index: 41,
        bmi: 31.8, smoking_exposure: 2, chronic_condition_count: 2, medication_adherence: 55,
        checkup_recency_months: 30,
      },
    },
  };

  const STAGES = [
    { label: 'الفجوة', title: 'العمر نفسه لا يشرح كل الإشارة', evidence: 'Synthetic Demo Data' },
    { label: 'الموافقة', title: 'موافقة منفصلة ومحددة الغرض', evidence: 'Target Production Architecture' },
    { label: 'المزامنة', title: 'ربط بيانات تجريبية محلية فقط', evidence: 'Synthetic Demo Data' },
    { label: 'الجودة', title: 'فحص 17 مؤشرًا تجريبيًا', evidence: 'Synthetic Demo Data' },
    { label: 'التقييم', title: 'تشغيل مؤشر خطر تجريبي شفاف', evidence: 'Synthetic Demo Data' },
    { label: 'التفسير', title: 'تفسير وحافز MoveDiscount افتراضي', evidence: 'Synthetic Demo Data' },
    { label: 'المراجعة', title: 'قرار بشري في وضع الظل', evidence: 'Target Production Architecture' },
    { label: 'الدليل', title: 'حدود البحث والنتائج غير التجارية', evidence: 'Research Evidence' },
    { label: 'العقد', title: 'مسار الطيار والإيراد المحتمل', evidence: 'Target Production Architecture' },
  ];

  const ROLE_COPY = {
    judge: {
      label: 'منظور المحكّم', icon: '◈',
      title: 'قصة قابلة للفحص خلال دقائق',
      body: 'انظري إلى دورة العمل كاملة: موافقة، بيانات مجمّعة، تفسير، مراجعة بشرية، ثم مسار تجاري قابل للقياس.',
      checks: ['لا بيانات حقيقية ولا اتصال إنترنت', 'لا قرار تسعير آلي', 'الإيراد معروض كافتراض قابل للتغيير'],
    },
    policyholder: {
      label: 'حامل الوثيقة', icon: '◉',
      title: 'التحكم يبدأ بالموافقة',
      body: 'يرى الغرض والبيانات المطلوبة فقط، ويمكنه سحب الموافقة. لا تُعرض له نتيجة طبية أو سعر تأمين.',
      checks: ['موافقة قابلة للسحب', 'بيانات مجمّعة وليست تيارًا خامًا', 'حافز افتراضي واضح'],
    },
    insurer: {
      label: 'فريق شركة التأمين', icon: '▣',
      title: 'دعم القرار لا استبداله',
      body: 'يرى المكتتب تفسيرًا نسبيًا وحالة جودة البيانات، ثم يراجع النتيجة في وضع الظل بلا تغيير لسعر معتمد.',
      checks: ['النموذج الاكتواري الحالي يبقى الأساس', 'سبب التجاوز البشري إلزامي', 'يمكن قياس الاستخدام والاستعداد للدفع'],
    },
    governance: {
      label: 'الحوكمة والاستعداد', icon: '⌘',
      title: 'حواجز واضحة قبل أي استخدام فعلي',
      body: 'النموذج المعروض تركيبي شفاف، بينما DeepSurv محجوب حتى تتوفر حزمة نموذج موثقة ومعايرة محلية.',
      checks: ['سجل تدقيق محلي مرئي', 'فصل البحث عن نتيجة الديمو', 'لا ادعاء اعتماد أو امتثال'],
    },
  };

  function initialAudit() {
    return [{
      time: new Date().toISOString(),
      title: 'تهيئة جلسة محلية',
      detail: 'تم تحميل بيانات تركيبية داخل المتصفح فقط؛ لا توجد شبكة أو قاعدة بيانات.',
    }];
  }

  function defaultState() {
    return {
      stage: 0,
      completed: [],
      consent: false,
      consentAt: null,
      synced: false,
      dataReviewed: false,
      scoreRun: false,
      enrolled: false,
      review: { decision: 'pending_review', reason: '' },
      researchRead: false,
      finished: false,
      selectedProfile: 'sami',
      role: 'judge',
      view: 'journey',
      showIndicators: false,
      revenue: { insurers: 1, policies: 5000, platformFee: 35000, perPolicy: 3, enablement: 75000 },
      audit: initialAudit(),
    };
  }

  function restoreState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return defaultState();
      const base = defaultState();
      return {
        ...base,
        ...saved,
        completed: Array.isArray(saved.completed) ? saved.completed.filter((x) => Number.isInteger(x)) : [],
        audit: Array.isArray(saved.audit) && saved.audit.length ? saved.audit : initialAudit(),
        revenue: { ...base.revenue, ...(saved.revenue || {}) },
        review: { ...base.review, ...(saved.review || {}) },
      };
    } catch (_) {
      return defaultState();
    }
  }

  let state = restoreState();
  let toastTimer = null;

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      // The demo still works in memory when the browser blocks local storage for file:// URLs.
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function arabicNumber(value, digits = 0) {
    return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
  }

  function egp(value) {
    return `${arabicNumber(Math.round(value))} ج.م`;
  }

  function dateLabel(value) {
    return new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }).format(new Date(value));
  }

  function addAudit(title, detail) {
    state.audit.unshift({ time: new Date().toISOString(), title, detail });
    state.audit = state.audit.slice(0, 24);
  }

  function finishStage(stage, title, detail) {
    if (!state.completed.includes(stage)) state.completed.push(stage);
    if (stage < TOTAL_STAGES - 1) state.stage = Math.max(state.stage, stage + 1);
    else state.finished = true;
    addAudit(title, detail);
    persist();
    render();
  }

  function profile() {
    return PROFILES[state.selectedProfile] || PROFILES.sami;
  }

  function calculateScore(person = profile()) {
    const contributions = INDICATORS.map((indicator) => {
      const value = person.values[indicator.key];
      const contribution = ((value - indicator.reference) / indicator.scale) * indicator.weight * 12;
      return { ...indicator, value, contribution };
    });
    const raw = contributions.reduce((sum, entry) => sum + entry.contribution, 0);
    const score = Math.round(Math.max(20, Math.min(80, 50 + raw)));
    const confidence = state.synced ? 91 : state.consent ? 48 : 0;
    const coverage = state.synced ? 100 : state.consent ? 35 : 0;
    const biologicalAge = Math.round(Math.max(35, Math.min(70, person.age + ((score - 50) / 8))));
    const risk = score <= 42 ? { label: 'إشارة أدنى نسبيًا', color: '#177a63', className: 'green' }
      : score <= 62 ? { label: 'إشارة للمراجعة', color: '#c99b48', className: 'gold' }
        : { label: 'إشارة أعلى نسبيًا', color: '#b54e5d', className: 'rose' };
    return { score, confidence, coverage, biologicalAge, contributions, risk };
  }

  function generatePortfolio() {
    const first = ['ندى', 'يوسف', 'هبة', 'باسل', 'سارة', 'خالد', 'منى', 'فارس'];
    const second = ['صلاح', 'إسماعيل', 'حسن', 'زكي', 'ناصر', 'محمود', 'أمين', 'عادل'];
    return Array.from({ length: 120 }, (_, index) => {
      const risk = 24 + ((index * 37) % 57);
      const coverage = 62 + ((index * 13) % 39);
      return {
        id: `SYN-${String(index + 1).padStart(3, '0')}`,
        name: `${first[index % first.length]} ${second[(index * 3) % second.length]}`,
        age: 38 + ((index * 7) % 24),
        risk,
        coverage,
        consent: index % 7 !== 0,
      };
    });
  }

  function renderHeader() {
    const roleButtons = Object.entries(ROLE_COPY).map(([key, value]) => `
      <button class="role-button ${state.role === key ? 'active' : ''}" data-role="${key}" type="button">${value.label}</button>
    `).join('');

    return `
      <header class="top-bar">
        <div class="brand-row">
          <div class="brand" aria-label="تكامل | ذكاء مخاطر اكتواري">
            <div class="brand-mark">ت</div>
            <div class="brand-text"><strong>تكامل</strong><span>ذكاء مخاطر اكتواري قابل للتفسير</span></div>
          </div>
          <div class="header-tools">
            <span class="local-pill">يعمل محليًا — لا إرسال بيانات</span>
            <button class="icon-button" type="button" data-action="reset-demo">↺ إعادة ضبط الديمو</button>
          </div>
        </div>
        <div class="role-row">
          <span class="role-label">طريقة السرد:</span>
          <div class="role-switcher" aria-label="اختيار منظور العرض">${roleButtons}</div>
        </div>
      </header>
    `;
  }

  function renderEvidenceStrip() {
    return `
      <div class="evidence-strip" aria-label="وسوم الدليل">
        <div class="evidence-badge synthetic"><b>بيانات تركيبية</b><span>كل الأسماء والقيم في هذه النسخة أمثلة محلية وليست بيانات عملاء.</span></div>
        <div class="evidence-badge research"><b>دليل بحثي</b><span>الأرقام البحثية مفصولة عن تشغيل الديمو وليست نتيجة تجارية أو محلية.</span></div>
        <div class="evidence-badge target"><b>معمارية مستهدفة</b><span>الموافقة والمراجعة والتدقيق توضح التصميم المستهدف، لا اعتمادًا أو امتثالًا فعليًا.</span></div>
      </div>
    `;
  }

  function renderNav() {
    const tabs = [
      ['journey', '◉ رحلة المحكّم'],
      ['portfolio', '▦ المحفظة التركيبية'],
      ['revenue', '◈ مسار الإيراد'],
      ['governance', '⌘ الحوكمة والحدود'],
    ];
    return `<nav class="page-nav" aria-label="أقسام الديمو">${tabs.map(([key, label]) => `
      <button type="button" data-view="${key}" class="${state.view === key ? 'active' : ''}">${label}</button>
    `).join('')}</nav>`;
  }

  function renderHero() {
    const done = state.completed.length;
    const status = state.finished ? 'انتهت الرحلة: الآن لديك قصة طيار وإيراد قابلة للشرح.' : `تمت ${arabicNumber(done)} من ${arabicNumber(TOTAL_STAGES)} مراحل.`;
    return `
      <section class="hero" aria-labelledby="main-title">
        <div class="hero-grid">
          <div>
            <span class="eyebrow">ديمو حي وخفيف على الجهاز</span>
            <h1 id="main-title">رجلان في الخمسين. العمر واحد، والإشارة ليست واحدة.</h1>
            <p>تكامل تضيف طبقة دعم قرار قابلة للتفسير إلى النموذج الاكتواري الحالي لشركة التأمين؛ لا تستبدل الاكتواري، ولا تغيّر سعرًا معتمدًا، ولا تدّعي نتيجة طبية.</p>
            <div class="hero-actions">
              <button class="primary-button" type="button" data-action="start-demo">${state.completed.length ? 'بدء جولة جديدة' : 'ابدأ جولة المحكّم'} ←</button>
              <button class="secondary-button" type="button" data-view="revenue">شاهد كيف يتحول إلى إيراد</button>
              <span class="hero-note">يفتح محليًا من ملف واحد من دون Firebase أو إنترنت.</span>
            </div>
          </div>
          <div class="hero-stat" aria-live="polite">
            <div class="stage-number">${arabicNumber(Math.min(done + 1, TOTAL_STAGES))}/٩</div>
            <p>${status}</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderProfileCard(person) {
    const selected = person.id === state.selectedProfile;
    const signalClass = person.tone === 'good' ? 'signal-good' : 'signal-watch';
    const signal = person.tone === 'good' ? 'نمط حركة أكثر استقرارًا' : 'نمط حركة يحتاج مراجعة';
    return `
      <button type="button" class="profile-card selectable ${selected ? 'selected' : ''}" data-profile="${person.id}" aria-pressed="${selected}">
        <div class="profile-person">
          <div class="avatar ${person.id === 'marwan' ? 'alt' : ''}">${person.initial}</div>
          <div><strong>${person.name}</strong><span>${person.subtitle} · العمر الزمني ${arabicNumber(person.age)}</span></div>
        </div>
        <div class="signal-row"><span>إشارة حركة</span><b>${person.movement}</b></div>
        <div class="signal-row"><span>انتظام</span><b>${person.consistency}</b></div>
        <div class="signal-row"><span>عرض الديمو</span><span class="${signalClass}">${signal}</span></div>
      </button>
    `;
  }

  function renderStageProgress() {
    return `<div class="stage-progress" aria-label="تقدم رحلة المحكّم">${STAGES.map((stage, index) => {
      const done = state.completed.includes(index);
      const active = state.stage === index && !state.finished;
      const available = done || active || index <= state.stage;
      return `<button type="button" class="stage-step ${done ? 'done' : ''} ${active ? 'current' : ''}" data-stage="${index}" ${available ? '' : 'disabled'} aria-current="${active ? 'step' : 'false'}">
        <span class="dot">${done ? '✓' : arabicNumber(index + 1)}</span>${stage.label}
      </button>`;
    }).join('')}</div>`;
  }

  function renderStageHeading(index) {
    const stage = STAGES[index];
    return `
      <div class="stage-banner"><span>المرحلة ${arabicNumber(index + 1)} من ٩ · ${stage.title}</span><small>${stage.evidence}</small></div>
    `;
  }

  function stageProblem() {
    return `
      <p class="stage-copy">في هذه القصة شخصان افتراضيان بالعمر نفسه. لا تُثبت هذه الشاشة خطرًا أو نتيجة طبية؛ إنها تبيّن فقط لماذا قد تكون إشارة السلوك المجمّعة إضافة مفيدة بجانب عوامل الاكتتاب الحالية.</p>
      <div class="profile-grid">${renderProfileCard(PROFILES.sami)}${renderProfileCard(PROFILES.marwan)}</div>
      <div class="notice-box" style="margin-top:14px"><h3>رسالة للمحكّم</h3><p>المشكلة ليست أن النماذج التقليدية خاطئة؛ بل أنها لا ترى دائمًا تغير السلوك المستمر. تكامل تضيف طبقة قابلة للقياس، ولا تستبدل جدول الوفيات أو الحكم الاكتواري.</p></div>
      <div class="stage-actions"><button class="primary-button" type="button" data-action="confirm-problem">أظهر الفجوة وانتقل للموافقة ←</button></div>
    `;
  }

  function stageConsent() {
    const consentStatus = state.consent
      ? `<div class="status-callout success">✓ تم تسجيل موافقة تجريبية محلية في ${escapeHtml(dateLabel(state.consentAt))}. يمكن سحبها في أي وقت.</div>`
      : `<div class="status-callout warning">لم تُجمع أي إشارة قابلة للارتداء بعد. لا يمكن تشغيل المزامنة قبل موافقة واضحة.</div>`;
    return `
      <p class="stage-copy">حامل الوثيقة يرى الغرض والحد الأدنى من الفئات المطلوبة. في الديمو لا توجد هوية حقيقية أو مزوّد أجهزة حقيقي؛ الضغط أدناه يحاكي فقط موافقة واضحة قابلة للسحب.</p>
      <div class="consent-box">
        <h3>موافقة استخدام البيانات — نسخة توضيحية</h3>
        <p>الغرض: تجربة جودة الإشارة ودعم قرار بشري في وضع الظل. لا تُستخدم المخرجات لتعديل سعر أو قرار سلبي تلقائي.</p>
        <div class="scope-list"><span class="scope">الخطوات</span><span class="scope">دقائق النشاط</span><span class="scope">الخمول</span><span class="scope">ملخص النوم</span><span class="scope">ملخص نبض اختياري</span></div>
        ${consentStatus}
      </div>
      <div class="stage-actions">
        <button class="primary-button" type="button" data-action="grant-consent">${state.consent ? 'تأكيد الموافقة والانتقال للمزامنة ←' : 'تسجيل الموافقة التجريبية ←'}</button>
        ${state.consent ? '<button class="button-light" type="button" data-action="revoke-consent">سحب الموافقة واختبار الإيقاف</button>' : ''}
      </div>
      <p class="inline-note">في المنتج الفعلي تتطلب هذه الخطوة صياغة قانونية ومراجعة خصوصية مصرية؛ هذه شاشة تصميم وليست موافقة قانونية.</p>
    `;
  }

  function stageSync() {
    const syncStatus = state.synced
      ? `<div class="status-callout success">✓ اكتملت مزامنة تجريبية: تم إنشاء ملخصات يومية داخل المتصفح فقط، ولم يُحفظ تيار بيانات خام.</div>`
      : `<div class="status-callout warning">المزامنة لم تبدأ بعد. لن تستخدم هذه النسخة Bluetooth أو حساب Google/Apple أو أي اتصال خارجي.</div>`;
    return `
      <p class="stage-copy">يمثل هذا الزر طبقة موفّر قابلة للاستبدال مستقبلًا. هنا يولّد فقط ملخصًا تركيبيًا ثابتًا حتى تكون التجربة مضمونة أمام المحكّم حتى دون إنترنت.</p>
      <div class="sync-panel"><div class="sync-icon">⌁</div><div><strong>Mock Wearable Provider</strong><p>مدخلات مجمّعة فقط: نشاط، خمول، نوم، ومؤشرات ملخصة. لا يتم حفظ دقائق أو قراءات خام.</p></div></div>
      ${syncStatus}
      <div class="stage-actions"><button class="primary-button" type="button" data-action="run-sync">${state.synced ? 'تأكيد المزامنة وفحص الجودة ←' : 'تشغيل المزامنة التجريبية ←'}</button></div>
    `;
  }

  function renderIndicatorRows(person) {
    return INDICATORS.map((item) => `
      <tr><td><b>${item.label}</b></td><td>${arabicNumber(person.values[item.key], item.key === 'bmi' ? 1 : 0)} ${item.unit}</td><td><span class="source-chip">${item.source}</span></td><td>${item.weight < 0 ? 'إشارة واقية في الديمو' : 'إشارة تستدعي مراجعة في الديمو'}</td></tr>
    `).join('');
  }

  function stageDataQuality() {
    const person = profile();
    const score = calculateScore(person);
    const table = state.showIndicators ? `
      <div class="table-wrap"><table><thead><tr><th>المؤشر التركيبي</th><th>قيمة المثال</th><th>المصدر</th><th>اتجاهه في نموذج الديمو</th></tr></thead><tbody>${renderIndicatorRows(person)}</tbody></table></div>
    ` : '';
    return `
      <p class="stage-copy">هذه هي المؤشرات السبعة عشر القابلة للتهيئة في الديمو. ليست متغيرات رسالة علمية نهائية، ولا مؤشرات طبية، ولا أساس اكتتاب متحقق. يظل مصدر كل قيمة ظاهرًا كي لا يُفهم أن كل شيء صادر مباشرة من جهاز قابل للارتداء.</p>
      <div class="indicator-summary"><div><span>اكتمال المثال</span><b>${arabicNumber(score.coverage)}%</b></div><div><span>المؤشرات المتاحة</span><b>١٧ / ١٧</b></div><div><span>سياسة البيانات الناقصة</span><b>لا ترفع الخطر</b></div></div>
      <button class="button-light" type="button" data-action="toggle-indicators">${state.showIndicators ? 'إخفاء جدول المؤشرات' : 'عرض ١٧ مؤشرًا وقيم المثال'}</button>
      ${table}
      <div class="status-callout success">قاعدة التشغيل: القيمة المفقودة تسهم بصفر وتخفض التغطية/الثقة، ولا تتحول وحدها إلى إشارة خطر.</div>
      <div class="stage-actions"><button class="primary-button" type="button" data-action="confirm-quality">تأكيد جودة البيانات والانتقال للتقييم ←</button></div>
    `;
  }

  function renderScore(person, score) {
    return `
      <div class="score-layout">
        <div class="score-ring" style="--score:${score.score}%;--score-color:${score.risk.color}"><div><strong>${arabicNumber(score.score)}</strong><span>مؤشر نسبي من ١٠٠</span></div></div>
        <div class="score-copy"><h3>${score.risk.label}</h3><p>هذا <b>مؤشر خطر تركيبي نسبي</b> من محرك إضافي شفاف. ليس احتمال مطالبة، ولا تشخيصًا، ولا سعرًا، ولا قرار اكتتاب.</p><div class="score-metrics"><span class="metric-chip">الثقة: ${arabicNumber(score.confidence)}%</span><span class="metric-chip">التغطية: ${arabicNumber(score.coverage)}%</span><span class="metric-chip">الإصدار: DemoRiskModel 1.0</span></div></div>
      </div>
    `;
  }

  function stageScore() {
    const person = profile();
    const score = calculateScore(person);
    return `
      <p class="stage-copy">يحسب هذا المحرك شفافًا مساهمات جمعيّة ثابتة من قيم المثال. لا يعمل DeepSurv هنا؛ نموذج DeepSurv محجوب عمدًا لعدم وجود artifact موثق ومعايرة واعتماد.</p>
      ${state.scoreRun ? renderScore(person, score) : '<div class="notice-box"><h3>المحرك جاهز للتشغيل</h3><p>سيظهر الناتج النسبي والثقة والتغطية بعد الضغط، وسيسجل الحدث في سجل التدقيق المحلي.</p></div>'}
      <div class="stage-actions"><button class="primary-button" type="button" data-action="run-score">${state.scoreRun ? 'تأكيد النتيجة والانتقال للتفسير ←' : 'تشغيل مؤشر الديمو الشفاف ←'}</button></div>
      <p class="inline-note">تبديل حامل الوثيقة يغيّر المدخلات والنتيجة في هذه النسخة المحلية. جرّب بطاقة سامي أو مروان في المرحلة الأولى.</p>
    `;
  }

  function contributionRows(contributions, type) {
    const filtered = contributions.filter((item) => type === 'risk' ? item.contribution > 0 : item.contribution < 0)
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 4);
    return filtered.map((item) => {
      const amount = Math.abs(item.contribution);
      const width = Math.min(100, Math.round(amount / 6 * 100));
      return `<li><span>${item.label}</span><span class="bar-track"><span class="bar ${type === 'risk' ? 'risk' : 'protect'}" style="width:${width}%"></span></span><b class="${type === 'risk' ? 'positive' : 'negative'}">${type === 'risk' ? '+' : '−'}${arabicNumber(amount, 1)}</b></li>`;
    }).join('') || '<li><span>لا توجد مساهمات معروضة</span></li>';
  }

  function stageExplanation() {
    const person = profile();
    const score = calculateScore(person);
    const enrolled = state.enrolled ? '<div class="status-callout success">✓ تم تسجيل مسار MoveDiscount التجريبي: هدف أسبوعي واضح، دون خصم حقيقي أو تعديل قسط.</div>' : '';
    return `
      <p class="stage-copy">التفسير يعرض مساهمات نموذج الديمو نفسه؛ لا يدّعي السببية ولا يصف حالة صحية. الهدف هو فتح حوار مفيد مع حامل الوثيقة والمراجِع البشري.</p>
      <div class="explain-grid"><div><div class="section-title"><div><h3>أقوى إشارات المراجعة</h3><p>تزيد المؤشر النسبي في هذا المثال.</p></div><span class="tag rose">تفسير نموذج</span></div><ul class="contributor-list">${contributionRows(score.contributions, 'risk')}</ul></div><div><div class="section-title"><div><h3>أقوى الإشارات الواقية</h3><p>تخفض المؤشر النسبي في هذا المثال.</p></div><span class="tag green">تفسير نموذج</span></div><ul class="contributor-list">${contributionRows(score.contributions, 'protect')}</ul></div></div>
      <div class="age-estimate" style="margin-top:14px"><strong>${arabicNumber(score.biologicalAge)} عامًا</strong><span>تقدير Takamol Digital Biological Age في الديمو — مؤشر تركيبي لاتجاه أسلوب الحياة، <b>ليس عمرًا بيولوجيًا حقيقيًا أو تشخيصًا أو قرارًا تأمينيًا.</b></span></div>
      ${enrolled}
      <div class="stage-actions"><button class="primary-button" type="button" data-action="enroll-move">${state.enrolled ? 'تأكيد الحافز والانتقال للمراجعة البشرية ←' : 'تفعيل مسار MoveDiscount التجريبي ←'}</button></div>
    `;
  }

  function reviewLabel(decision) {
    return {
      pending_review: 'بانتظار المراجعة',
      continue_shadow: 'الاستمرار في وضع الظل',
      request_data: 'طلب جودة/بيانات إضافية',
      override: 'تجاوز النتيجة مع سبب',
    }[decision] || 'بانتظار المراجعة';
  }

  function stageReview() {
    const review = state.review;
    const summary = review.decision !== 'pending_review' ? `<div class="status-callout success">✓ سجلت المراجعة: ${escapeHtml(reviewLabel(review.decision))}${review.reason ? ` — ${escapeHtml(review.reason)}` : ''}. لا تغير هذه المراجعة سعرًا أو قرارًا فعليًا.</div>` : '';
    return `
      <p class="stage-copy">لا يوجد إجراء سلبي آلي. يقرر المكتتب/الاكتواري كيف يستخدم الإشارة داخل <b>وضع الظل</b>، ويبقى السعر المعتمد وخط الاكتتاب الحالي دون تغيير.</p>
      <div class="review-form">
        <div><label class="field-label" for="review-decision">قرار المراجع البشري</label><select id="review-decision"><option value="continue_shadow" ${review.decision === 'continue_shadow' ? 'selected' : ''}>الاستمرار في وضع الظل دون تغيير سعر</option><option value="request_data" ${review.decision === 'request_data' ? 'selected' : ''}>طلب مراجعة جودة/بيانات إضافية</option><option value="override" ${review.decision === 'override' ? 'selected' : ''}>تجاوز الإشارة — يتطلب سببًا</option></select></div>
        <div><label class="field-label" for="review-reason">سبب التجاوز أو ملاحظة المراجعة</label><input id="review-reason" type="text" maxlength="180" value="${escapeHtml(review.reason)}" placeholder="مثال: لا تُستخدم الإشارة قبل اختبار المعايرة المحلية" /></div>
      </div>
      <div class="review-guard">لا يمثل المؤشر احتمال مطالبة أو تسعيرًا، ولا يجوز تحويله إلى رفض أو زيادة تلقائية.</div>
      ${summary}
      <div class="stage-actions"><button class="primary-button" type="button" data-action="submit-review">تسجيل المراجعة البشرية ←</button></div>
    `;
  }

  function stageResearch() {
    const expanded = state.researchRead ? `
      <div class="limitations"><b>الحدود التي نعرضها بوضوح:</b><ul><li>هذه أرقام بحث/محاكاة مورّدة وليست أداء نموذج الديمو أو إيرادًا تجاريًا.</li><li>مؤشر التوافق يصف ترتيب الخطر، وليس دقة بنسبة ٧٨٫١٪.</li><li>لم تُعد النتائج محليًا لغياب ملفات النموذج الأصلية، والمتغيرات القابلة للتدقيق، والملصقات والأسس السعرية المتماسكة.</li><li>البيانات المصرية والمعايرة والعدالة والاعتماد التجاري ما زالت بوابات مستقبلية.</li></ul></div>
    ` : '';
    return `
      <p class="stage-copy">نفصل بين ما يحسبه هذا الديمو الآن وبين ما ورد في البحث أو المحاكاة. هذه الصراحة تزيد قابلية المشروع للاختبار ولا تضع ادعاءً غير قابل للتدقيق أمام شركة التأمين أو الهيئة.</p>
      <div class="research-grid"><div class="research-metric"><strong>0.781</strong><span>مؤشر توافق DeepSurv المورّد في البحث</span></div><div class="research-metric"><strong>0.712</strong><span>مقارنة Cox المورّدة في البحث</span></div><div class="research-metric"><strong>0.221 → 0.332</strong><span>تحسن Gini بحثي/محاكاة — ليس أثرًا تجاريًا</span></div></div>
      ${expanded}
      <div class="stage-actions"><button class="primary-button" type="button" data-action="acknowledge-research">${state.researchRead ? 'تأكيد الحدود والانتقال للمسار التجاري ←' : 'عرض الحدود وتأكيد فهمها ←'}</button></div>
      <p class="inline-note">لا يوجد نموذج DeepSurv قيد التشغيل هنا؛ المحرك الوحيد هو DemoRiskModel الشفاف المبني على بيانات تركيبية.</p>
    `;
  }

  function revenueModel() {
    const r = state.revenue;
    const recurringSubscription = r.insurers * r.platformFee * 12;
    const recurringPolicy = r.policies * r.perPolicy * 12;
    const recurring = recurringSubscription + recurringPolicy;
    const firstYear = recurring + r.enablement * r.insurers;
    return { recurringSubscription, recurringPolicy, recurring, firstYear };
  }

  function renderRevenueCalculator(compact = false) {
    const r = state.revenue;
    const model = revenueModel();
    return `
      <div class="revenue-calculator ${compact ? 'compact' : ''}">
        <div class="input-grid">
          <div class="input-card"><label for="rev-insurers">شركاء تأمين افتراضيون</label><input id="rev-insurers" data-revenue="insurers" type="number" min="1" max="20" value="${r.insurers}" /><small>عدد شركات التأمين المتعاقدة في السيناريو، وليس عميلًا حاليًا.</small></div>
          <div class="input-card"><label for="rev-policies">وثائق مؤهلة سنويًا</label><input id="rev-policies" data-revenue="policies" type="number" min="0" max="1000000" value="${r.policies}" /><small>حجم طيار أو عقد افتراضي؛ ٥٬٠٠٠ ليست نطاقًا موقعًا.</small></div>
          <div class="input-card"><label for="rev-platform">اشتراك منصة شهري افتراضي</label><input id="rev-platform" data-revenue="platformFee" type="number" min="0" step="1000" value="${r.platformFee}" /><small>افتراض نقاش تجاري فقط، وليس سعرًا معلنًا.</small></div>
          <div class="input-card"><label for="rev-policy">رسوم لكل وثيقة/شهر افتراضية</label><input id="rev-policy" data-revenue="perPolicy" type="number" min="0" max="1000" step="0.5" value="${r.perPolicy}" /><small>يمكن استبدالها برسوم لكل استخدام API حسب الشريك.</small></div>
          <div class="input-card"><label for="rev-enablement">تهيئة/تكامل لمرة واحدة</label><input id="rev-enablement" data-revenue="enablement" type="number" min="0" step="5000" value="${r.enablement}" /><small>افتراض تكلفة/خدمة أولية؛ ليس إيرادًا متحققًا.</small></div>
        </div>
        <div class="revenue-output"><span>الإيراد السنوي المتكرر — سيناريو توضيحي</span><strong>${egp(model.recurring)}</strong><p>اشتراك مؤسسي + رسوم استخدام/وثيقة. لا يظهر هذا الرقم في أي نتيجة مخاطر ولا يثبت استعداد شركة للتعاقد.</p><ul class="revenue-breakdown"><li><span>اشتراك المنصة السنوي</span><b>${egp(model.recurringSubscription)}</b></li><li><span>رسوم الوثائق السنوية</span><b>${egp(model.recurringPolicy)}</b></li><li><span>قيمة السنة الأولى مع التهيئة</span><b>${egp(model.firstYear)}</b></li></ul></div>
      </div>
    `;
  }

  function stageCommercial() {
    const completion = state.finished ? '<div class="status-callout success">✓ اكتملت رحلة الديمو. استُخدمت حالة محلية فقط ويمكن إعادة ضبطها للجلسة التالية.</div>' : '';
    return `
      <p class="stage-copy">تكامل قبل الإيراد ولا تدّعي عميلًا دافعًا. الإيراد لا يبدأ من نتيجة المخاطر؛ يبدأ بعد تجربة منضبطة تثبت جودة البيانات والاستخدام والعدالة والاستعداد للدفع.</p>
      ${renderRevenueCalculator(true)}
      <div class="commercial-path"><div class="path-step current"><b>١. شريك تصميم</b><span>شركة حياة أو صحي واحدة، مشكلة محددة، وبيانات/نطاق مسموح.</span></div><div class="path-step"><b>٢. وضع الظل</b><span>لا تغيير سعر؛ قياس التغطية والتفسير واستخدام المكتتب.</span></div><div class="path-step"><b>٣. قرار الدليل</b><span>معايرة مصرية، عدالة، تكلفة تشغيل، واستعداد للدفع.</span></div><div class="path-step"><b>٤. عقد مؤسسي</b><span>اشتراك منصة + رسوم وثائق/API؛ عنصر أداء فقط بخط أساس عادل.</span></div></div>
      ${completion}
      <div class="stage-actions"><button class="primary-button" type="button" data-action="complete-demo">${state.finished ? 'ابدأ جولة جديدة للمحكّم ←' : 'إنهاء الرحلة وإظهار الطلب الواضح ←'}</button></div>
      <p class="inline-note">الطلب أمام StartIT: وصول إلى شريك تصميم، بنية سحابية عند الحاجة، ودعم قانوني/تنظيمي لتجربة محدودة قابلة للقياس.</p>
    `;
  }

  function renderStageBody() {
    const stage = Math.max(0, Math.min(TOTAL_STAGES - 1, state.stage));
    let content = '';
    if (stage === 0) content = stageProblem();
    if (stage === 1) content = stageConsent();
    if (stage === 2) content = stageSync();
    if (stage === 3) content = stageDataQuality();
    if (stage === 4) content = stageScore();
    if (stage === 5) content = stageExplanation();
    if (stage === 6) content = stageReview();
    if (stage === 7) content = stageResearch();
    if (stage === 8) content = stageCommercial();
    return `<section class="card card-pad" aria-labelledby="stage-title"><div class="section-title"><div><h2 id="stage-title">${STAGES[stage].title}</h2><p>رحلة محكّم تفاعلية — كل زر يسجل فعلًا محليًا ويغير الحالة.</p></div><span class="tag ${stage === 7 ? 'gold' : ''}">${STAGES[stage].evidence}</span></div>${renderStageProgress()}${renderStageHeading(stage)}${content}</section>`;
  }

  function renderRoleCard() {
    const role = ROLE_COPY[state.role];
    return `
      <aside class="card card-pad role-card"><div class="section-title"><div><h3>${role.title}</h3><p>${role.body}</p></div><div class="role-icon">${role.icon}</div></div><ul class="check-list">${role.checks.map((line) => `<li>${line}</li>`).join('')}</ul></aside>
    `;
  }

  function renderAudit() {
    return `
      <aside class="card card-pad audit-card"><div class="section-title"><div><h3>سجل التدقيق المحلي</h3><p>الأحداث الظاهرة ناتجة من ضغطك في هذه الجلسة.</p></div><span class="tag green">${arabicNumber(state.audit.length)} حدث</span></div><ol class="audit-list">${state.audit.map((event) => `<li><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(event.detail)}</span><time>${escapeHtml(dateLabel(event.time))}</time></li>`).join('')}</ol></aside>
    `;
  }

  function renderJourney() {
    return `<div class="content-grid"><div>${renderStageBody()}</div><div class="side-stack">${renderRoleCard()}${renderAudit()}</div></div>`;
  }

  function renderPortfolio() {
    const portfolio = generatePortfolio();
    const consented = portfolio.filter((row) => row.consent).length;
    const averageCoverage = Math.round(portfolio.reduce((sum, row) => sum + row.coverage, 0) / portfolio.length);
    const reviewQueue = portfolio.filter((row) => row.risk >= 62 && row.consent).length;
    const sample = [PROFILES.sami, PROFILES.marwan].map((person) => ({ ...person, score: calculateScore(person) }));
    return `
      <section class="card card-pad"><div class="section-title"><div><h2>محفظة تركيبية داخل الجهاز</h2><p>١٢٠ سجلًا مولدًا بطريقة ثابتة للعرض فقط. ليست قاعدة بيانات عملاء ولا تُرسل إلى أي خادم.</p></div><span class="tag">Synthetic Demo Data</span></div>
      <div class="dashboard-grid"><div class="info-tile"><span>السجلات التركيبية</span><strong>${arabicNumber(portfolio.length)}</strong><em>لشرح تدفق المحفظة</em></div><div class="info-tile"><span>موافقات تجريبية</span><strong>${arabicNumber(consented)}</strong><em>نسبة ${arabicNumber(Math.round(consented / portfolio.length * 100))}% افتراضية</em></div><div class="info-tile"><span>متوسط التغطية</span><strong>${arabicNumber(averageCoverage)}%</strong><em>مؤشر جودة مثال</em></div><div class="info-tile"><span>صف مراجعة افتراضي</span><strong>${arabicNumber(reviewQueue)}</strong><em>ليس قرارًا آليًا</em></div></div>
      <div class="panel-grid"><div><div class="section-title"><div><h3>قصة الحالتين الرئيسيتين</h3><p>متساويان في العمر، مختلفان في الإشارات المجمعة.</p></div></div><div class="profile-grid">${sample.map((person) => `<div class="profile-card"><div class="profile-person"><div class="avatar ${person.id === 'marwan' ? 'alt' : ''}">${person.initial}</div><div><strong>${person.name}</strong><span>العمر ${arabicNumber(person.age)} · مثال تركيبي</span></div></div><div class="signal-row"><span>مؤشر الديمو</span><b>${arabicNumber(person.score.score)}/١٠٠</b></div><div class="signal-row"><span>النتيجة</span><span class="${person.score.risk.className === 'green' ? 'signal-good' : 'signal-watch'}">${person.score.risk.label}</span></div></div>`).join('')}</div></div><div><div class="section-title"><div><h3>قاعدة التعامل مع النقص</h3><p>مثال عملي على جودة البيانات.</p></div></div><div class="notice-box"><h3>لا تعاقب النقص</h3><p>إذا لم تكتمل بعض البيانات، تقل التغطية والثقة ويُطلب مراجعة أو بيانات إضافية. لا يزداد المؤشر تلقائيًا بسبب غيابها.</p></div><div class="status-callout warning">هذه القاعدة جزء من تصميم الديمو؛ لا تمثل سياسة مكتتب أو متطلبًا تنظيميًا معتمدًا.</div></div></div>
      <div class="table-wrap portfolio-table" style="margin-top:20px"><table><thead><tr><th>معرف تركيبي</th><th>اسم افتراضي</th><th>العمر</th><th>مؤشر الديمو</th><th>تغطية المثال</th><th>موافقة</th></tr></thead><tbody>${portfolio.slice(0, 9).map((row) => `<tr><td>${row.id}</td><td>${row.name}</td><td>${arabicNumber(row.age)}</td><td>${arabicNumber(row.risk)}/١٠٠</td><td>${arabicNumber(row.coverage)}%</td><td>${row.consent ? 'موجودة (تركيبي)' : 'غير موجودة'}</td></tr>`).join('')}</tbody></table></div>
    </section>`;
  }

  function renderRevenueView() {
    const model = revenueModel();
    return `
      <section class="revenue-hero"><span class="eyebrow" style="color:#8b5d16">نموذج تجاري مقترح — قبل الإيراد</span><h2>كيف يصبح الديمو إيرادًا بأقل تطوير ممكن؟</h2><p>ابدئي بشريك تصميم واحد وديمو محلي/وضع ظل. لا تحتاجين Firebase أو بنية مكلفة لإثبات الفكرة. بعد إثبات جودة البيانات واستخدام الفريق والاستعداد للدفع، يتحول العرض إلى اشتراك مؤسسي ورسوم لكل وثيقة أو استخدام API.</p>${renderRevenueCalculator()}<div class="notice-box" style="margin-top:18px"><h3>ما لا ندّعيه</h3><p>لا يوجد عميل دافع أو إيراد فعلي أو ROI محقق في هذا الديمو. الأرقام أعلاه افتراضات قابلة للتعديل كي يفهم المحكّم نموذج العمل، وليست تسعيرة منشورة أو توقعًا مضمونًا.</p></div></section>
      <div class="content-grid"><section class="card card-pad"><div class="section-title"><div><h2>ماذا يُباع تحديدًا؟</h2><p>طبقة إضافة إلى عمليات شركة التأمين، وليس جهازًا أو بديلًا للاكتواري.</p></div><span class="tag gold">B2B2C</span></div><div class="governance-grid"><div class="governance-item"><h3>اشتراك مؤسسي</h3><p>واجهة فريق المخاطر، إعدادات الحوكمة، وسجل استخدام/تفسير مخصص لشركة واحدة.</p></div><div class="governance-item"><h3>رسوم استخدام</h3><p>لكل وثيقة مؤهلة أو لكل استخدام واجهة برمجية بعد التعاقد، حسب نموذج الشريك.</p></div><div class="governance-item"><h3>تهيئة وتكامل</h3><p>خدمة أولية محدودة النطاق بعد اتفاق البيانات والمتطلبات، وليست شرطًا لإثبات الديمو المحلي.</p></div><div class="governance-item"><h3>أداء اختياري لاحقًا</h3><p>فقط إذا اتفق الطرفان على خط أساس وقياس عادل للأثر؛ لا يوعد به الآن.</p></div></div></section><aside class="card card-pad"><div class="section-title"><div><h3>الحد الأدنى للبدء</h3><p>الهدف ليس بناء منصة ضخمة أولًا.</p></div></div><ul class="check-list" style="color:#405266"><li style="border-color:#e9eef1">ديمو محلي ثابت للعرض</li><li style="border-color:#e9eef1">شريك تصميم واحد</li><li style="border-color:#e9eef1">طيار وضع ظل محدود</li><li style="border-color:#e9eef1">قرار واضح: استمر/عدّل/توقف</li></ul><div class="status-callout success">قيمة السيناريو السنوي المتكرر الحالي: ${egp(model.recurring)} — افتراض فقط.</div></aside></div>
    `;
  }

  function renderGovernance() {
    return `
      <section class="card card-pad"><div class="section-title"><div><h2>الحوكمة والحدود التي تحمي القصة</h2><p>هذه الصفحة تشرح للمحكّم ما يعمل الآن وما لا ندّعيه، بدل إخفاء الفجوة بين نموذج البحث ومنتج السوق.</p></div><span class="tag gold">Research + Demo Boundary</span></div>
      <div class="governance-grid"><div class="governance-item"><h3>DemoRiskModel 1.0</h3><p>محرك جمعي شفاف وحتمي على بيانات تركيبية. الناتج مؤشر نسبي للتدفق فقط، لا احتمال مطالبة ولا تسعير.</p><span class="model-status">نشط للعرض المحلي فقط</span></div><div class="governance-item"><h3>DeepSurv Integration</h3><p>واجهة مستقبلية محجوبة. لا يوجد artifact موقّع أو قاموس بيانات أو معايرة أو تقرير تحقق يسمح بالتشغيل.</p><span class="model-status blocked">محجوب عمدًا — لا fallback صامت</span></div><div class="governance-item"><h3>المراجعة البشرية</h3><p>المكتتب أو الاكتواري يسجل قرارًا وسبب تجاوز عند الحاجة؛ لا يوجد رفض أو زيادة أو خصم تلقائي.</p><span class="model-status">ظاهر في المرحلة السابعة</span></div><div class="governance-item"><h3>الخصوصية حسب التصميم</h3><p>لا اتصال إنترنت، ولا حسابات، ولا بيانات خام أو حقيقية. المنتج الفعلي يتطلب مراجعة قانونية وخصوصية منفصلة.</p><span class="model-status">مطبق في الديمو المحلي</span></div></div>
      <div class="limitations"><b>الصياغة الصحيحة أمام اللجنة:</b><ul><li>«نستعد لمسار تحقق تنظيمي مناسب»، وليس «معتمدون من FRA».</li><li>«نتائج بحث/محاكاة»، وليس «نتائج تجارية».</li><li>«تقدير Takamol Digital Biological Age في الديمو»، وليس عمرًا بيولوجيًا حقيقيًا.</li><li>«دعم قرار اكتواري»، وليس استبدال الاكتواري أو تسعير ذاتي.</li></ul></div>
    </section>`;
  }

  function renderView() {
    if (state.view === 'portfolio') return renderPortfolio();
    if (state.view === 'revenue') return renderRevenueView();
    if (state.view === 'governance') return renderGovernance();
    return renderJourney();
  }

  function render() {
    app.innerHTML = `
      <div class="app-shell">${renderHeader()}<main id="main-content" class="main-wrap">${renderEvidenceStrip()}${renderNav()}${renderHero()}${renderView()}</main><footer class="footer"><strong>تكامل — نسخة ديمو محلية.</strong> جميع الأسماء والقيم تركيبية. لا توجد بيانات عميل أو تكامل جهاز أو نتيجة علمية/تجارية قابلة للاعتماد في هذه النسخة. <span>افتح <code>README.md</code> لطريقة التشغيل والنشر المجاني الاختياري.</span></footer><div id="toast" class="toast" role="status" aria-live="polite"></div></div>
    `;
    bindEvents();
  }

  function notify(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = 'toast'; }, 4200);
  }

  function restartDemo() {
    state = defaultState();
    addAudit('بدء جولة محكّم جديدة', 'أعيدت حالة الديمو إلى بيانات تركيبية أولية داخل هذا المتصفح.');
    persist();
    render();
    notify('بدأت جولة جديدة. ابدئي بالحالة الأولى ثم اضغطي زر المرحلة.', 'success');
  }

  function revokeConsent() {
    state.consent = false;
    state.consentAt = null;
    state.synced = false;
    state.dataReviewed = false;
    state.scoreRun = false;
    state.enrolled = false;
    state.review = { decision: 'pending_review', reason: '' };
    state.completed = state.completed.filter((stage) => stage === 0);
    state.stage = 1;
    addAudit('سحب الموافقة التجريبية', 'أوقفت المزامنة والتقييم اللاحق محليًا؛ لا حذف/احتفاظ قانوني فعلي في نسخة الديمو.');
    persist();
    render();
    notify('تم سحب الموافقة وإيقاف خطوات البيانات اللاحقة.', 'warning');
  }

  function setRevenueField(field, value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    const limits = {
      insurers: [1, 20], policies: [0, 1000000], platformFee: [0, 10000000], perPolicy: [0, 1000], enablement: [0, 10000000],
    };
    const [min, max] = limits[field] || [0, 10000000];
    state.revenue[field] = Math.max(min, Math.min(max, numeric));
    persist();
    render();
  }

  function submitReview() {
    const decisionNode = document.getElementById('review-decision');
    const reasonNode = document.getElementById('review-reason');
    const decision = decisionNode ? decisionNode.value : 'continue_shadow';
    const reason = reasonNode ? reasonNode.value.trim() : '';
    if (decision === 'override' && reason.length < 4) {
      notify('اكتبي سببًا واضحًا عند تجاوز الإشارة؛ ذلك جزء من سجل المراجعة البشرية.', 'warning');
      return;
    }
    state.review = { decision, reason };
    finishStage(6, 'تسجيل مراجعة بشرية', `${reviewLabel(decision)}${reason ? ` — ${reason}` : ''}. لم يتغير سعر أو قرار تأميني.`);
    notify('سُجلت المراجعة البشرية في سجل التدقيق المحلي.', 'success');
  }

  function handleAction(action) {
    switch (action) {
      case 'start-demo':
      case 'reset-demo': restartDemo(); break;
      case 'confirm-problem':
        finishStage(0, 'عرض فجوة العمر الزمني', 'تمت مقارنة حالتين تركيبيتين بالعمر نفسه مع إشارة حركة مختلفة.');
        notify('الآن اشرحي أن تكامل تضيف إشارة ولا تستبدل النموذج الاكتواري.', 'success');
        break;
      case 'grant-consent':
        if (!state.consent) {
          state.consent = true;
          state.consentAt = new Date().toISOString();
          addAudit('تسجيل موافقة تجريبية', 'نطاق محلي: خطوات ونشاط وخمول ونوم وملخص نبض اختياري.');
        }
        finishStage(1, 'تأكيد الموافقة المحددة الغرض', 'الموافقة المحلية قابلة للسحب قبل أي مزامنة تجريبية.');
        notify('تمت الموافقة التجريبية. الآن شغّلي المزامنة المحلية.', 'success');
        break;
      case 'revoke-consent': revokeConsent(); break;
      case 'run-sync':
        if (!state.consent) { notify('لا يمكن تشغيل المزامنة قبل الموافقة التجريبية.', 'warning'); break; }
        state.synced = true;
        finishStage(2, 'تشغيل مزامنة تجريبية', 'ولدت ملخصات تركيبية محليًا، من دون جهاز أو تيار بيانات خام أو شبكة.');
        notify('تمت مزامنة المثال محليًا. انتقلي إلى فحص الجودة.', 'success');
        break;
      case 'toggle-indicators':
        state.showIndicators = !state.showIndicators;
        persist(); render();
        break;
      case 'confirm-quality':
        if (!state.synced) { notify('شغّلي المزامنة التجريبية أولًا.', 'warning'); break; }
        state.dataReviewed = true;
        finishStage(3, 'فحص جودة ١٧ مؤشرًا', 'تم تأكيد أن القيم تركيبية ومصادرها موسومة وأن النقص يخفض الثقة فقط.');
        notify('البيانات جاهزة لتشغيل مؤشر الديمو الشفاف.', 'success');
        break;
      case 'run-score':
        if (!state.dataReviewed) { notify('راجعي جودة البيانات قبل تشغيل التقييم.', 'warning'); break; }
        state.scoreRun = true;
        const score = calculateScore();
        finishStage(4, 'تشغيل مؤشر الخطر التجريبي', `نتيجة ${score.score}/100 وثقة ${score.confidence}% للحالة التركيبية المختارة.`);
        notify('ظهرت نتيجة نسبية قابلة للتفسير، وليست سعرًا أو قرارًا.', 'success');
        break;
      case 'enroll-move':
        if (!state.scoreRun) { notify('شغّلي مؤشر الديمو قبل عرض التفسير والحافز.', 'warning'); break; }
        state.enrolled = true;
        finishStage(5, 'تفعيل MoveDiscount التجريبي', 'تم إنشاء مسار تحفيز افتراضي؛ لا خصم حقيقي ولا تعديل قسط.');
        notify('تم عرض التفسير ومسار التحفيز الافتراضي.', 'success');
        break;
      case 'submit-review': submitReview(); break;
      case 'acknowledge-research':
        state.researchRead = true;
        finishStage(7, 'توثيق حدود الدليل البحثي', 'فصلت رحلة العرض بين أرقام البحث/المحاكاة وبين نتيجة نموذج الديمو المحلي.');
        notify('الآن اختمي بالمسار التجاري الصادق: طيار ثم دليل ثم عقد.', 'success');
        break;
      case 'complete-demo':
        if (state.finished) { restartDemo(); return; }
        finishStage(8, 'إنهاء رحلة المحكّم', 'المطلوب: شريك تصميم واحد وتجربة وضع ظل ثم قرار تجاري مبني على دليل.');
        notify('اكتملت الرحلة. استخدمي لوحة الإيراد لشرح نموذج العمل كافتراض، لا كإيراد فعلي.', 'success');
        break;
      default: break;
    }
  }

  function bindEvents() {
    document.querySelectorAll('[data-action]').forEach((node) => node.addEventListener('click', () => handleAction(node.dataset.action)));
    document.querySelectorAll('[data-role]').forEach((node) => node.addEventListener('click', () => {
      state.role = node.dataset.role;
      persist(); render();
    }));
    document.querySelectorAll('[data-view]').forEach((node) => node.addEventListener('click', () => {
      state.view = node.dataset.view;
      persist(); render();
      document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    document.querySelectorAll('[data-profile]').forEach((node) => node.addEventListener('click', () => {
      state.selectedProfile = node.dataset.profile;
      addAudit('اختيار حالة تركيبية', `تم اختيار ${profile().name} لشرح اختلاف الإشارة دون بيانات حقيقية.`);
      persist(); render();
    }));
    document.querySelectorAll('[data-stage]').forEach((node) => node.addEventListener('click', () => {
      const stage = Number(node.dataset.stage);
      if (Number.isInteger(stage) && (state.completed.includes(stage) || stage <= state.stage)) {
        state.stage = stage;
        state.finished = false;
        persist(); render();
      }
    }));
    document.querySelectorAll('[data-revenue]').forEach((node) => node.addEventListener('change', () => setRevenueField(node.dataset.revenue, node.value)));
  }

  render();
})();
