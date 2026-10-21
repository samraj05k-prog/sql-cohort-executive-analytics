# B2B Revenue Engine & Cohort Retention Analytics Platform

An enterprise-grade executive analytics platform engineered with **MariaDB**, **FastAPI**, and **React**. Built to compute MoM revenue growth trajectories, customer spend quartiles (`DENSE_RANK`, `NTILE`), and cohort retention metrics.

## 📌 Architecture & Tech Stack
- **Database**: MariaDB / PostgreSQL (CTEs, Window Functions, Complex Joins)
- **Backend API**: Python FastAPI, `mysql-connector-python`, Uvicorn
- **Frontend Dashboard**: React, Recharts, Custom Glassmorphic Dark UI
- **BI Reporting**: Julius AI (Automated Executive Presentations)

## ⚡ Key SQL Analytics Engine Features
1. **Month-over-Month Growth**: Utilizes Common Table Expressions (`WITH`) and `LAG()` window functions to calculate revenue variance.
2. **RFM Account Segmentation**: Implements `DENSE_RANK()` and `NTILE(4)` to group accounts into 4 spend quartiles.

## 📂 Deliverables & Documentation
- Full application source code inside `/backend` and `/frontend`.
- Executive Slide Deck: Download [`docs/B2B_Revenue_Executive_Deck.pptx`](./docs/B2B_Revenue_Executive_Deck.pptx) generated via Julius AI.
