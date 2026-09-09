# 🎓 Proyecto Final de Máster – TalentPulse

![Backend](https://img.shields.io/badge/Backend-Django_5_REST_Framework-092E20?style=for-the-badge&logo=django)
![Frontend](https://img.shields.io/badge/Frontend-React_18_Vite-61DAFB?style=for-the-badge&logo=react)
![DevOps](https://img.shields.io/badge/Deployment-Docker_%26_Render-2496ED?style=for-the-badge&logo=docker)

**Máster en Desarrollo Full Stack**  
**Conquer Blocks**  
**Alumna:** Iris Chacón Romero  

---

## 📌 Descripción del Proyecto

**TalentPulse** es una plataforma web Full Stack desarrollada como Trabajo Final de Máster. La aplicación aborda la gestión del rendimiento laboral, la evaluación 360° y el seguimiento de objetivos estratégicos (OKRs) en organizaciones.

---

## 📂 Estructura del Repositorio

```
PROYECTO FINAL MASTER/
├── backend/                  # API REST con Django 5 & Django REST Framework
│   ├── manage.py
│   ├── populate_db.py        # Script para poblar la BD con datos iniciales
│   ├── requirements.txt      # Dependencias Python
│   ├── authentication/       # Usuario CustomUser y sistema RBAC
│   ├── okrs/                 # Gestión de Objetivos y Key Results
│   ├── reviews/              # Evaluaciones 360° y Feedback
│   └── analytics/            # Endpoints de analítica consolidada
├── frontend/                 # Aplicación SPA en React con Vite
│   ├── package.json
│   ├── vite.config.js
│   └── src/                  # Componentes, Páginas, Contexto de Auth
├── docs/                     # Entregables Documentales Obligatorios
│   └── Memoria_Tecnica_PFM.md# Memoria técnica oficial del PFM
├── deployment/               # Archivos de Despliegue (Docker, Render)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── render.yaml
│   └── build.sh
├── README.md                 # Documentación del repositorio
└── .env.example              # Variables de entorno de muestra
```

---

## 🔑 Credenciales para la Evaluación Docente

El proyecto cuenta con un script de datos de prueba (`populate_db.py`) y botones de **acceso rápido de 1 clic** en la pantalla de inicio de sesión:

| Rol | Usuario | Contraseña | Perfil y Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador / CTO** | `admin` | `admin123` | Control total, analítica ejecutiva global y administración de usuarios. |
| **Manager / Supervisor** | `manager_marta` | `manager123` | Dashboard Ejecutivo, crear y aprobar Evaluaciones 360° y OKRs de equipo. |
| **Empleado** | `carlos_dev` | `empleado123` | Actualización interactiva de OKRs personales y envío de feedback. |

---

## 🚀 Instrucciones de Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/IrisChaConRomero/TalentPulse.git
cd TalentPulse

# 2. Iniciar el Backend Django
source backend/venv/bin/activate
cd backend
python manage.py migrate
python populate_db.py
python manage.py runserver

# 3. Iniciar el Frontend React (en otra terminal)
cd frontend
npm install
npm run dev
```

---

## 🧪 Ejecución de Tests Automatizados

```bash
cd backend
python manage.py test
```
*Resultado: 7/7 tests ejecutados con éxito.*
