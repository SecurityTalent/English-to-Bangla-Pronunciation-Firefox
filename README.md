# English-to-Bangla-Pronunciation-Firefox

Firefox ব্রাউজারে যে কোনো English text-এর উপর **`Ctrl` ধরে text select** করলে selection শেষ হওয়ার সাথে সাথে selected text-এর **ঠিক নিচে বাংলা phonetic pronunciation (উচ্চারণ)** দেখানোর একটি আধুনিক Firefox Extension (Manifest V3) এবং এর ব্যাকএন্ড সার্ভিস।

> **Suggested GitHub repository name:** `english-to-bangla-pronunciation-firefox`

> **লক্ষ্য:** এটি কোনো Translation (অনুবাদ) করে না, শুধুমাত্র English শব্দের খাঁটি বাংলা ধ্বনিভিত্তিক উচ্চারণ (Phonetic Pronunciation) প্রদর্শন করে।

---

## ✨ প্রধান বৈশিষ্ট্যসমূহ (Features)

- ⌨️ **Ctrl + Select ট্রিগার:** সাধারণ text selection-এ কোনো বিঘ্ন ঘটে না। শুধুমাত্র `Ctrl` কী চেপে ধরে মাউস দিয়ে text select করলেই উচ্চারণ দেখা যাবে।
- 📍 **স্মার্ট পজিশনিং:** `Range.getBoundingClientRect()` ব্যবহার করে selected text-এর ঠিক নিচে visually connected অবস্থায় রেজাল্ট দেখায়। নিচে পর্যাপ্ত জায়গা না থাকলে স্বয়ংক্রিয়ভাবে লেখার উপরে চলে আসে।
- 🧹 **অটো রিমুভ (Auto-dismiss):** পেজের অন্য কোথাও ক্লিক করলে, selection পরিবর্তন করলে বা <kbd>Escape</kbd> চাপলে উচ্চারণ রেজাল্ট তৎক্ষণাৎ সরে যায়।
- ⚡ **ব্রাউজার শর্টকাটের পূর্ণ নিরাপত্তা:** <kbd>Ctrl+C</kbd>, <kbd>Ctrl+A</kbd>, <kbd>Ctrl+F</kbd>, <kbd>Ctrl+V</kbd>, <kbd>Ctrl+Z</kbd>, <kbd>Ctrl+X</kbd> কোনো অবস্থাতেই ব্লক করা হয় না (`preventDefault()` ব্যবহার করা হয়নি)।
- 🚀 **ডুয়েল লেভেল ক্যাশিং (Cache):**
  - একবার যে শব্দের উচ্চারণ পাওয়া যাবে, তা ক্যাশ হয়; পরেরবার একই শব্দ select করলে দ্রুত ফলাফল আসে এবং API call কমে।
- 🛡️ **শ্যাডো ডম আইসোলেশন (Shadow DOM):** কোনো ওয়েবসাইটের নিজস্ব CSS যাতে এক্সটেনশনের ডিজাইনে কোনো প্রভাব না ফেলে, সেজন্য সম্পূর্ণ Shadow DOM ব্যবহার করা হয়েছে।
- 🤖 **Google Gemini API ইন্টিগ্রেশন:** নিজস্ব Node.js ব্যাকএন্ডের মাধ্যমে Gemini মডেলকে সুনির্দিষ্ট নির্দেশনার মাধ্যমে চালনা করা হয়।
- 📦 **অন্তর্নির্মিত অফলাইন ডিকশনারি (Built-in Dictionary):** API Key সেট না করা থাকলেও কমন টেকনিক্যাল শব্দগুলোর (যেমন: `Authentication`, `Vulnerability`, `Prototype Pollution`, ইত্যাদি) উচ্চারণ তাৎক্ষণিকভাবে অফলাইনে কাজ করে!

---

## 🏗️ আর্কিটেকচার (Architecture)

```text
Firefox Extension (content.js)
       ↓ (Runtime Messaging)
Firefox Background Script (background.js)
       ↓ (POST /api/pronunciation)
Node.js Express Backend (backend/server.js)
       ↓ (Strict System Prompt)
Google Gemini API
       ↓
Bengali Phonetic Pronunciation
```

---

## 📁 প্রজেক্ট স্ট্রাকচার (Project Structure)

```text
Firefox extension/
├── backend/                  # Node.js Express ব্যাকএন্ড সার্ভার
│   ├── .env.example          # কনফিগারেশন টেমপ্লেট; আসল .env Git-এ দেবেন না
│   ├── package.json          # ডিপেন্ডেন্সি ও স্ক্রিপ্ট
│   ├── server.js             # মূল ব্যাকএন্ড সার্ভার ও Gemini ইন্টিগ্রেশন
│   └── test.js               # স্বয়ংক্রিয় টেস্ট স্ক্রিপ্ট
├── icons/                    # এক্সটেনশনের আইকন (16x16, 48x48, 128x128, SVG)
│   ├── icon-16.png
│   ├── icon-48.png
│   ├── icon-128.png
│   └── icon.svg
├── manifest.json             # Firefox Manifest V3 কনফিগারেশন
├── package.json              # root-level start/test/build shortcuts
├── background.js             # ব্যাকগ্রাউন্ড সার্ভিস ও ক্রস-অরিজিন ফেচ
├── content.js                # Ctrl সিলেকশন ট্র্যাকিং ও শ্যাডো ডম ব্যাজ
├── content.css               # কনটেন্ট স্টাইলিং
├── options.html              # সেটিংস ও কুইক টেস্ট পপআপ UI
├── options.js                # পপআপ লজিক ও হেলথ চেক
├── test_demo.html            # সরাসরি টেস্ট করার জন্য ডেমো পেজ
├── Requerment.md             # মূল রিকোয়ারমেন্ট স্পেসিফিকেশন
├── PRIVACY.md                # AMO-র জন্য privacy policy draft (প্রকাশের আগে কাস্টমাইজ করুন)
├── README.md                 # ডকুমেন্টেশন ও সেটআপ গাইড
└── specs/                    # SDD specs, plans ও task tracking
```

---

## 🚀 সেটআপ ও ইনস্টলেশন গাইড (Setup & Installation)

### ১. ব্যাকএন্ড সার্ভার চালু করা (Backend Setup)

1. project root থেকে backend dependency ইনস্টল করুন:
   ```powershell
   npm --prefix backend install
   ```
2. `backend/.env.example` কপি করে `backend/.env` বানান। `.env` ফাইলটি Git-এ ignore করা আছে।
3. `.env` ফাইলে আপনার Gemini API Key বসান:
   - [Google AI Studio](https://aistudio.google.com/) থেকে বিনামূল্যে একটি API Key সংগ্রহ করুন।
   - `backend/.env` ফাইলটি এডিটর দিয়ে ওপেন করে `GEMINI_API_KEY=` এর পাশে আপনার কী পেস্ট করুন:
     ```env
     GEMINI_API_KEY=your_real_key_here
     PORT=3000
     GEMINI_MODEL=gemini-3.5-flash-lite
     ```
   *(নোট: API Key না দিলেও টেস্টের জন্য বিল্ট-ইন ডিকশনারির শব্দগুলো স্বাভাবিকভাবেই কাজ করবে।)*

4. project root থেকে backend test চালান:
   ```powershell
   npm test
   ```
5. project root থেকে backend server চালান:
   ```powershell
   npm start
   ```
   সার্ভার `http://localhost:3000`-এ রান হবে।

### Production backend deploy

AMO ব্যবহারকারীদের জন্য `localhost` backend কাজ করবে না। backend-কে HTTPS URL-সহ public host-এ deploy করতে হবে; Gemini key শুধু host-এর environment variable-এ রাখুন। উদাহরণস্বরূপ Render Web Service-এ repository connect করে **Root Directory** `backend`, **Build Command** `npm install`, **Start Command** `npm start` দিন এবং `GEMINI_API_KEY` / `GEMINI_MODEL` environment variables সেট করুন। Deploy শেষে host-এর URL extension settings-এ দিন। AMO-তে প্রকাশের আগে `background.js`-এর `DEFAULT_SETTINGS.backendUrl`-এ public endpoint বসিয়ে version বাড়িয়ে নতুন package build করুন.

Render Free service idle থাকলে sleep হয় এবং প্রথম request-এ প্রায় এক মিনিট জাগতে পারে; Render তাদের Free instance production application-এর জন্য সুপারিশ করে না। Public production ব্যবহারের আগে production-suitable hosting বেছে নিন এবং API usage/budget পর্যবেক্ষণ করুন. [Render free-plan limits](https://render.com/docs/free).

এই extension নির্বাচিত English text configured backend-এ পাঠায়; cache miss হলে backend সেটি Gemini API-তে পাঠায়। [PRIVACY.md](PRIVACY.md) একটি draft; AMO-তে দেওয়ার আগে backend operator/contact ও deployed data retention যাচাই করে public URL-এ প্রকাশ করুন।

Public traffic গ্রহণের আগে backend-এ abuse protection (প্রতি-IP rate limit, request quota/monitoring) যোগ করুন। বর্তমানে API endpoint unauthenticated; public URL পেলে অন্য কেউ আপনার Gemini quota ব্যবহার করতে পারে।

### GitHub-এ source প্রকাশ

GitHub repository-এর জন্য `english-to-bangla-pronunciation-firefox` নামটি প্রস্তাবিত। root folder-এ Git initialize করে GitHub-এর খালি repository-র URL বসিয়ে:

```powershell
git init
git add .
git status --short
git commit -m "Initial release"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/english-to-bangla-pronunciation-firefox.git
git push -u origin main
```

`git status --short` দেখে নিন—`backend/.env`, API key, বা generated `.xpi`/`.zip` যেন commit না হয়। এগুলো `.gitignore`-এ বাদ রাখা আছে।

---

### ২. পার্মানেন্ট (স্থায়ী) ব্যবহার ও Firefox Add-ons Store-এ আপলোড গাইড

Firefox ব্রাউজারের অফিসিয়াল সিকিউরিটি পলিসি অনুযায়ী, কোনো এক্সটেনশন স্থায়ীভাবে (Permanent) ইনস্টল করে ব্রাউজার রিস্টার্টের পরেও রাখতে হলে সেটি **Mozilla দ্বারা সাইন (Signed)** হতে হয় অথবা **Firefox Add-ons Store (AMO)**-এ আপলোড করতে হয়।

Build script ZIP ও XPI তৈরি করে; AMO validator-এ upload না করা পর্যন্ত package lint/review pass করেছে বলে ধরে নেবেন না।

#### ধাপ ১: প্রোডাকশন জিপ ফাইল তৈরি করা (Build Package)
টার্মিনালে কমান্ডটি রান করুন:
```powershell
npm run build
```
এটি `dist/` ফোল্ডারে আপনার সাইন করার উপযুক্ত প্যাকেজ তৈরি করবে:
- **`dist/bangla-phonetic-pronunciation-v1.0.1.zip`** (AMO-তে upload করুন)
- **`dist/bangla-phonetic-pronunciation-v1.0.1.xpi`**

---

#### ধাপ ২: Firefox Extension Store (AMO)-এ আপলোড করার নিয়ম

1. **Mozilla Developer Hub-এ যান:**
   - ব্রাউজারে প্রবেশ করুন: [https://addons.mozilla.org/developers/](https://addons.mozilla.org/developers/)
   - আপনার Firefox Account দিয়ে লগইন করুন (অ্যাকাউন্ট না থাকলে বিনামূল্যে সাইন আপ করুন)।

2. **নতুন অ্যাড-অন সাবমিট করুন:**
   - ড্যাশবোর্ডে গিয়ে **"Submit a New Add-on"** বাটনে ক্লিক করুন।
   - Developer Agreement পড়তে বলবে, Accept করুন।

3. **ডিস্ট্রিবিউশন অপশন সিলেক্ট করুন:**
   আপনাকে দুটি বিকল্প দেখাবে:
   - **Option A (স্টোরে সবার জন্য উন্মুক্ত): "On this site" (Listed)**
     - এটি সিলেক্ট করলে আপনার এক্সটেনশনটি অফিসিয়াল Firefox Add-on Store-এ সবার সার্চে আসবে এবং যে কেউ "Add to Firefox" বাটনে এক ক্লিকে স্থায়ীভাবে ইনস্টল করতে পারবে।
   - **Option B (শুধু নিজের ব্যক্তিগত পার্মানেন্ট ব্যবহারের জন্য): "On your own" (Unlisted)**
      - এটি সিলেক্ট করলে listing পাবলিক সার্চে আসবে না। Mozilla submission validate/sign করার পর signed `.xpi` পাওয়া যায়; সময় ও review requirement পরিবর্তিত হতে পারে।

4. **ফাইল আপলোড করুন:**
   - ফাইল চয়ন অপশনে গিয়ে আপনার কম্পিউটারের এই ফাইলটি সিলেক্ট করুন:
      `dist/bangla-phonetic-pronunciation-v1.0.1.zip`
    - AMO validator-এর ফলাফল দেখুন; error থাকলে submission-এর আগে সেগুলো ঠিক করুন।

5. **তথ্য ও বিবরণ পূরণ করুন:**
   - **Name:** Bangla Phonetic Pronunciation
   - **Summary:** Ctrl ধরে English text select করলে নিচে বাংলা phonetic উচ্চারণ দেখায়।
   - **Categories:** Language Support / Reading.
   - **Privacy Policy:** নির্বাচিত text configured backend/Gemini-তে পাঠানো হয়—এটি স্পষ্ট করে policy দিন। Extension pronunciation cache browser storage-এ রাখে; backend process cache-ও text/pronunciation memory-তে রাখে। আপনার hosted service-এর actual retention/Google processing অনুযায়ী policy লিখুন।

6. **সাবমিট করুন:**
   - **Submit Version** চাপুন।
   - আনলিস্টেড হলে কয়েক মিনিটের মধ্যেই ইমেইলে সাইন করা ডাউনলোড লিঙ্ক পেয়ে যাবেন। আর লিস্টেড হলে মজিলা রিভিউ টিম চেক করে স্টোরে লাইভ করে দেবে।

---

#### ৩. Firefox Developer Edition / Nightly ব্যবহারকারীদের জন্য ইনস্টলেশন (Without AMO):
নিজের development build পরীক্ষা করতে `about:debugging#/runtime/this-firefox` খুলে **Load Temporary Add-on...** বেছে `manifest.json` দিন। স্থায়ী install/update-এর জন্য AMO-তে signed package ব্যবহার করুন।

---

#### ৪. সাময়িকভাবে টেস্ট করার পদ্ধতি (Temporary Add-on):
ডেভেলপমেন্ট বা দ্রুত টেস্টের জন্য:
1. Firefox-এ যান: `about:debugging#/runtime/this-firefox`
2. **"Load Temporary Add-on..."** বাটনে ক্লিক করে `manifest.json` দিন।

---

## 🎮 ব্যবহার করার নিয়ম (How to Use)

### ডেমো পেজে পরীক্ষা (Recommended):
1. ফায়ারফক্সে প্রজেক্টের অন্তর্ভুক্ত `test_demo.html` ফাইলটি ওপেন করুন:
   - ফায়ারফক্সে <kbd>Ctrl + O</kbd> চাপুন এবং `test_demo.html` সিলেক্ট করুন।
2. কীবোর্ডের **`Ctrl`** কী চেপে ধরুন।
3. মাউস ড্র্যাগ করে যে কোনো শব্দ সিলেক্ট করুন (যেমন: `Authentication`)।
4. মাউস রিলিজ করুন।
5. সাথে সাথে শব্দের নিচে সুন্দর ব্যাজে বাংলা উচ্চারণ প্রদর্শিত হবে:
   ```text
   Authentication
        ↓
   অথেন্টিকেশন
   ```
6. অন্য কোথাও ক্লিক করুন বা <kbd>Escape</kbd> চাপুন — উচ্চারণ সরে যাবে!

### সাধারণ সিলেকশন বনাম Ctrl সিলেকশন:
- **শুধু মাউস দিয়ে Select করলে:** কোনো পপআপ বা উচ্চারণ আসবে না (স্বাভাবিক ব্রাউজিং অক্ষুণ্ণ থাকবে)।
- **`Ctrl` ধরে Select করলে:** সাথে সাথে বাংলা উচ্চারণ দেখা যাবে।
- **<kbd>Ctrl+C</kbd> চাপলে:** স্বাভাবিকভাবেই টেক্সট কপি হবে, এক্সটেনশন কোনো বাধা দেবে না।

---

## ⚙️ সেটিংস ও টুলবার পপআপ (Toolbar Popup)

টুলবারে থাকা এক্সটেনশন আইকনে ক্লিক করলে একটি সেটিংস প্যানেল পাওয়া যাবে:
- **Backend Server Status:** সার্ভার সচল আছে কিনা এবং API Key কনফিগার করা আছে কিনা তা রিয়েল-টাইমে দেখতে পারবেন।
- **Quick Test:** এক্সটেনশন পপআপের ভেতরেই যে কোনো ইংরেজি শব্দ লিখে টেস্ট করতে পারবেন।
- **Clear Cache:** ক্যাশ করা পূর্ববর্তী উচ্চারণসমূহ মুছে ফেলতে পারবেন।
- **Backend URL Config:** প্রয়োজনে ব্যাকএন্ড পোর্ট বা হোস্ট পরিবর্তন করতে পারবেন।

---

## 🧪 ব্যাকএন্ড API এন্ডপয়েন্ট

### `POST /api/pronunciation`
- **Request Body:**
  ```json
  {
    "text": "Prototype Pollution"
  }
  ```
- **Response:**
  ```json
  {
    "pronunciation": "প্রোটোটাইপ পলিউশন",
    "source": "cache"
  }
  ```

### `GET /api/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "hasApiKey": true,
      "model": "gemini-3.5-flash-lite",
    "cachedEntries": 46
  }
  ```

---

## 💡 Gemini প্রম্পট গাইডলাইন (Strict Prompting)

ব্যাকএন্ডে জেমিনি মডেলকে কঠোর নিয়মে আবদ্ধ করা হয়েছে যাতে কোনো অতিরিক্ত ইংরেজি বা ব্যাখ্যা না আসে:
```text
Act as an English-to-Bengali phonetic pronunciation assistant.

Convert the given English word or phrase into Bengali script based ONLY on how it is pronounced.

Do NOT translate the meaning.

Do NOT explain anything.

Do NOT provide IPA.

Do NOT return English text.

Return ONLY the Bengali phonetic pronunciation.
```

---

## ❓ সাধারণ জিজ্ঞাসা ও সমাধান (Troubleshooting)

1. **"⚠️ Backend offline (run: npm start)" দেখাচ্ছে:**
   - Local development হলে project root-এ `npm start` চালিয়ে `http://localhost:3000` দেখুন। Published extension-এর জন্য public HTTPS backend URL ব্যবহার করতে হবে।
2. **"⚠️ Set GEMINI_API_KEY in backend/.env" দেখাচ্ছে:**
   - আনকমন কোনো শব্দের জন্য জেমিনি API কী প্রয়োজন। `backend/.env` ফাইলে আপনার বৈধ `GEMINI_API_KEY` প্রদান করে সার্ভার রিস্টার্ট করুন।
   - কমন টেকনিক্যাল শব্দগুলোর ক্ষেত্রে কী ছাড়াও বিল্ট-ইন ডিকশনারি কাজ করে।
3. **শর্টকাট কাজ করছে না?**
   - কোনো শর্টকাট ব্লক হয় না। <kbd>Ctrl+C</kbd>, <kbd>Ctrl+V</kbd>, <kbd>Ctrl+A</kbd> সব স্বাভাবিকভাবেই ব্রাউজারে কাজ করে।
