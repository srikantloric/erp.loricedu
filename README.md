# erp.loricedu
ERP Loric EDU

src/
 ├── app/
 │    ├── App.tsx
 │    ├── index.tsx
 │    └── providers/
 │         ├── ReactQueryProvider.tsx
 │         ├── ThemeProvider.tsx
 │         └── AuthProvider.tsx
 │
 ├── config/
 │    ├── firebase.config.ts
 │    └── app.config.ts
 │
 ├── routing/
 │    ├── RootRouter.tsx
 │    ├── ProtectedRoute.tsx
 │    └── modules.routes.ts
 │
 ├── modules/
 │    ├── fees/
 │    │     ├── pages/
 │    │     │     ├── FeeCollectionPage.tsx
 │    │     │     ├── FeeReceiptPage.tsx
 │    │     │     └── FeeReportsPage.tsx
 │    │     │
 │    │     ├── components/
 │    │     │     ├── InstallmentSelector/
 │    │     │     │     ├── InstallmentSelector.tsx
 │    │     │     │     └── index.ts
 │    │     │     ├── FeeSummaryCard/
 │    │     │     ├── FeeHeaderEditor/
 │    │     │     └── FeeHeaderTable/
 │    │     │
 │    │     ├── services/
 │    │     │     ├── fee.service.ts
 │    │     │     ├── installment.service.ts
 │    │     │     └── feeCollection.service.ts
 │    │     │
 │    │     ├── hooks/
 │    │     │     ├── useFeeCalculation.ts
 │    │     │     ├── useFeeCollection.ts
 │    │     │     └── useInstallmentManager.ts
 │    │     │
 │    │     ├── context/
 │    │     │     └── FeeCollectionContext.tsx
 │    │     │
 │    │     ├── types/
 │    │     │     ├── FeeTypes.ts
 │    │     │     └── InstallmentTypes.ts
 │    │     │
 │    │     └── utils/
 │    │           ├── fee.utils.ts
 │    │           └── number.utils.ts
 │    │
 │    ├── attendance/
 │    ├── transport/
 │    ├── students/
 │    ├── exams/
 │    ├── timetable/
 │    ├── library/
 │    └── staff/
 │
 ├── shared/
 │    ├── components/
 │    │     ├── Button/
 │    │     ├── Table/
 │    │     ├── Card/
 │    │     └── Form/
 │    ├── hooks/
 │    │     ├── useAuth.ts
 │    │     └── usePagination.ts
 │    ├── context/
 │    │     ├── AuthContext.tsx
 │    │     └── UIContext.tsx
 │    ├── services/
 │    │     ├── firebase.service.ts
 │    │     ├── student.service.ts
 │    │     ├── transport.service.ts
 │    │     ├── export.service.ts
 │    │     └── audit.service.ts
 │    ├── types/
 │    ├── utils/
 │    ├── validation/
 │    └── constants/
 │
 ├── store/       ← (GLOBAL STATE MANAGEMENT)
 │    ├── index.ts
 │    ├── useUIStore.ts         ← UI state (sidebar, theme)
 │    ├── useAuthStore.ts       ← login/session
 │    └── useGlobalSchoolStore.ts← school info
 │
 ├── assets/
 ├── styles/
 └── index.html
