# Quy chuẩn Thiết kế và Phát triển API (API Conventions)

## 1. 🏗️ Kiến trúc tổng thể

Project sử dụng Layered Architecture với nguyên tắc:

```text
Component / UI
      ↓
Client API
      ↓
API Server / Route Handler
      ↓
Controller
      ↓
Service
      ↓
Repository
      ↓
Supabase Database
```

### Nguyên tắc quan trọng nhất

> **Chỉ Repository được phép truy vấn Supabase Database.**

Các layer còn lại:

```text
Client API     → ❌ Không query Supabase
API Server     → ❌ Không query Supabase
Controller     → ❌ Không query Supabase
Service        → ❌ Không query Supabase
Repository     → ✅ Query Supabase
```

---

# 2. 📁 Quy tắc Database Access

Mọi thao tác liên quan đến Database phải được thực hiện thông qua Repository.

Ví dụ cần lấy thông tin Plan:

### ❌ Không được viết ở Controller

```typescript
const { data, error } = await supabase
  .from("plans")
  .select("*");
```

### ❌ Không được viết ở Service

```typescript
const { data, error } = await supabase
  .from("plans")
  .select("*");
```

### ❌ Không được viết ở API Server

```typescript
export async function GET() {
  const { data } = await supabase
    .from("plans")
    .select("*");
}
```

### ❌ Không được viết ở Client API

```typescript
const { data } = await supabase
  .from("plans")
  .select("*");
```

### ✅ Phải tạo function trong Repository

```typescript
export const getAllPlansRepository = async (): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*");

  if (error) {
    throw error;
  }

  return data as Plan[];
};
```

Sau đó:

```text
Controller
    ↓
Service
    ↓
getAllPlansRepository()
    ↓
Supabase
```

---

# 3. 📦 Repository

Repository là **layer duy nhất được phép truy cập Supabase**.

### Repository chịu trách nhiệm

* `SELECT`
* `INSERT`
* `UPDATE`
* `DELETE`
* Supabase `.from()`
* Supabase `.select()`
* Supabase `.insert()`
* Supabase `.update()`
* Supabase `.delete()`
* Supabase `.rpc()`
* Database query.
* Database mapping.

Ví dụ:

```typescript
export const getPlanByIdRepository = async (
  planId: number
): Promise<Plan | null> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (error) {
    throw error;
  }

  return data as Plan;
};
```

---

# 4. ⚙️ Service

Service **không được truy vấn Database**.

Service chỉ có nhiệm vụ:

> **Gọi function tương ứng bên Repository.**

Ví dụ cần lấy Plan:

```typescript
import { getPlanByIdRepository } from "../repository/plan.repository";

export const getPlanByIdService = async (
  planId: number
): Promise<Plan | null> => {
  return await getPlanByIdRepository(planId);
};
```

Service không được:

```typescript
// ❌ Không được
const { data } = await supabase
  .from("plans")
  .select("*");
```

Service cũng không được tự tạo query thông qua một Repository khác.

Ví dụ:

```typescript
// ❌ Không nên
const plan = await getPlanByIdRepository(planId);

if (!plan) {
  throw new Error("Plan not found");
}

const company = await getCompanyByIdRepository(companyId);

if (!company) {
  throw new Error("Company not found");
}
```

Các bước kiểm tra này thuộc Controller.

Service chỉ gọi function Repository cần thiết theo convention của project.

---

# 5. 🎯 Controller

Controller là nơi thực hiện:

* Validation.
* Required field checking.
* Type checking.
* Format checking.
* Input constraints.
* Data checking.
* Condition checking.
* Quyết định cần gọi Service nào.
* Gọi Service.

Controller **không được truy cập Supabase**.

### Ví dụ

Giả sử cần tạo Subscription và phải kiểm tra Plan trước.

Repository:

```typescript
export const getPlanByIdRepository = async (
  planId: number
): Promise<Plan | null> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (error) {
    throw error;
  }

  return data as Plan;
};
```

Service:

```typescript
export const getPlanByIdService = async (
  planId: number
): Promise<Plan | null> => {
  return await getPlanByIdRepository(planId);
};
```

Controller:

```typescript
export const createSubscriptionController = async (
  data: CreateSubscriptionRequest
): Promise<Subscription> => {
  if (!data.planId) {
    throw new Error("Plan ID is required");
  }

  const plan = await getPlanByIdService(data.planId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  return await createSubscriptionService(data);
};
```

Ở đây:

```text
Repository
    ↓
Truy vấn Supabase

Service
    ↓
Chỉ gọi Repository

Controller
    ↓
Validate + Check + quyết định gọi Service
```

---

# 6. 🌐 API Server / Route Handler

API Server chỉ xử lý HTTP.

Ví dụ:

```typescript
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const result = await createSubscriptionController(data);

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
```

API Server **không được**:

```typescript
// ❌ Không được query Supabase
const { data } = await supabase
  .from("subscriptions")
  .insert(...);
```

API Server chỉ:

```text
HTTP Request
    ↓
Parse Request
    ↓
Controller
    ↓
HTTP Response
```

---

# 7. 💻 Client API

Client API cũng **không được truy cập Supabase Database**.

Client API chỉ sử dụng native `fetch()` để gọi API Server.

```typescript
export const requestCreateSubscription = async (
  data: CreateSubscriptionRequest
): Promise<Subscription> => {
  const response = await fetch("/api/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create subscription");
  }

  return response.json();
};
```

Flow:

```text
Component
    ↓
requestCreateSubscription()
    ↓
fetch()
    ↓
API Server
```

---

# 8. 🔄 Khi cần thêm một Database Query

Đây là quy trình bắt buộc.

Giả sử Controller cần kiểm tra:

```text
"User này có tồn tại không?"
```

### Bước 1 — Tạo Repository function

```typescript
export const getUserByIdRepository = async (
  userId: string
): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data as User;
};
```

### Bước 2 — Tạo Service function

```typescript
export const getUserByIdService = async (
  userId: string
): Promise<User | null> => {
  return await getUserByIdRepository(userId);
};
```

### Bước 3 — Controller gọi Service

```typescript
const user = await getUserByIdService(userId);

if (!user) {
  throw new Error("User not found");
}
```

### Tuyệt đối không làm

```text
Controller
    ↓
❌ Supabase query
```

hoặc:

```text
Service
    ↓
❌ Supabase query
```

Mà luôn:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Supabase
```

---

# 9. 🔤 Naming Convention

| Layer      | Function                                           |
| ---------- | -------------------------------------------------- |
| Client API | `requestSignUp()`                                  |
| API Server | HTTP method `GET()`, `POST()`, `PUT()`, `DELETE()` |
| Controller | `signUpController()`                               |
| Service    | `signUpService()`                                  |
| Repository | `signUpRepository()`                               |

Ví dụ:

```text
requestSignUp()
      ↓
POST /api/auth/signup
      ↓
signUpController()
      ↓
signUpService()
      ↓
signUpRepository()
      ↓
Supabase
```

---

# 10. 🚨 Quy tắc Exception

### Repository

Database error → `throw`.

```typescript
if (error) {
  throw error;
}
```

### Service

Không cần `try/catch`.

```typescript
return await signUpRepository(data);
```

### Controller

Validation/check thất bại → throw exception.

```typescript
if (!data.email) {
  throw new Error("Email is required");
}
```

### API Server

Là nơi xử lý exception cuối cùng và chuyển thành HTTP Response.

---

# 11. 🧠 Quy tắc cốt lõi của từng Layer

```text
┌──────────────────────────────────┐
│ Component                        │
│ UI / User Interaction            │
└────────────────┬─────────────────┘
                 ↓
┌──────────────────────────────────┐
│ Client API                       │
│ fetch()                          │
│ ❌ Supabase                      │
└────────────────┬─────────────────┘
                 ↓
┌──────────────────────────────────┐
│ API Server / Route               │
│ HTTP Request / Response          │
│ ❌ Supabase                      │
└────────────────┬─────────────────┘
                 ↓
┌──────────────────────────────────┐
│ Controller                       │
│ Validation / Check / Processing  │
│ ❌ Supabase                      │
└────────────────┬─────────────────┘
                 ↓
┌──────────────────────────────────┐
│ Service                          │
│ ONLY call Repository             │
│ ❌ Supabase                      │
│ ❌ Validation                    │
│ ❌ Data Check                    │
│ ❌ Business Processing            │
└────────────────┬─────────────────┘
                 ↓
┌──────────────────────────────────┐
│ Repository                       │
│ Supabase / Database Query        │
│ ✅ ONLY layer accessing DB       │
└────────────────┬─────────────────┘
                 ↓
┌──────────────────────────────────┐
│ Supabase Database                │
└──────────────────────────────────┘
```

# ⭐ Quy tắc vàng

> **Nếu cần truy vấn Supabase → tạo function ở Repository.**

> **Nếu cần gọi function Repository → tạo/cập nhật Service để gọi Repository đó.**

> **Nếu cần validate/check/process data → thực hiện ở Controller.**

> **Service không làm gì ngoài việc gọi Repository.**

> **API Server và Client API không được truy vấn Supabase.**

Tóm tắt:

```text
Query Database
      ↓
Repository

Call Repository
      ↓
Service

Validate / Check / Process
      ↓
Controller

HTTP
      ↓
API Server

fetch()
      ↓
Client API
```

Đây là convention bắt buộc áp dụng thống nhất cho toàn bộ feature trong project.
