# PromptForge

أداة احترافية لتحويل البرومبتات إلى صيغة مثالية لـ ChatGPT / Claude / Gemini.

## 🚀 ابدأ هنا
- **النشر على Vercel + Render:** اقرأ [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **التشغيل محليًا:** اقرأ القسم أدناه

## التشغيل محليًا

### Backend
```bash
cd backend
bash build.sh                            # ينصّب كل شيء
cp .env.example .env                     # ضع EMERGENT_LLM_KEY الخاص بك
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
yarn install
cp .env.example .env
yarn start
```

## المميزات
- اختيار النموذج المستهدف (ChatGPT / Claude / Gemini)
- كشف لغة المستخدم تلقائيًا والتفاعل بنفس لغته
- تأكيد المعنى قبل التوليد
- اختيار لغة البرومبت النهائي (English أو لغة المستخدم)
- صياغة مثالية لكل نموذج (Markdown / XML / Hierarchical)
- واجهة EN/AR مع دعم RTL
- نظيف بدون أي علامات مائية أو سكربتات تتبع

## الهيكل
```
promptforge-pkg/
├── DEPLOYMENT.md            دليل النشر التفصيلي
├── .gitignore
├── backend/                 FastAPI — للنشر على Render
│   ├── server.py
│   ├── requirements.txt
│   ├── build.sh
│   ├── Procfile
│   ├── render.yaml
│   ├── runtime.txt
│   └── .env.example
└── frontend/                React — للنشر على Vercel
    ├── package.json
    ├── vercel.json
    ├── craco.config.js
    ├── tailwind.config.js
    └── src/
```

## الترخيص
حر للاستخدام الشخصي والتجاري.
