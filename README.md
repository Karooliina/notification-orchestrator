# Notification Orchestrator

- Table of Contents:

* [Description](#description)
* [Architecture Overview](#architecture-overview)
* [API documentation](#api-documentation)
* [How to run?](#how-to-run)
* [How to run tests?](#how-to-run-tests)
* [DynamoDB Tables Structure & Access Patterns](#️-dynamodb-tables-structure--access-patterns)
* [Key Design Rationale](#-key-design-rationale)
* [System Assumptions & Dependencies](#system-assumptions--dependencies)

## Description

Another microservcie written in Node.js, to orchestrate notifications using DynamoDB database.

## Architecture Overview

### **🏗️ Layered Architecture Pattern**

The project follows **3-layer architecture**:

1. **🌐 Presentation Layer** (`api/v1/controller/`)
   - HTTP request/response handling
   - Input validation using Zod schemas
   - Route definitions for notifications and user preferences

2. **💼 Business Logic Layer** (`service/`)
   - **NotificationEventService**: Core decision engine that determines whether to send notifications based on user preferences and DND settings
   - **UserPreferencesService**: Manages user notification and DND preferences

3. **💾 Data Access Layer** (`repository/`)
   - Abstracts DynamoDB operations
   - Handles user DND settings and notification preferences
   - Uses AWS SDK v3 for DynamoDB interactions

### **🗄️ Database Design**

- **DynamoDB Tables**:
  - `UserDND`: Do Not Disturb settings with time-based queries
  - `UserNotificationSettings`: Per-user notification channel preferences

- **🔐 Security**: JWT-based authentication with user authorization checks

## API documentation:

Swagger documentation available on http://localhost:4002/api/v1/docs

## How to run?

### Node version

`v24.4.0`

### Install dependecies

Copy repo and run `npm i` command

### Provide .env file

Based on `.env.example` create `.env` file with correct enviroment variables

### Setup AWS CLI locally

You need to have AWS Cli configured. Follow [this instruction](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

Then run `aws configure`. Use local for region. Save all needed credentials in .env file.

### Start docker container

When you're ready, start your application by running:
`docker compose up -d`.

Your application will be available at http://localhost:4002.

### Generate Authorization token

To perform authorized requests, run `npm run generate-token` command. Use saved token in `Authorization: Bearer ...` header.

## How to run tests?

Generate Auth token with user test id for integration tests. Save it in .env file (`TEST_JWT_TOKEN`, `TEST_USER_ID`).
Setup dynamoDb test container with command `npm run test:integration:setup`
then run `npm run test` to start vitest.

Integration tests are located in `src/__test__`.
Unit tests are next to tested functions.

## 🗄️ DynamoDB Tables Structure & Access Patterns

### **1. UserDND Table**

_Do Not Disturb Settings_

#### **🔑 Key Design**

```
Primary Key:
├── Partition Key (HASH): userId (String)
└── Sort Key (RANGE): dndId (String) - UUID

Global Secondary Index: UserDayTimeIndex
├── Partition Key (HASH): userId (String)
└── Sort Key (RANGE): dayTimeSk (String) - Format: "{day}#{start_time}#{end_time}"
```

#### **📊 Data Structure**

```json
{
  "userId": "user123",
  "dndId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Work Hours DND",
  "day": 1,
  "dayTimeSk": "1#09:00#17:00",
  "start_time": "09:00",
  "end_time": "17:00",
  "all_day": false,
  "createdAt": "2024-01-01T09:00:00Z",
  "updatedAt": "2024-01-01T09:00:00Z"
}
```

#### **🔍 Access Patterns**

| Pattern              | Method                       | Key Used                                                                                       | Use Case                                          |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Get All User DND** | `getAllUserDNDSettings()`    | PK: `userId`                                                                                   | Retrieve all DND settings for user preferences UI |
| **Check Active DND** | `getUserActiveDNDSettings()` | GSI: `userId` + `begins_with(dayTimeSk, day)` + Filter: `time BETWEEN start_time AND end_time` | Real-time notification decision making            |
| **Create DND**       | `setUserDNDSettings()`       | PK: `userId` + `dndId`                                                                         | User creates new DND period                       |
| **Update DND**       | `updateUserDNDSettings()`    | PK: `userId` + `dndId`                                                                         | User modifies existing DND settings               |

---

### **2. UserNotification Table**

_User Notification Channel Preferences_

#### **🔑 Key Design**

```
Primary Key:
├── Partition Key (HASH): userId (String)
└── Sort Key (RANGE): notificationType (String) - e.g., "order_shipped", "payment_failed"
```

#### **📊 Data Structure**

```json
{
  "userId": "user123",
  "notificationType": "order_shipped",
  "enabled": true,
  "channels": ["email", "push", "sms"],
  "createdAt": "2024-01-01T09:00:00Z",
  "updatedAt": "2024-01-01T09:00:00Z"
}
```

#### **🔍 Access Patterns**

| Pattern                 | Method                                 | Key Used                              | Use Case                                       |
| ----------------------- | -------------------------------------- | ------------------------------------- | ---------------------------------------------- |
| **Get All Preferences** | `getAllUserNotificationsSettings()`    | PK: `userId`                          | Load user's complete notification preferences  |
| **Get Specific Type**   | `getUserNotificationsSettingsByType()` | PK: `userId` + SK: `notificationType` | Check if user wants specific notification type |
| **Create Preference**   | `setUserNotificationsSettings()`       | PK: `userId` + SK: `notificationType` | User sets notification preferences             |
| **Update Preference**   | `updateUserNotificationsSettings()`    | PK: `userId` + SK: `notificationType` | User modifies existing preferences             |

---

## 🚀 **Key Design Rationale**

### **UserDND Table Design Strategy**

- **Primary Key** enables efficient per-user DND management
- **GSI `UserDayTimeIndex`** optimizes the critical **real-time lookup pattern**:
  ```typescript
  // Real-time notification processing
  const userDND = await getUserActiveDNDSettings(userId, currentDay, currentTime);
  ```
- **`dayTimeSk` Composite Key** (`day#start_time#end_time`) enables:
  - Range queries by day using `begins_with()`
  - Time-based filtering for active periods
  - Efficient retrieval without scanning all DND records

### **UserNotification Table Design Strategy**

- **Simple Composite Primary Key** supports both access patterns efficiently
- **No GSI needed** - all queries are by `userId` or `userId + notificationType`
- **Notification type as Sort Key** enables:
  - Getting all user preferences in one query
  - Direct lookup for specific notification types during processing

## System Assumptions & Dependencies

### **🔐 Authentication & Authorization**

- **JWT Token Requirements**: All API requests must include a valid JWT token in the `Authorization: Bearer <token>` header
- **Service-to-Service Authentication**: Upstream producer services are responsible for token validation and user context propagation
- **User Authorization**: The service validates that authenticated users can only modify their own preferences via `userId` parameter validation

### **📅 DND Configuration Design**

- **Day-Specific Settings**: Do Not Disturb preferences are configured per weekday (0-6), requiring separate API calls for multi-day configurations
- **Client Responsibility**: Frontend applications must decompose multi-day DND selections into individual `DNDSetting` objects as per the API schema
- **Time Format**: All time values use 24-hour format (HH:MM) in the user's local timezone

### **⚡ Performance & Scalability**

- **Upstream Rate Limiting**: Notification event ingestion is rate-limited at the producer service level via message queue throttling
- **Client-Side Debouncing**: User preference updates are debounced on the client side, eliminating the need for API-level rate limiting in the current implementation
- **Auto-Scaling Strategy**: Production deployments assume AWS auto-scaling groups and load balancers for horizontal scaling based on CPU/memory metrics
