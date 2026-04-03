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
  // "Other / General",
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
  // "Other",
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

// ── COUNTRY CODES with per-country phone validation rules ─────────
// length  = max digits allowed in the local number
// pattern = regex the local number must satisfy to be VALID
const COUNTRIES = [
  { code: "+91",  flag: "IN", name: "India",        length: 10, pattern: /^[6-9]\d{9}$/,   placeholder: "9876543210",  hint: "10 digits, starting with 6–9" },
  { code: "+1",   flag: "US", name: "USA",           length: 10, pattern: /^[2-9]\d{9}$/,   placeholder: "2025550123",  hint: "10 digits, starting with 2–9" },
  { code: "+1",   flag: "CA", name: "Canada",        length: 10, pattern: /^[2-9]\d{9}$/,   placeholder: "4165550123",  hint: "10 digits, starting with 2–9" },
  { code: "+44",  flag: "GB", name: "UK",            length: 10, pattern: /^[1-9]\d{9}$/,   placeholder: "7911123456",  hint: "10 digits" },
  { code: "+61",  flag: "AU", name: "Australia",     length: 9,  pattern: /^[2-9]\d{8}$/,   placeholder: "412345678",   hint: "9 digits, starting with 2–9" },
  { code: "+971", flag: "AE", name: "UAE",           length: 9,  pattern: /^5\d{8}$/,       placeholder: "501234567",   hint: "9 digits, starting with 5" },
  { code: "+966", flag: "SA", name: "Saudi Arabia",  length: 9,  pattern: /^5\d{8}$/,       placeholder: "512345678",   hint: "9 digits, starting with 5" },
  { code: "+65",  flag: "SG", name: "Singapore",     length: 8,  pattern: /^[689]\d{7}$/,   placeholder: "91234567",    hint: "8 digits, starting with 6, 8 or 9" },
  { code: "+60",  flag: "MY", name: "Malaysia",      length: 9,  pattern: /^1\d{8}$/,       placeholder: "123456789",   hint: "9 digits, starting with 1" },
  { code: "+49",  flag: "DE", name: "Germany",       length: 10, pattern: /^[1-9]\d{9}$/,   placeholder: "1512345678",  hint: "10 digits" },
  { code: "+33",  flag: "FR", name: "France",        length: 9,  pattern: /^[1-9]\d{8}$/,   placeholder: "612345678",   hint: "9 digits" },
  { code: "+81",  flag: "JP", name: "Japan",         length: 10, pattern: /^[789]\d{9}$/,   placeholder: "9012345678",  hint: "10 digits, starting with 7–9" },
  { code: "+86",  flag: "CN", name: "China",         length: 11, pattern: /^1[3-9]\d{9}$/,  placeholder: "13812345678", hint: "11 digits, starting with 13–19" },
  { code: "+82",  flag: "KR", name: "South Korea",   length: 10, pattern: /^1\d{9}$/,       placeholder: "1012345678",  hint: "10 digits, starting with 1" },
  { code: "+55",  flag: "BR", name: "Brazil",        length: 11, pattern: /^[1-9]\d{10}$/,  placeholder: "11912345678", hint: "11 digits" },
  { code: "+27",  flag: "ZA", name: "South Africa",  length: 9,  pattern: /^[6-8]\d{8}$/,   placeholder: "712345678",   hint: "9 digits, starting with 6–8" },
  { code: "+234", flag: "NG", name: "Nigeria",       length: 10, pattern: /^[7-9]\d{9}$/,   placeholder: "8012345678",  hint: "10 digits, starting with 7–9" },
  { code: "+254", flag: "KE", name: "Kenya",         length: 9,  pattern: /^7\d{8}$/,       placeholder: "712345678",   hint: "9 digits, starting with 7" },
  { code: "+880", flag: "BD", name: "Bangladesh",    length: 10, pattern: /^1\d{9}$/,       placeholder: "1812345678",  hint: "10 digits, starting with 1" },
  { code: "+92",  flag: "PK", name: "Pakistan",      length: 10, pattern: /^3\d{9}$/,       placeholder: "3012345678",  hint: "10 digits, starting with 3" },
  { code: "+94",  flag: "LK", name: "Sri Lanka",     length: 9,  pattern: /^7\d{8}$/,       placeholder: "712345678",   hint: "9 digits, starting with 7" },
  { code: "+977", flag: "NP", name: "Nepal",         length: 10, pattern: /^9\d{9}$/,       placeholder: "9812345678",  hint: "10 digits, starting with 9" },
  { code: "+31",  flag: "NL", name: "Netherlands",   length: 9,  pattern: /^6\d{8}$/,       placeholder: "612345678",   hint: "9 digits, starting with 6" },
  { code: "+7",   flag: "RU", name: "Russia",        length: 10, pattern: /^9\d{9}$/,       placeholder: "9123456789",  hint: "10 digits, starting with 9" },
];

// Country flag emoji helper (using flag code like "IN" -> 🇮🇳)
function getFlagEmoji(countryCode) {
  return countryCode
    .toUpperCase()
    .split("")
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join("");
}

// ── Required fields ───────────────────────────────────────────────
const STEP1_REQUIRED = ["name", "email", "phone", "organization", "role"];
const STEP2_REQUIRED = ["productName", "businessType", "sector", "geography", "problem", "stage"];

export default function OnboardingForm({ onComplete, user }) {
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // default India
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [form, setForm] = useState({
    name:         user?.user_metadata?.full_name || "",
    email:        "",
    phone:        "",
    organization: "",
    role:         "",
    // website:      "",
    // linkedin:     "",
    teamSize:     "",
    productName:  "",
    businessType: "",
    sector:       "",
    geography:    "",
    problem:      "",
    stage:        "",
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const clearErr = k => setErrors(e => { const n = { ...e }; delete n[k]; return n; });

  // ── Phone: digits only, capped at country's max length ──────────
  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, selectedCountry.length);
    set("phone", digits);
    clearErr("phone");
  }

  // ── Country selection resets phone ───────────────────────────────
  function selectCountry(country) {
    setSelectedCountry(country);
    set("phone", "");
    clearErr("phone");
    setShowCountryDropdown(false);
    setCountrySearch("");
  }

  // ── Validators ───────────────────────────────────────────────────
  const isPhoneValid = () => {
  if (!selectedCountry.pattern.test(form.phone)) return false;
  // Reject all identical digits (e.g. 9999999999)
  if (/^(\d)\1+$/.test(form.phone)) return false;
  // Reject sequential ascending runs (e.g. 1234567890, 0123456789)
  const seq = "0123456789012345678901234567890";
  const rseq = "9876543210987654321098765432109";
  if (seq.includes(form.phone) || rseq.includes(form.phone)) return false;
  return true;
};
  const isEmailValid = (email) => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
  const isWebsiteValid = (url) => {
    if (!url || url.trim() === '') return true; // optional field
    try {
      const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?([\/\w .-]*)*\/?$/;
      return urlPattern.test(url.trim());
    } catch { return false; }
  };
  // ✅ Fixed — properly matches linkedin.com/in/..., /company/..., /profile/...
  const isLinkedInValid = (url) => {
    if (!url || url.trim() === '') return true; // optional field
    const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company|profile)\/[\w-]+\/?$/i;
    const isUrl = linkedinPattern.test(url.trim());
    const isUsername = /^[a-zA-Z0-9-]{3,100}$/.test(url.trim());
    return isUrl || isUsername;
  };

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
    // if (form.website && !isWebsiteValid(form.website))
    //   errs.website = "Enter a valid URL (e.g. https://yourcompany.com).";
    // if (form.linkedin && !isLinkedInValid(form.linkedin))
    //   errs.linkedin = "Enter a valid LinkedIn URL (e.g. linkedin.com/in/janedoe) or username.";
    return errs;
  }

  function isStep1Complete() {
  const filled = STEP1_REQUIRED.every(f => form[f] && form[f].trim?.() !== "");
  return filled && isEmailValid(form.email) && isPhoneValid();
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
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setErrors({});
      onComplete({
        ...form,
        phoneFull: `${selectedCountry.code}${form.phone}`,
        countryCode: selectedCountry.code,
      });
    }
  }

  const inp = (field) =>
    `w-full border rounded px-3 py-2 text-sm bg-[#EEF2F7] outline-none transition-all
    ${errors[field]
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : "border-[#D6DFED] focus:border-[#0091DA] focus:ring-2 focus:ring-[#0091DA]/10 focus:bg-white"}`;

  const stepLabels = ["Personal Info", "Venture Context"];
  const canProceed = step === 1 ? isStep1Complete() : isStep2Complete();
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
      {/* Topbar */}
      <div className="bg-[#00338D] h-12 flex items-center justify-between px-6 shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0091DA] rounded flex items-center justify-center font-mono font-bold text-xs text-white">IP</div>
          <div>
            <div className="text-xs font-bold tracking-widest text-white uppercase">Infopace Management Pvt Ltd</div>
            <div className="text-[7px] tracking-widest text-white/40 uppercase">Market Intelligence Platform</div>
          </div>
        </div>
        <div className="text-[9px] tracking-widest text-white/40 uppercase border border-white/20 px-3 py-1 rounded">
          All Sectors
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">

          {/* Hero */}
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-[#08152A] tracking-tight leading-tight">
              Market{" "}
              <em className="not-italic text-[#0091DA] underline underline-offset-[5px]" style={{ textDecorationThickness: 2 }}>
                Potential
              </em>{" "}
              Assessment
            </h1>
            <p className="text-sm text-[#627289] mt-2">
              Describe your product. Our AI reads your sector, geography and business type — then generates custom questions and a personalised market intelligence dashboard.
            </p>
          </div>

          {/* Step tabs */}
          <div className="flex gap-0 bg-white border border-[#D6DFED] rounded p-1 mb-2">
            {stepLabels.map((label, i) => (
              <button key={i}
                onClick={() => i + 1 < step && setStep(i + 1)}
                className={`flex-1 flex items-center gap-2 justify-center py-2 rounded text-xs font-medium transition-all
                  ${step === i + 1 ? "bg-[#00338D] text-white" : step > i + 1 ? "text-[#00A3A1] cursor-pointer" : "text-[#627289] cursor-default"}`}>
                <span className={`w-[17px] h-[17px] rounded-full border-[1.5px] flex items-center justify-center text-[9px] font-bold
                  ${step === i + 1 ? "border-[#0091DA] bg-[#0091DA] text-white" : step > i + 1 ? "border-[#00A3A1]" : "border-current"}`}>
                  {step > i + 1 ? "✓" : i + 1}
                </span>
                {label}
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-[#D6DFED] rounded mb-6 overflow-hidden">
            <div className="h-full bg-[#0091DA] rounded transition-all duration-500"
              style={{ width: step === 1 ? "50%" : "100%" }} />
          </div>

          {/* Card */}
          <div className="bg-white border border-[#D6DFED] rounded shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#00338D]" />

            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div className="p-7">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#D6DFED]">
                  <div className="w-10 h-10 bg-[#EEF2FB] rounded flex items-center justify-center text-lg">👤</div>
                  <div>
                    <div className="text-sm font-bold text-[#08152A]">Personal Information</div>
                    <div className="text-xs text-[#627289] mt-0.5">Stored securely in our database</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">Full Name *</label>
                    <input className={inp("name")} placeholder="Jane Doe" value={form.name}
                      onChange={e => { set("name", e.target.value); clearErr("name"); }} />
                    {errors.name && <span className="text-[10px] text-red-500">{errors.name}</span>}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">Email Address *</label>
                    <input
                      className={inp("email")}
                      placeholder="jane@company.com"
                      type="email"
                      value={form.email}
                      onChange={e => { set("email", e.target.value); clearErr("email"); }}
                      onBlur={() => {
                        if (form.email && !isEmailValid(form.email))
                          setErrors(e => ({ ...e, email: "Enter a valid email address (e.g. jane@company.com)." }));
                      }}
                    />
                    {errors.email && <span className="text-[10px] text-red-500">{errors.email}</span>}
                  </div>

                  {/* ── Phone with Country Code Picker ── */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">Phone Number *</label>
                    
                    {/* Unified input box */}
                    <div
                      className={`flex items-stretch rounded overflow-visible transition-all
                        ${phoneHasError
                          ? "ring-2 ring-red-200"
                          : "focus-within:ring-2 focus-within:ring-[#0091DA]/10"}`}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Country selector */}
                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => { setShowCountryDropdown(v => !v); setCountrySearch(""); }}
                          className={`flex items-center gap-1.5 px-2.5 h-full rounded-l border text-sm font-medium transition-all
                            ${phoneHasError
                              ? "border-red-400 bg-red-50"
                              : "border-[#D6DFED] bg-[#EEF2F7] hover:bg-[#D6DFED] focus-within:border-[#0091DA]"}
                            whitespace-nowrap`}
                        >
                          <span className="text-base">{getFlagEmoji(selectedCountry.flag)}</span>
                          <span className="text-xs font-semibold text-[#08152A]">{selectedCountry.code}</span>
                          <span className="text-[9px] text-[#9BAABB]">▾</span>
                        </button>

                        {/* Dropdown panel */}
                        {showCountryDropdown && (
                          <div className="absolute top-full left-0 z-50 mt-1 w-68 bg-white border border-[#D6DFED] rounded shadow-xl overflow-hidden" style={{ width: 272 }}>
                            <div className="p-2 border-b border-[#EEF2F7]">
                              <input
                                autoFocus
                                className="w-full text-xs px-2.5 py-1.5 border border-[#D6DFED] rounded outline-none focus:border-[#0091DA] bg-[#EEF2F7]"
                                placeholder="Search country or code…"
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                onClick={e => e.stopPropagation()}
                              />
                            </div>
                            <div className="max-h-52 overflow-y-auto">
                              {filteredCountries.length === 0
                                ? <div className="text-xs text-[#9BAABB] p-3 text-center">No results</div>
                                : filteredCountries.map((c, i) => (
                                  <button key={i} type="button"
                                    onClick={() => selectCountry(c)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-[#EEF2F7] transition-all text-left
                                      ${selectedCountry.code === c.code && selectedCountry.name === c.name
                                        ? "bg-[#EEF2FB] font-semibold text-[#00338D]"
                                        : "text-[#08152A]"}`}
                                  >
                                    <span className="text-base leading-none">{getFlagEmoji(c.flag)}</span>
                                    <span className="flex-1">{c.name}</span>
                                    <span className="text-[#9BAABB] font-mono text-[10px]">{c.code}</span>
                                  </button>
                                ))
                              }
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Number input */}
                      <div className={`flex flex-1 items-center border border-l-0 rounded-r transition-all
                        ${phoneHasError
                          ? "border-red-400 bg-[#EEF2F7]"
                          : "border-[#D6DFED] bg-[#EEF2F7] focus-within:border-[#0091DA] focus-within:bg-white"}`}
                      >
                        <input
                          className="flex-1 bg-transparent outline-none text-sm py-2 pl-3 min-w-0"
                          type="tel"
                          inputMode="numeric"
                          placeholder={selectedCountry.placeholder}
                          value={form.phone}
                          onChange={handlePhoneChange}
                          onBlur={() => {
                            if (form.phone && !isPhoneValid())
                              setErrors(e => ({ ...e, phone: `Invalid number for ${selectedCountry.name}. ${selectedCountry.hint}. Sequential or repeated digits are not allowed.` }));
                          }}
                        />
                        <span className="pr-3 text-[10px] text-[#9BAABB] whitespace-nowrap">
                          {form.phone.length}/{selectedCountry.length}
                        </span>
                      </div>
                    </div>

                    {/* Hint or error */}
                    {!phoneHasError
                      ? <span className="text-[10px] text-[#9BAABB]">{selectedCountry.name}: {selectedCountry.hint}</span>
                      : <span className="text-[10px] text-red-500">{errors.phone}</span>
                    }
                  </div>

                  {/* Organization */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">Organization *</label>
                    <input className={inp("organization")} placeholder="Acme Technologies" value={form.organization}
                      onChange={e => { set("organization", e.target.value); clearErr("organization"); }} />
                    {errors.organization && <span className="text-[10px] text-red-500">{errors.organization}</span>}
                  </div>

                  {/* Role */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">Your Role *</label>
                    <select className={inp("role")} value={form.role}
                      onChange={e => { set("role", e.target.value); clearErr("role"); }}>
                      <option value="">Select your role…</option>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                    {errors.role && <span className="text-[10px] text-red-500">{errors.role}</span>}
                  </div>

                  {/* Website
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">
                      Website <span className="text-[#9BAABB] normal-case font-normal">(optional)</span>
                    </label>
                    <input className={inp("website")} placeholder="https://yourcompany.com" value={form.website}
                      onChange={e => set("website", e.target.value)} />
                  </div>

                  {/* LinkedIn */}
                  {/* <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">
                      LinkedIn <span className="text-[#9BAABB] normal-case font-normal">(optional)</span>
                    </label>
                    <input className={inp("linkedin")} placeholder="linkedin.com/in/janedoe" value={form.linkedin}
                      onChange={e => set("linkedin", e.target.value)} />
                  </div> */} 

                  {/* Team Size */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">
                      Team Size <span className="text-[#9BAABB] normal-case font-normal">(optional)</span>
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {TEAM_SIZES.map(s => (
                        <button key={s} type="button" onClick={() => set("teamSize", s)}
                          className={`px-3 py-1.5 border rounded text-xs font-medium transition-all
                            ${form.teamSize === s ? "bg-[#00338D] text-white border-[#00338D]" : "bg-[#EEF2F7] text-[#627289] border-[#D6DFED] hover:border-[#00338D]"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ── STEP 2: Venture Context ── */}
            {step === 2 && (
              <div className="p-7">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#D6DFED]">
                  <div className="w-10 h-10 bg-[#EEF2FB] rounded flex items-center justify-center text-lg">🚀</div>
                  <div>
                    <div className="text-sm font-bold text-[#08152A]">Tell us about your product</div>
                    <div className="text-xs text-[#627289] mt-0.5">This drives everything — AI tailors all subsequent questions to your exact context</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">Product / Business Name *</label>
                    <input className={inp("productName")} placeholder="e.g. MedSync AI" value={form.productName}
                      onChange={e => { set("productName", e.target.value); clearErr("productName"); }} />
                    {errors.productName && <span className="text-[10px] text-red-500">{errors.productName}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">Industry Sector *</label>
                    <select className={inp("sector")} value={form.sector}
                      onChange={e => { set("sector", e.target.value); clearErr("sector"); }}>
                      <option value="">Select sector…</option>
                      {SECTORS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    {errors.sector && <span className="text-[10px] text-red-500">{errors.sector}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">Business Type *</label>
                    <select className={inp("businessType")} value={form.businessType}
                      onChange={e => { set("businessType", e.target.value); clearErr("businessType"); }}>
                      <option value="">Select type…</option>
                      {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    {errors.businessType && <span className="text-[10px] text-red-500">{errors.businessType}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">Target Geography *</label>
                    <select className={inp("geography")} value={form.geography}
                      onChange={e => { set("geography", e.target.value); clearErr("geography"); }}>
                      <option value="">Select region…</option>
                      {GEO.map(g => <option key={g.v} value={g.v}>{g.l}</option>)}
                    </select>
                    {errors.geography && <span className="text-[10px] text-red-500">{errors.geography}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">
                      What problem does your product solve? (Be Specific) *
                    </label>
                    <p className="text-[10px] text-[#0091DA] italic">
                      Be specific. e.g. "Hospital procurement teams spend 3+ hours daily on manual vendor coordination…"
                    </p>
                    <textarea className={inp("problem")} rows={4}
                      placeholder="Describe the core problem and your solution approach…"
                      value={form.problem}
                      onChange={e => { set("problem", e.target.value); clearErr("problem"); }} />
                    {errors.problem && <span className="text-[10px] text-red-500">{errors.problem}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#627289]">Stage of Business *</label>
                    <div className="flex gap-2 flex-wrap">
                      {STAGES.map((s, i) => (
                        <button key={s} type="button"
                          onClick={() => { set("stage", String(i + 1)); clearErr("stage"); }}
                          className={`px-3 py-1.5 border rounded text-xs font-medium transition-all
                            ${form.stage === String(i + 1) ? "bg-[#00338D] text-white border-[#00338D]" : "bg-[#EEF2F7] text-[#627289] border-[#D6DFED] hover:border-[#00338D]"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    {errors.stage && <span className="text-[10px] text-red-500">{errors.stage}</span>}
                  </div>

                </div>
              </div>
            )}

            {/* Footer nav */}
            <div className="flex justify-between items-center px-7 py-4 border-t border-[#D6DFED] bg-[#EEF2F7]">
              <button onClick={() => setStep(1)}
                className={`px-5 py-2 text-xs font-semibold border border-[#D6DFED] rounded text-[#627289] bg-transparent hover:border-[#08152A] hover:text-[#08152A] transition-all
                  ${step === 1 ? "invisible" : ""}`}>
                ← Back
              </button>
              <span className="text-[11px] text-[#627289] font-mono">Step {step} of 2</span>
              <button onClick={handleNext}
                disabled={!canProceed}
                title={!canProceed ? "Please fill all required fields before continuing" : ""}
                className={`px-6 py-2 text-xs font-semibold rounded transition-all
                  ${canProceed
                    ? "bg-[#00338D] text-white hover:bg-[#005EB8] cursor-pointer"
                    : "bg-[#D6DFED] text-[#9BAABB] cursor-not-allowed"}`}>
                {step === 1 ? "Next →" : "Start Assessment →"}
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#9BAABB] mt-5">
            🔒 Your data is stored securely. We never share personal details with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}