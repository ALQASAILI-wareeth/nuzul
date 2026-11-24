# استوديو نُزُل — أدوات صناعة الفيديو والصور

هذا المجلد يحفظ طريقة إنتاج فيديوهات نُزُل العمودية (1080×1920، 30 إطار، 16 ثانية) وصور الانطلاق وأغلفة الحسابات، عشان أي جلسة جديدة تقدر تطلعها بنفس الهوية. المجلد مستثنى من الموقع (راجع `_config.yml`)، ولا يحتوي ملفات فيديو أو موسيقى؛ تنزل من مصادرها الأصلية.

## التشغيل

```bash
bash studio/setup.sh          # ينسخ السكربتات والخطوط وينزّل اللقطات والموسيقى
python3 /home/claude/scripts/overlays.py   # الشعار والنصوص والشاشة الختامية
python3 /home/claude/scripts/sync.py       # يختار مقطع الموسيقى ويضبط القصّات على الإيقاع
python3 /home/claude/scripts/mix.py        # يجهّز الصوت على ‎-14 LUFS
python3 /home/claude/scripts/render.py     # يرندر الفيديوهات إلى /home/claude/out/music
```

## الملفات

| الملف | وظيفته |
| --- | --- |
| `scripts/videos.json` | محتوى كل فيديو: الافتتاحية، والدعوة، و6 لقطات (المصدر، نقطة البداية، الإطار، العنوان، الوصف) |
| `scripts/overlays.py` | يرسم الشعار (بيت تركوازي/أزرق/برتقالي) والنصوص العربية بخط Tajawal، والشاشة الختامية مع nuzultravel.com |
| `scripts/sync.py` | يحدد مقطع الموسيقى لكل فيديو (`PICK`) ويضبط القصّات على الإيقاع |
| `scripts/mix.py` | يقص الموسيقى ويضبط مستوى الصوت |
| `scripts/render.py` | يرندر المشاهد مع انتقال ناعم 0.25 ث، وشاشة ختامية قصيرة ~2.2–2.7 ث |
| `graphics/launch.html` | قالب صور الانطلاق الأربع (`media/nuzul_launch_*.png`) |
| `graphics/cover.html` | قالب الأغلفة العريضة: إكس 1500×500، فيسبوك 1640×624، يوتيوب 2560×1440 |
| `graphics/snap_cover.html` | قالب غلاف سناب شات 1000×1500 |
| `graphics/shot.js` | يصوّر القوالب إلى PNG عبر Chrome |
| `graphics/nuzul_avatar.png` | شعار نُزُل الدائري المستخدم داخل صور الانطلاق |
| `scripts/og_text.py` | يعيد كتابة نص صورة المشاركة `og.png` |
| `footage_sources.txt` | روابط اللقطات (Pexels / Pixabay) |
| `music_sources.txt` | مسارات الموسيقى على cdn.pixabay.com/audio |
| `fonts/` | خط Tajawal (رخصة SIL Open Font) |

## تعديل النص المعتمد

**الفيديوهات** (الشاشة الختامية أو عناوين اللقطات): عدّل `videos.json` (والسطر الثاني للشاشة الختامية في `overlays.py`)، ثم شغّل `overlays.py` و `render.py`. الصوت ما يتغيّر ما دام `sync.json` كما هو، فلا حاجة لـ `sync.py` و `mix.py`.

**صور الانطلاق والأغلفة**: عدّل النص داخل القالب، ثم صوّره:

- `graphics/launch.html`: المتغيرات `head` و `sub` و `ul` في السكربت أسفل الملف.
- `graphics/cover.html`: المتغير `TAG` (السطر تحت اسم نُزُل).
- `graphics/snap_cover.html`: السطر `<div class="s">`.

```bash
node studio/graphics/shot.js launch media      # صور الانطلاق الأربع إلى media/
node studio/graphics/shot.js covers <مجلد>     # الأغلفة الأربعة (ما تُحفظ في المستودع)
```

يحتاج `puppeteer-core` (`npm i puppeteer-core` أو المتغير `PUPPETEER`) ومتصفح Chrome (المتغير `CHROME` إذا مساره غير `/usr/bin/google-chrome`). القالب هو مصدر صور الانطلاق الأصلي: بالعنوان القديم يطلع نفس صور commit `fbded98` بالبكسل.

السطر المعتمد في الأغلفة والنبذات: «قارن مواقع حجز الفنادق من مكان واحد». ما نكتب «أفضل سعر» ولا «أرخص»؛ `tests/wording.js` يفحص القوالب.

## فيديو جديد

1. أضف اللقطات الجديدة إلى `footage_sources.txt` (اسم ← رابط) وشغّل `setup.sh`.
2. أضف عنصراً في `videos.json` بنفس الشكل.
3. أضف مقطع موسيقى هادئ مناسب للموسم إلى `music_sources.txt`، واربطه بالفيديو في `PICK` داخل `sync.py`.
4. شغّل الخطوات أعلاه.

## الهوية

- الألوان: تركوازي `#00C2D1`، أزرق `#0062A8`، برتقالي `#FFB238`، نص أبيض عريض.
- الموسيقى: هادئة دائماً، وتتغيّر الآلات حسب الموسم (راجع تقويم نُزُل الموسمي).
- كل الموسيقى من Pixabay وغير مسجّلة في Content ID.
