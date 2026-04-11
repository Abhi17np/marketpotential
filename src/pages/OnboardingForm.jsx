import { useState } from "react";

// ── SECTORS ──────────────────────────────────────────────────────
const SECTORS = [
  "Information Technology / SaaS",
  "Healthcare & Pharma",
  "Financial Services / FinTech",
  "E-Commerce & Retail",
  "Education & EdTech",
  "Manufacturing",
  "Real Estate & PropTech",
  "Logistics & Supply Chain",
  "Media & Entertainment",
  "Agriculture & AgroTech",
  "Energy & CleanTech",
];

// ── GEOGRAPHIES ───────────────────────────────────────────────────
const GEO = [
  { v: "T1",  l: "India — Tier 1 Cities" },
  { v: "T2",  l: "India — Tier 2 & 3 Cities" },
  { v: "PI",  l: "Pan India" },
  { v: "SA",  l: "South Asia (SAARC)" },
  { v: "SE",  l: "Southeast Asia" },
  { v: "MEA", l: "Middle East & Africa" },
  { v: "EU",  l: "Europe" },
  { v: "NA",  l: "North America" },
  { v: "GL",  l: "Global" },
];

// ── BUSINESS TYPES ────────────────────────────────────────────────
const BUSINESS_TYPES = [
  "B2B (Business to Business)",
  "B2C (Business to Consumer)",
  "B2B2C",
  "D2C (Direct to Consumer)",
  "Marketplace",
  "SaaS / Platform",
];

const ROLES = [
  "Founder / Co-Founder", "CEO / MD", "CTO / CPO",
  "CMO / VP Marketing", "Business Development",
  "Product Manager", "Investor / VC", "Consultant / Advisor", "Other",
];

const TEAM_SIZES = ["Solo / 1", "2-5", "6-15", "16-50", "51-200", "200+"];

const STAGES = [
  "Idea Stage", "MVP / Prototype", "Live Pilots",
  "Paying Customers", "Scaling / Growth",
];

const COUNTRIES = [
  { code: "+91",  flag: "in", name: "India",        length: 10, pattern: /^[6-9]\d{9}$/,   placeholder: "9876543210",  hint: "10 digits, starting with 6–9" },
  { code: "+1",   flag: "us", name: "USA",           length: 10, pattern: /^[2-9]\d{9}$/,   placeholder: "2025550123",  hint: "10 digits, starting with 2–9" },
  { code: "+1",   flag: "ca", name: "Canada",        length: 10, pattern: /^[2-9]\d{9}$/,   placeholder: "4165550123",  hint: "10 digits, starting with 2–9" },
  { code: "+44",  flag: "gb", name: "UK",            length: 10, pattern: /^[1-9]\d{9}$/,   placeholder: "7911123456",  hint: "10 digits" },
  { code: "+61",  flag: "au", name: "Australia",     length: 9,  pattern: /^[2-9]\d{8}$/,   placeholder: "412345678",   hint: "9 digits, starting with 2–9" },
  { code: "+971", flag: "ae", name: "UAE",           length: 9,  pattern: /^5\d{8}$/,       placeholder: "501234567",   hint: "9 digits, starting with 5" },
  { code: "+966", flag: "sa", name: "Saudi Arabia",  length: 9,  pattern: /^5\d{8}$/,       placeholder: "512345678",   hint: "9 digits, starting with 5" },
  { code: "+65",  flag: "sg", name: "Singapore",     length: 8,  pattern: /^[689]\d{7}$/,   placeholder: "91234567",    hint: "8 digits, starting with 6/8/9" },
  { code: "+60",  flag: "my", name: "Malaysia",      length: 9,  pattern: /^1\d{8}$/,       placeholder: "123456789",   hint: "9 digits, starting with 1" },
  { code: "+49",  flag: "de", name: "Germany",       length: 10, pattern: /^[1-9]\d{9}$/,   placeholder: "1512345678",  hint: "10 digits" },
  { code: "+33",  flag: "fr", name: "France",        length: 9,  pattern: /^[1-9]\d{8}$/,   placeholder: "612345678",   hint: "9 digits" },
  { code: "+81",  flag: "jp", name: "Japan",         length: 10, pattern: /^[789]\d{9}$/,   placeholder: "9012345678",  hint: "10 digits, starting with 7–9" },
  { code: "+86",  flag: "cn", name: "China",         length: 11, pattern: /^1[3-9]\d{9}$/,  placeholder: "13812345678", hint: "11 digits, starting with 13–19" },
  { code: "+82",  flag: "kr", name: "South Korea",   length: 10, pattern: /^1\d{9}$/,       placeholder: "1012345678",  hint: "10 digits, starting with 1" },
  { code: "+55",  flag: "br", name: "Brazil",        length: 11, pattern: /^[1-9]\d{10}$/,  placeholder: "11912345678", hint: "11 digits" },
  { code: "+27",  flag: "za", name: "South Africa",  length: 9,  pattern: /^[6-8]\d{8}$/,   placeholder: "712345678",   hint: "9 digits, starting with 6–8" },
  { code: "+234", flag: "ng", name: "Nigeria",       length: 10, pattern: /^[7-9]\d{9}$/,   placeholder: "8012345210",  hint: "10 digits, starting with 7–9" },
  { code: "+254", flag: "ke", name: "Kenya",         length: 9,  pattern: /^7\d{8}$/,       placeholder: "712345678",   hint: "9 digits, starting with 7" },
  { code: "+880", flag: "bd", name: "Bangladesh",    length: 10, pattern: /^1\d{9}$/,       placeholder: "1812345678",  hint: "10 digits, starting with 1" },
  { code: "+92",  flag: "pk", name: "Pakistan",      length: 10, pattern: /^3\d{9}$/,       placeholder: "3012345678",  hint: "10 digits, starting with 3" },
  { code: "+94",  flag: "lk", name: "Sri Lanka",     length: 9,  pattern: /^7\d{8}$/,       placeholder: "712345678",   hint: "9 digits, starting with 7" },
  { code: "+977", flag: "np", name: "Nepal",         length: 10, pattern: /^9\d{9}$/,       placeholder: "9812345678",  hint: "10 digits, starting with 9" },
  { code: "+31",  flag: "nl", name: "Netherlands",   length: 9,  pattern: /^6\d{8}$/,       placeholder: "612345678",   hint: "9 digits, starting with 6" },
  { code: "+7",   flag: "ru", name: "Russia",        length: 10, pattern: /^9\d{9}$/,       placeholder: "9123456789",  hint: "10 digits, starting with 9" },
];

// ── Flag image component — works on ALL OS including Windows ──────
// Uses flagcdn.com which renders real PNG flags, no emoji needed
const Flag = ({ code }) => (
  <img
    src={`https://flagcdn.com/20x15/${code}.png`}
    srcSet={`https://flagcdn.com/40x30/${code}.png 2x`}
    width="20"
    height="15"
    alt={code}
    style={{ borderRadius: 2, flexShrink: 0, display: "inline-block" }}
    onError={e => { e.target.style.display = "none"; }}
  />
);

// ── Required fields ───────────────────────────────────────────────
const STEP1_REQUIRED = ["name", "email", "phone", "organization", "role"];
const STEP2_REQUIRED = ["productName", "businessType", "sector", "geography", "problem", "stage", "consent"];

// ── Validators ────────────────────────────────────────────────────
const isEmailValid = (email) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);

function isPhoneValidFor(phone, country) {
  if (!country.pattern.test(phone)) return false;
  if (/^(\d)\1+$/.test(phone)) return false; // all same digits
  const seq  = "01234567890123456789";
  const rseq = "98765432109876543210";
  if (seq.includes(phone) || rseq.includes(phone)) return false;
  return true;
}

export default function OnboardingForm({ onComplete, user }) {
  const [step, setStep]                           = useState(1);
  const [selectedCountry, setSelectedCountry]     = useState(COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch]         = useState("");

  const [form, setForm] = useState({
    name:         user?.user_metadata?.full_name || "",
    email:        "",
    phone:        "",
    organization: "",
    role:         "",
    teamSize:     "",
    productName:  "",
    businessType: "",
    sector:       "",
    geography:    "",
    problem:      "",
    stage:        "",
    consent: false,   
  });
  const [errors, setErrors] = useState({});

  const set      = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const clearErr = (k)    => setErrors(e => { const n = { ...e }; delete n[k]; return n; });

  const isPhoneValid = () => isPhoneValidFor(form.phone, selectedCountry);

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, selectedCountry.length);
    set("phone", digits);
    clearErr("phone");
  }

  function selectCountry(country) {
    setSelectedCountry(country);
    set("phone", "");
    clearErr("phone");
    setShowCountryDropdown(false);
    setCountrySearch("");
  }

  function validate(fields) {
    const errs = {};
    fields.forEach(f => {
      if (!form[f] || form[f].trim?.() === "") {
        const label = {
          name: "Full Name", email: "Email", phone: "Phone Number",
          organization: "Organization", role: "Role",
          productName: "Product / Business Name", businessType: "Business Type",
          sector: "Industry Sector", geography: "Target Geography",
          problem: "Problem statement", stage: "Stage of Business",
        }[f] || f;
        errs[f] = `${label} is required.`;
      }
    });
    if (form.email && !isEmailValid(form.email))
      errs.email = "Enter a valid email address (e.g. jane@company.com).";
    if (form.phone && !isPhoneValid())
      errs.phone = `Invalid number for ${selectedCountry.name}. ${selectedCountry.hint}.`;
    return errs;
  }

  function isStep1Complete() {
    return STEP1_REQUIRED.every(f => form[f] && form[f].trim?.() !== "")
      && isEmailValid(form.email)
      && isPhoneValid();
  }
  function isStep2Complete() {
    return STEP2_REQUIRED.every(f => form[f] && form[f].trim?.() !== "");
  }

  function handleNext() {
    if (step === 1) {
      const errs = validate(STEP1_REQUIRED);
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setErrors({});
      setStep(2);
    } else {
      const errs = validate(STEP2_REQUIRED);
      if (!form.consent) errs.consent = "Required";
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setErrors({});
      onComplete({
        ...form,
        phoneFull:   `${selectedCountry.code}${form.phone}`,
        countryCode: selectedCountry.code,
      });
    }
  }

  // ── Shared input style ────────────────────────────────────────
  const inp = (field) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm bg-[#EEF2F7] outline-none transition-all
    ${errors[field]
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-[#D6DFED] focus:border-[#0091DA] focus:ring-2 focus:ring-[#0091DA]/10 focus:bg-white"}`;

  // ── Shared label style ────────────────────────────────────────
  const lbl = "block text-[11px] font-semibold uppercase tracking-wider text-[#627289] mb-1.5";

  const canProceed = step === 1
  ? STEP1_REQUIRED.every(k => form[k]?.trim?.() || form[k]) && isPhoneValid()
  : STEP2_REQUIRED.every(k => k === "consent" ? form[k] === true : form[k]?.trim?.() || form[k]);
  const phoneHasError = !!errors.phone;

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  
  return (
    <div
      className="min-h-screen bg-[#EEF2F7] flex flex-col"
      onClick={() => showCountryDropdown && setShowCountryDropdown(false)}
    >

      {/* ══ TOPBAR ══ */}
      <header className="bg-[#00338D] h-12 flex items-center justify-between px-4 sm:px-6 shadow-md sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#0091DA] rounded flex items-center justify-center font-mono font-bold text-xs text-white flex-shrink-0">IP</div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs font-bold tracking-widest text-white uppercase truncate">
              Infopace Management Pvt Ltd
            </div>
            <div className="text-[7px] tracking-widest text-white/40 uppercase hidden sm:block">
              Market Intelligence Platform
            </div>
          </div>
        </div>
        <div className="text-[9px] tracking-widest text-white/40 uppercase border border-white/20 px-2 sm:px-3 py-1 rounded flex-shrink-0">
          All Sectors
        </div>
      </header>

      {/* ══ SCROLLABLE BODY ══ */}
      <main className="flex-1 overflow-y-auto">
        {/*
          KEY FIX: w-full + max-w-5xl + mx-auto fills the page properly.
          px-4 sm:px-8 lg:px-16 gives breathing room without huge side gaps.
        */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-8">

          {/* Hero */}
          <div className="mb-5 sm:mb-7">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#08152A] tracking-tight leading-tight">
              Market{" "}
              <em className="not-italic text-[#0091DA] underline underline-offset-[5px]" style={{ textDecorationThickness: 2 }}>
                Potential
              </em>{" "}
              Assessment
            </h1>
            <p className="text-xs sm:text-sm text-[#627289] mt-2 leading-relaxed">
              Describe your product. Our AI reads your sector, geography and business type — then generates custom questions and a personalised market intelligence dashboard.
            </p>
          </div>

          {/* Step tabs */}
          <div className="flex bg-white border border-[#D6DFED] rounded-lg p-1 mb-2">
            {["Personal Info", "Venture Context"].map((label, i) => (
              <button key={i}
                onClick={() => i + 1 < step && setStep(i + 1)}
                className={`flex-1 flex items-center gap-1.5 sm:gap-2 justify-center py-2 rounded-md text-xs font-medium transition-all
                  ${step === i + 1 ? "bg-[#00338D] text-white" : step > i + 1 ? "text-[#00A3A1] cursor-pointer" : "text-[#627289] cursor-default"}`}>
                <span className={`w-[17px] h-[17px] rounded-full border-[1.5px] flex items-center justify-center text-[9px] font-bold flex-shrink-0
                  ${step === i + 1 ? "border-[#0091DA] bg-[#0091DA] text-white" : step > i + 1 ? "border-[#00A3A1]" : "border-current"}`}>
                  {step > i + 1 ? "✓" : i + 1}
                </span>
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-[#D6DFED] rounded mb-5 overflow-hidden">
            <div className="h-full bg-[#0091DA] rounded transition-all duration-500"
              style={{ width: step === 1 ? "50%" : "100%" }} />
          </div>

          {/* ══ CARD ══ */}
          <div className="bg-white border border-[#D6DFED] rounded-xl shadow-sm overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-[#00338D]" />

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#D6DFED]">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EEF2FB] rounded-lg flex items-center justify-center text-lg flex-shrink-0">👤</div>
                  <div>
                    <div className="text-sm font-bold text-[#08152A]">Personal Information</div>
                    <div className="text-xs text-[#627289] mt-0.5">Stored securely in our database</div>
                  </div>
                </div>

                {/*
                  RESPONSIVE GRID:
                  - Mobile  (< 640px):  1 column
                  - Tablet  (≥ 640px):  2 columns
                  - Desktop (≥ 1024px): 3 columns
                */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* Full Name */}
                  <div>
                    <label className={lbl}>Full Name *</label>
                    <input className={inp("name")} placeholder="Jane Doe" value={form.name}
                      autoComplete="off"
                      onChange={e => { set("name", e.target.value); clearErr("name"); }} />
                    {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={lbl}>Email Address *</label>
                    <input className={inp("email")} placeholder="jane@company.com" type="email"
                      value={form.email} autoComplete="new-password"
                      onChange={e => { set("email", e.target.value); clearErr("email"); }}
                      onBlur={() => {
                        if (form.email && !isEmailValid(form.email))
                          setErrors(e => ({ ...e, email: "Enter a valid email address." }));
                      }} />
                    {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Organization */}
                  <div>
                    <label className={lbl}>Organization *</label>
                    <input className={inp("organization")} placeholder="Acme Technologies"
                      value={form.organization} autoComplete="off"
                      onChange={e => { set("organization", e.target.value); clearErr("organization"); }} />
                    {errors.organization && <p className="text-[11px] text-red-500 mt-1">{errors.organization}</p>}
                  </div>

                  {/* Phone — spans 2 cols on tablet, 1 col on mobile/desktop */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className={lbl}>Phone Number *</label>
                    <div
                      className={`flex items-stretch rounded-lg overflow-visible transition-all
                        ${phoneHasError ? "ring-2 ring-red-200" : "focus-within:ring-2 focus-within:ring-[#0091DA]/10"}`}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Country selector */}
                      <div className="relative flex-shrink-0">
                        <button type="button"
                          onClick={() => { setShowCountryDropdown(v => !v); setCountrySearch(""); }}
                          className={`flex items-center gap-1.5 px-2.5 h-full rounded-l-lg border text-sm font-medium transition-all whitespace-nowrap
                            ${phoneHasError
                              ? "border-red-400 bg-red-50"
                              : "border-[#D6DFED] bg-[#EEF2F7] hover:bg-[#D6DFED]"}`}>
                          <Flag code={selectedCountry.flag} />
                          <span className="text-xs font-semibold text-[#08152A]">{selectedCountry.code}</span>
                          <span className="text-[9px] text-[#9BAABB]">▾</span>
                        </button>

                        {/* Dropdown */}
                        {showCountryDropdown && (
                          <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-[#D6DFED] rounded-lg shadow-xl overflow-hidden" style={{ width: 272 }}>
                            <div className="p-2 border-b border-[#EEF2F7]">
                              <input autoFocus
                                className="w-full text-xs px-2.5 py-1.5 border border-[#D6DFED] rounded-md outline-none focus:border-[#0091DA] bg-[#EEF2F7]"
                                placeholder="Search country or code…"
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                onClick={e => e.stopPropagation()} />
                            </div>
                            <div className="max-h-52 overflow-y-auto">
                              {filteredCountries.length === 0
                                ? <div className="text-xs text-[#9BAABB] p-3 text-center">No results</div>
                                : filteredCountries.map((c, i) => (
                                  <button key={i} type="button" onClick={() => selectCountry(c)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-[#EEF2F7] transition-all text-left
                                      ${selectedCountry.code === c.code && selectedCountry.name === c.name
                                        ? "bg-[#EEF2FB] font-semibold text-[#00338D]"
                                        : "text-[#08152A]"}`}>
                                    <Flag code={c.flag} />
                                    <span className="flex-1 truncate">{c.name}</span>
                                    <span className="text-[#9BAABB] font-mono text-[10px]">{c.code}</span>
                                  </button>
                                ))
                              }
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Number input */}
                      <div className={`flex flex-1 items-center border border-l-0 rounded-r-lg transition-all min-w-0
                        ${phoneHasError
                          ? "border-red-400 bg-[#EEF2F7]"
                          : "border-[#D6DFED] bg-[#EEF2F7] focus-within:border-[#0091DA] focus-within:bg-white"}`}>
                        <input
                          className="flex-1 bg-transparent outline-none text-sm py-2.5 pl-3 min-w-0"
                          type="tel" inputMode="numeric" autoComplete="off"
                          placeholder={selectedCountry.placeholder}
                          value={form.phone}
                          onChange={handlePhoneChange}
                          onBlur={() => {
                            if (form.phone && !isPhoneValid())
                              setErrors(e => ({ ...e, phone: `Invalid for ${selectedCountry.name}. ${selectedCountry.hint}.` }));
                          }} />
                        <span className="pr-3 text-[10px] text-[#9BAABB] whitespace-nowrap">
                          {form.phone.length}/{selectedCountry.length}
                        </span>
                      </div>
                    </div>
                    {!phoneHasError
                      ? <p className="text-[11px] text-[#9BAABB] mt-1">{selectedCountry.name}: {selectedCountry.hint}</p>
                      : <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Role — full width on all sizes */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <label className={lbl}>Your Role *</label>
                    <select className={inp("role")} value={form.role} autoComplete="off"
                      onChange={e => { set("role", e.target.value); clearErr("role"); }}>
                      <option value="">Select your role…</option>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                    {errors.role && <p className="text-[11px] text-red-500 mt-1">{errors.role}</p>}
                  </div>

                  {/* Team Size — full width */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <label className={lbl}>Team Size <span className="normal-case font-normal text-[#9BAABB]">(optional)</span></label>
                    <div className="flex gap-2 flex-wrap">
                      {TEAM_SIZES.map(s => (
                        <button key={s} type="button" onClick={() => set("teamSize", s)}
                          className={`px-3 py-2 border rounded-lg text-xs font-medium transition-all active:scale-95
                            ${form.teamSize === s
                              ? "bg-[#00338D] text-white border-[#00338D]"
                              : "bg-[#EEF2F7] text-[#627289] border-[#D6DFED] hover:border-[#00338D]"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#D6DFED]">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EEF2FB] rounded-lg flex items-center justify-center text-lg flex-shrink-0">🚀</div>
                  <div>
                    <div className="text-sm font-bold text-[#08152A]">Tell us about your product</div>
                    <div className="text-xs text-[#627289] mt-0.5">This drives everything — AI tailors all subsequent questions to your exact context</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* Product Name */}
                  <div>
                    <label className={lbl}>Product / Business Name *</label>
                    <input className={inp("productName")} placeholder="e.g. MedSync AI"
                      value={form.productName} autoComplete="off"
                      onChange={e => { set("productName", e.target.value); clearErr("productName"); }} />
                    {errors.productName && <p className="text-[11px] text-red-500 mt-1">{errors.productName}</p>}
                  </div>

                  {/* Sector */}
                  <div>
                    <label className={lbl}>Industry Sector *</label>
                    <select className={inp("sector")} value={form.sector} autoComplete="off"
                      onChange={e => { set("sector", e.target.value); clearErr("sector"); }}>
                      <option value="">Select sector…</option>
                      {SECTORS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    {errors.sector && <p className="text-[11px] text-red-500 mt-1">{errors.sector}</p>}
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className={lbl}>Business Type *</label>
                    <select className={inp("businessType")} value={form.businessType} autoComplete="off"
                      onChange={e => { set("businessType", e.target.value); clearErr("businessType"); }}>
                      <option value="">Select type…</option>
                      {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    {errors.businessType && <p className="text-[11px] text-red-500 mt-1">{errors.businessType}</p>}
                  </div>

                  {/* Geography */}
                  <div>
                    <label className={lbl}>Target Geography *</label>
                    <select className={inp("geography")} value={form.geography} autoComplete="off"
                      onChange={e => { set("geography", e.target.value); clearErr("geography"); }}>
                      <option value="">Select region…</option>
                      {GEO.map(g => <option key={g.v} value={g.v}>{g.l}</option>)}
                    </select>
                    {errors.geography && <p className="text-[11px] text-red-500 mt-1">{errors.geography}</p>}
                  </div>

                  {/* Stage — spans 2 cols on tablet, 2 on desktop */}
                  <div className="sm:col-span-1 lg:col-span-2">
                    <label className={lbl}>Stage of Business *</label>
                    <div className="flex gap-2 flex-wrap">
                      {STAGES.map((s, i) => (
                        <button key={s} type="button"
                          onClick={() => { set("stage", String(i + 1)); clearErr("stage"); }}
                          className={`px-3 py-2 border rounded-lg text-xs font-medium transition-all active:scale-95
                            ${form.stage === String(i + 1)
                              ? "bg-[#00338D] text-white border-[#00338D]"
                              : "bg-[#EEF2F7] text-[#627289] border-[#D6DFED] hover:border-[#00338D]"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    {errors.stage && <p className="text-[11px] text-red-500 mt-1">{errors.stage}</p>}
                  </div>

                  {/* Problem — always full width */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <label className={lbl}>What problem does your product solve? (Be Specific) *</label>
                    <p className="text-[11px] text-[#0091DA] italic mb-1.5">
                      e.g. "Hospital procurement teams spend 3+ hours daily on manual vendor coordination…"
                    </p>
                    <textarea className={`${inp("problem")} resize-none`} rows={4} autoComplete="off"
                      placeholder="Describe the core problem and your solution approach…"
                      value={form.problem}
                      onChange={e => { set("problem", e.target.value); clearErr("problem"); }} />
                    {errors.problem && <p className="text-[11px] text-red-500 mt-1">{errors.problem}</p>}
                  </div>


                </div>
            {/* Data Consent */}
<div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-6">
  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all
    ${errors.consent ? "border-red-400 bg-red-50" : form.consent
      ? "border-[#00338D] bg-[#EEF2FB]"
      : "border-[#D6DFED] bg-[#EEF2F7] hover:border-[#00338D]"}`}>
    <input
      type="checkbox"
      checked={form.consent}
      onChange={e => { set("consent", e.target.checked); clearErr("consent"); }}
      className="mt-0.5 w-4 h-4 accent-[#00338D] flex-shrink-0"
    />
    <span className="text-xs text-[#627289] leading-relaxed">
      I consent to providing my details for this assessment.{" "}
      <span className="text-[#00338D] font-semibold">
        Details will not be shared with third parties for any other purposes.
      </span>
    </span>
  </label>
  {errors.consent && <p className="text-[11px] text-red-500 mt-1">Please accept the consent to continue.</p>}
</div>
              </div>
            )}



            {/* ── FOOTER NAV ── */}
            <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 border-t border-[#D6DFED] bg-[#EEF2F7]">
              <button onClick={() => setStep(1)}
                className={`px-4 sm:px-5 py-2 text-xs font-semibold border border-[#D6DFED] rounded-lg
                  text-[#627289] bg-transparent hover:border-[#08152A] hover:text-[#08152A] transition-all
                  ${step === 1 ? "invisible" : ""}`}>
                ← Back
              </button>
              <span className="text-[11px] text-[#627289] font-mono">Step {step} of 2</span>
              <button onClick={handleNext} disabled={!canProceed}
                title={!canProceed ? "Please fill all required fields before continuing" : ""}
                className={`px-5 sm:px-6 py-2 text-xs font-semibold rounded-lg transition-all
                  ${canProceed
                    ? "bg-[#00338D] text-white hover:bg-[#005EB8] cursor-pointer active:scale-95"
                    : "bg-[#D6DFED] text-[#9BAABB] cursor-not-allowed"}`}>
                {step === 1 ? "Next →" : "Start Assessment →"}
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#9BAABB] mt-4 pb-6">
            🔒 Your data is stored securely. We never share personal details with third parties.
          </p>

        </div>
      </main>
    </div>
  );
}
