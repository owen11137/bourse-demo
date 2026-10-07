# bourse-demo

نمونه Full Stack برای تحلیل تصویر داشبوردهای مالی با OpenAI و ذخیره نتیجه در H2.

## Backend
نیازمندی: Java 21 و Maven.

در Windows PowerShell:
```powershell
$env:OPENAI_API_KEY="YOUR_KEY"
cd backend
mvn spring-boot:run
```

API روی `http://localhost:8080` اجرا می‌شود. H2 Console:
`http://localhost:8080/h2-console`

JDBC URL:
`jdbc:h2:file:./data/bourse-demo`

User: `sa` و Password خالی است.

## Frontend
```bash
cd frontend
npm install
npm run dev
```

UI روی `http://localhost:5173` اجرا می‌شود.

## API
- POST `/api/v1/analyses` با multipart field به نام `image`
- GET `/api/v1/analyses`
- GET `/api/v1/analyses/{id}`
- DELETE `/api/v1/analyses/{id}`

کلید OpenAI داخل Git ذخیره نشود؛ فقط از environment variable استفاده کنید.
