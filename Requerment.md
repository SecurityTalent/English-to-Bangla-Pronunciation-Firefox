# Firefox Extension — Ctrl + Select → Selected Text-এর নিচে বাংলা উচ্চারণ

## মূল কাজ

Firefox-এ কোনো English text-এর উপর **Ctrl ধরে text select** করলে selection শেষ হওয়ার পর selected text-এর **ঠিক নিচে বাংলা phonetic pronunciation** দেখাতে হবে।

এটি translation করবে না।

### উদাহরণ

```text
Authentication
      ↓
অথেন্টিকেশন
```

```text
Vulnerability
      ↓
ভালনারেবিলিটি
```

```text
Prototype Pollution
      ↓
প্রোটোটাইপ পলিউশন
```

---

## Selection Rule

শুধু তখনই কাজ করবে যখন:

```text
Ctrl + Text Selection
```

ব্যবহার করা হয়েছে।

### Normal Selection

```text
English Text Select
        ↓
কিছুই হবে না
```

### Ctrl Selection

```text
Ctrl ধরে English Text Select
        ↓
Mouse Release
        ↓
Selected Text-এর নিচে বাংলা pronunciation
```

---

## Result Position

Result কোনো floating popup হিসেবে তৈরি করা যাবে না।

Selected text-এর `Range.getBoundingClientRect()` ব্যবহার করে result-এর position বের করতে হবে।

Result:

* selected text-এর নিচে থাকবে
* screen-এর নিচে জায়গা না থাকলে প্রয়োজনে selected text-এর উপরে দেখানো যাবে
* selected text-এর সাথে visually connected মনে হবে

Example:

```text
This is Authentication in web security.

             Authentication
                  ↓
             অথেন্টিকেশন
```

---

## Result Remove Rule

Result permanent থাকবে না।

যখন:

* user selection remove করবে
* অন্য text select করবে
* page-এর অন্য জায়গায় click করবে
* `Escape` চাপবে

তখন pronunciation result remove করতে হবে।

অর্থাৎ:

```text
Ctrl + Select
      ↓
Pronunciation দেখাবে
      ↓
Selection শেষ
      ↓
Result থাকবে

Selection/Deselect
      ↓
Result চলে যাবে
```

---

## Ctrl Detection

শুধু `selectionchange` event-এর উপর নির্ভর করা যাবে না।

কারণ user mouse release করার আগে বা পরে Ctrl ছেড়ে দিতে পারে।

তাই:

```javascript
let ctrlWasPressedDuringSelection = false;

document.addEventListener("keydown", (event) => {
    if (event.key === "Control") {
        ctrlWasPressedDuringSelection = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Control") {
        // Selection চলমান থাকলে state immediately reset করা যাবে না
    }
});
```

Selection শেষ হওয়ার সময় verify করতে হবে যে selection তৈরির সময় Ctrl pressed ছিল।

প্রয়োজনে `mousedown`, `mousemove`, `mouseup`, `keydown`, `keyup` state ব্যবহার করে reliable selection tracking তৈরি করতে হবে।

---

## Selected Text

Use:

```javascript
const selection = window.getSelection();
const text = selection.toString().trim();
```

Empty selection হলে কোনো API request করা যাবে না।

Maximum:

```text
500 characters
```

এর বেশি হলে request করা যাবে না।

---

## Position

Selected text-এর location:

```javascript
const range = selection.getRangeAt(0);
const rect = range.getBoundingClientRect();
```

Result position:

```javascript
top = rect.bottom + window.scrollY + smallGap
left = rect.left + window.scrollX
```

Viewport-এর বাইরে চলে গেলে position automatically adjust করতে হবে।

---

## API Flow

Extension সরাসরি Gemini API call করবে না।

Architecture:

```text
Firefox Extension
       ↓
Own Backend API
       ↓
Gemini API
       ↓
Backend
       ↓
Firefox Extension
       ↓
Selected Text-এর নিচে Result
```

Backend endpoint:

```http
POST /api/pronunciation
```

Request:

```json
{
  "text": "Authentication"
}
```

Response:

```json
{
  "pronunciation": "অথেন্টিকেশন"
}
```

---

## Gemini Instruction

Gemini-কে strictly বলতে হবে:

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

## Important Browser Shortcut Rule

Extension কোনো browser shortcut block করবে না।

বিশেষ করে:

```text
Ctrl+C
Ctrl+A
Ctrl+F
Ctrl+V
Ctrl+Z
Ctrl+X
```

এগুলোর জন্য `preventDefault()` ব্যবহার করা যাবে না।

Extension-এর কাজ শুধু selected text detect করা।

---

## Duplicate Request Prevention

একই selection-এর জন্য multiple API request পাঠানো যাবে না।

ব্যবহার করতে হবে:

* 120ms debounce for faster response while avoiding duplicate selection requests
* request lock
* duplicate text detection

---

## Cache

আগে কোনো word/phrase-এর pronunciation পাওয়া থাকলে আবার API call না করে cache থেকে result দেখাতে হবে।

Example:

```text
Authentication
      ↓
প্রথমবার → API → অথেন্টিকেশন → Cache

দ্বিতীয়বার
      ↓
Cache → অথেন্টিকেশন
```

এতে API usage কমবে।

---

## UI

Result খুব simple হবে।

শুধু:

```text
অথেন্টিকেশন
```

Selected text-এর নিচে দেখাবে।

কোনো:

* popup window
* Copy button
* Listen button
* Close button
* right-click menu

থাকবে না।

---

## Final User Experience

```text
User:

Ctrl ধরে
      ↓
"Authentication" select করে
      ↓
Mouse release
      ↓

Authentication
অথেন্টিকেশন

      ↓

User অন্য জায়গায় click/deselect করে
      ↓

অথেন্টিকেশন result disappear
```

মূল লক্ষ্য হলো **selection-এর সাথে temporary inline pronunciation result দেখানো**, আলাদা popup UI তৈরি না করা।
