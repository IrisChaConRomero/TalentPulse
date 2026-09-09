import os
import json
import urllib.request
import urllib.error
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Avg, Count, Sum, Q
from authentication.models import CustomUser, Department
from okrs.models import OKRGoal, KeyResult, OKRStatusChoices
from reviews.models import PerformanceReview, Feedback


class DashboardAnalyticsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        total_users = CustomUser.objects.count()
        total_departments = Department.objects.count()
        total_budget = Department.objects.aggregate(Sum('budget'))['budget__sum'] or 0.0

        okrs_qs = OKRGoal.objects.all()
        if user.role == 'EMPLOYEE' and not user.is_superuser:
            okrs_qs = okrs_qs.filter(owner=user)

        total_okrs = okrs_qs.count()
        completed_okrs = okrs_qs.filter(status=OKRStatusChoices.COMPLETED).count()
        in_progress_okrs = okrs_qs.filter(status=OKRStatusChoices.IN_PROGRESS).count()
        at_risk_okrs = okrs_qs.filter(status=OKRStatusChoices.AT_RISK).count()

        avg_okr_progress = okrs_qs.aggregate(Avg('progress'))['progress__avg'] or 0.0

        reviews_qs = PerformanceReview.objects.all()
        avg_score = reviews_qs.aggregate(Avg('overall_score'))['overall_score__avg'] or 0.0

        department_stats = []
        for dept in Department.objects.annotate(member_count=Count('members')):
            dept_okrs = OKRGoal.objects.filter(department=dept)
            dept_avg_progress = dept_okrs.aggregate(Avg('progress'))['progress__avg'] or 0.0
            dept_at_risk = dept_okrs.filter(status=OKRStatusChoices.AT_RISK).count()
            department_stats.append({
                'id': dept.id,
                'name': dept.name,
                'description': dept.description,
                'budget': float(dept.budget),
                'member_count': dept.member_count,
                'avg_progress': round(dept_avg_progress, 1),
                'okr_count': dept_okrs.count(),
                'at_risk_count': dept_at_risk,
            })

        # Datos específicos del departamento del Manager (o del usuario actual)
        my_dept = user.department
        my_department_data = None
        if my_dept:
            dept_members = CustomUser.objects.filter(department=my_dept)
            dept_okrs_qs = OKRGoal.objects.filter(
                Q(department=my_dept) | Q(owner__department=my_dept)
            ).distinct()
            members_summary = []
            for member in dept_members:
                m_okrs = OKRGoal.objects.filter(owner=member)
                m_avg_prog = m_okrs.aggregate(Avg('progress'))['progress__avg'] or 0.0
                m_at_risk = m_okrs.filter(status=OKRStatusChoices.AT_RISK).count()
                m_reviews = PerformanceReview.objects.filter(evaluatee=member)
                m_score = m_reviews.aggregate(Avg('overall_score'))['overall_score__avg']
                members_summary.append({
                    'id': member.id,
                    'username': member.username,
                    'full_name': f"{member.first_name} {member.last_name}".strip() or member.username,
                    'role': member.role,
                    'role_display': member.get_role_display(),
                    'job_title': member.job_title,
                    'okr_count': m_okrs.count(),
                    'avg_progress': round(m_avg_prog, 1),
                    'at_risk_okrs': m_at_risk,
                    'avg_review_score': round(m_score, 2) if m_score else None,
                    'workload_status': 'Sobrecarga' if m_okrs.count() >= 4 else ('Atención' if m_at_risk > 0 else 'Óptimo')
                })

            my_department_data = {
                'id': my_dept.id,
                'name': my_dept.name,
                'description': my_dept.description,
                'budget': float(my_dept.budget),
                'member_count': dept_members.count(),
                'total_okrs': dept_okrs_qs.count(),
                'completed_okrs': dept_okrs_qs.filter(status=OKRStatusChoices.COMPLETED).count(),
                'in_progress_okrs': dept_okrs_qs.filter(status=OKRStatusChoices.IN_PROGRESS).count(),
                'at_risk_okrs': dept_okrs_qs.filter(status=OKRStatusChoices.AT_RISK).count(),
                'avg_progress': round(dept_okrs_qs.aggregate(Avg('progress'))['progress__avg'] or 0.0, 1),
                'members': members_summary,
            }

        # Auditoría reciente para el Administrador
        recent_audit = []
        for okr in OKRGoal.objects.select_related('owner', 'department').order_by('-updated_at')[:5]:
            recent_audit.append({
                'type': 'OKR',
                'title': okr.title,
                'actor': okr.owner.first_name or okr.owner.username,
                'department': okr.department.name if okr.department else 'General',
                'status': okr.get_status_display(),
                'progress': okr.progress,
                'timestamp': okr.updated_at,
            })

        role_scope = 'GLOBAL_ADMIN' if (user.role == 'ADMIN' or user.is_superuser) else (
            'DEPARTMENT_MANAGER' if user.role == 'MANAGER' else 'PERSONAL_EMPLOYEE'
        )

        return Response({
            'role_scope': role_scope,
            'overview': {
                'total_users': total_users,
                'total_departments': total_departments,
                'total_budget': float(total_budget),
                'total_okrs': total_okrs,
                'completed_okrs': completed_okrs,
                'in_progress_okrs': in_progress_okrs,
                'at_risk_okrs': at_risk_okrs,
                'avg_okr_progress': round(avg_okr_progress, 1),
                'avg_performance_score': round(avg_score, 2),
            },
            'departments': department_stats,
            'my_department': my_department_data,
            'recent_audit': recent_audit,
        })


class AIAssistantAPIView(APIView):
    """
    Motor Contextual de Asistencia para los 3 perfiles (ADMIN, MANAGER, EMPLOYEE)
    basado en métricas reales de la base de datos de TalentPulse.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Devuelve el diagnóstico inicial proactivo y consultas sugeridas según el rol del usuario."""
        user = request.user
        role = 'ADMIN' if (user.role == 'ADMIN' or user.is_superuser) else user.role
        context_summary, metrics = self._build_user_context(user, role)
        initial_insight = self._generate_contextual_response(user, role, "diagnostico_inicial", metrics)

        return Response({
            'role': role,
            'role_title': self._get_role_ai_title(role),
            'engine_mode': 'TalentPulse Contextual Engine (BD en Vivo)',
            'initial_insight': initial_insight,
            'suggested_prompts': self._get_suggested_prompts(role),
            'metrics_snapshot': metrics,
        })

    def post(self, request):
        user = request.user
        role = 'ADMIN' if (user.role == 'ADMIN' or user.is_superuser) else user.role
        prompt = (request.data.get('prompt') or '').strip()
        if not prompt:
            return Response({'error': 'Por favor escribe una consulta para el asistente.'}, status=status.HTTP_400_BAD_REQUEST)

        context_text, metrics = self._build_user_context(user, role)
        ai_reply = self._generate_contextual_response(user, role, prompt, metrics)

        return Response({
            'reply': ai_reply,
            'role': role,
            'engine_used': 'TalentPulse Contextual Engine (BD en Vivo)',
            'metrics_snapshot': metrics,
        })

    def _get_role_ai_title(self, role):
        if role == 'ADMIN':
            return 'Asistente IA de Estrategia Organizacional, Presupuesto y Prevención de Burnout Global'
        if role == 'MANAGER':
            return 'Coach IA de Liderazgo de Equipo, Desbloqueo de OKRs y Evaluaciones 360°'
        return 'Mentor IA Personal de Objetivos OKR, Productividad y Carrera'

    def _get_suggested_prompts(self, role):
        if role == 'ADMIN':
            return [
                'Analiza el rendimiento global por departamento y eficiencia presupuestaria',
                '¿Existe riesgo de burnout o cuellos de botella en la organización?',
                'Propón una estrategia ejecutiva para los OKRs en riesgo este trimestre',
                'Resumen ejecutivo de evaluaciones 360° y cultura organizacional'
            ]
        if role == 'MANAGER':
            return [
                '¿Qué OKRs o Key Results de mi equipo necesitan apoyo urgente?',
                'Dame un plan de coaching 1-a-1 para los miembros de mi departamento',
                '¿Cómo redistribuir la carga de trabajo en mi equipo para llegar al 100%?',
                'Consejos para redactar feedback constructivo 360° para mi equipo'
            ]
        return [
            '¿Cómo puedo avanzar más rápido en mis Key Results actuales?',
            'Ayúdame a priorizar mis tareas de esta semana según mis OKRs',
            '¿Cómo prepararme para destacar en mi próxima Evaluación 360°?',
            'Siento fatiga con mis objetivos, dame un plan de enfoque sin estrés'
        ]

    def _build_user_context(self, user, role):
        if role == 'ADMIN':
            depts = Department.objects.annotate(member_count=Count('members'))
            dept_lines = []
            for d in depts:
                d_okrs = OKRGoal.objects.filter(department=d)
                prog = round(d_okrs.aggregate(Avg('progress'))['progress__avg'] or 0.0, 1)
                risk = d_okrs.filter(status=OKRStatusChoices.AT_RISK).count()
                dept_lines.append({
                    'name': d.name,
                    'budget': float(d.budget),
                    'members': d.member_count,
                    'okrs': d_okrs.count(),
                    'avg_progress': prog,
                    'at_risk': risk
                })
            all_okrs = OKRGoal.objects.all()
            at_risk_list = [
                f"{o.title} ({o.progress}% - {o.owner.first_name or o.owner.username}, Dept: {o.department.name if o.department else 'N/A'})"
                for o in all_okrs.filter(Q(status=OKRStatusChoices.AT_RISK) | Q(progress__lt=50))[:5]
            ]
            metrics = {
                'scope': 'Organización Global',
                'total_users': CustomUser.objects.count(),
                'total_budget': float(Department.objects.aggregate(Sum('budget'))['budget__sum'] or 0),
                'avg_progress': round(all_okrs.aggregate(Avg('progress'))['progress__avg'] or 0.0, 1),
                'at_risk_count': all_okrs.filter(status=OKRStatusChoices.AT_RISK).count(),
                'departments': dept_lines,
                'lagging_okrs': at_risk_list,
            }
            return json.dumps(metrics, ensure_ascii=False), metrics

        elif role == 'MANAGER':
            dept = user.department
            dept_okrs = OKRGoal.objects.filter(
                Q(department=dept) | Q(owner__department=dept)
            ).distinct() if dept else OKRGoal.objects.all()
            members = CustomUser.objects.filter(department=dept) if dept else CustomUser.objects.all()

            member_details = []
            for m in members:
                m_okrs = OKRGoal.objects.filter(owner=m)
                m_prog = round(m_okrs.aggregate(Avg('progress'))['progress__avg'] or 0.0, 1)
                member_details.append({
                    'name': f"{m.first_name} {m.last_name}".strip() or m.username,
                    'job_title': m.job_title,
                    'okr_count': m_okrs.count(),
                    'avg_progress': m_prog,
                })

            kr_alerts = []
            for okr in dept_okrs.prefetch_related('key_results'):
                for kr in okr.key_results.all():
                    if kr.completion_percentage < 85:
                        kr_alerts.append({
                            'okr_title': okr.title,
                            'owner': okr.owner.first_name or okr.owner.username,
                            'kr_title': kr.title,
                            'current': kr.current_value,
                            'target': kr.target_value,
                            'unit': kr.unit,
                            'pct': round(kr.completion_percentage, 1)
                        })

            metrics = {
                'scope': f"Departamento: {dept.name if dept else 'General'}",
                'department_name': dept.name if dept else 'General',
                'team_size': members.count(),
                'avg_progress': round(dept_okrs.aggregate(Avg('progress'))['progress__avg'] or 0.0, 1),
                'at_risk_count': dept_okrs.filter(status=OKRStatusChoices.AT_RISK).count(),
                'members': member_details,
                'kr_alerts': kr_alerts,
            }
            return json.dumps(metrics, ensure_ascii=False), metrics

        else:
            my_okrs = OKRGoal.objects.filter(owner=user).prefetch_related('key_results')
            okr_list = []
            kr_focus = []
            for o in my_okrs:
                krs = []
                for kr in o.key_results.all():
                    pct = round(kr.completion_percentage, 1)
                    krs.append(f"{kr.title} ({kr.current_value}/{kr.target_value} {kr.unit} -> {pct}%)")
                    if pct < 100:
                        kr_focus.append({
                            'okr': o.title,
                            'kr': kr.title,
                            'current': kr.current_value,
                            'target': kr.target_value,
                            'unit': kr.unit,
                            'pct': pct
                        })
                okr_list.append({
                    'title': o.title,
                    'quarter': o.quarter,
                    'progress': o.progress,
                    'status': o.get_status_display(),
                    'krs': krs
                })

            last_review = PerformanceReview.objects.filter(evaluatee=user).order_by('-created_at').first()
            metrics = {
                'scope': f"Perfil Personal ({user.first_name or user.username})",
                'user_name': user.first_name or user.username,
                'job_title': user.job_title,
                'department': user.department.name if user.department else 'General',
                'okr_count': my_okrs.count(),
                'avg_progress': round(my_okrs.aggregate(Avg('progress'))['progress__avg'] or 0.0, 1),
                'okrs': okr_list,
                'kr_focus': kr_focus,
                'last_review_score': float(last_review.overall_score) if last_review else None,
                'review_improvement': last_review.areas_for_improvement if last_review else 'Documentación continua y visibilidad de logros.',
                'review_strengths': last_review.strengths if last_review else 'Compromiso técnico y colaboración.'
            }
            return json.dumps(metrics, ensure_ascii=False), metrics

    def _generate_contextual_response(self, user, role, prompt, metrics):
        q = prompt.lower()
        name = user.first_name or user.username

        if role == 'ADMIN':
            depts = metrics.get('departments', [])
            total_budget = metrics.get('total_budget', 0)
            avg_prog = metrics.get('avg_progress', 0)
            at_risk = metrics.get('at_risk_count', 0)
            dept_summary = "\n".join([
                f"- **{d['name']}**: {d['avg_progress']}% de avance | {d['members']} miembros | Presupuesto: €{d['budget']:,.0f} ({d['at_risk']} en riesgo)"
                for d in depts
            ])

            if 'burnout' in q or 'cuello' in q or 'estrés' in q or 'riesgo' in q:
                lagging = metrics.get('lagging_okrs', [])
                lag_str = "\n".join([f"  - ⚠️ {item}" for item in lagging]) if lagging else "  - ✅ Todos los objetivos superan el umbral crítico del 50%."
                return (
                    f"### 🛡️ Auditoría IA de Burnout Global y Cuellos de Botella\n\n"
                    f"Hola **{name}** (CTO / Admin). He analizado la carga de trabajo de los **{metrics.get('total_users')} usuarios** activos:\n\n"
                    f"1. **Estado de Riesgo Global:** Actualmente hay **{at_risk} OKRs en estado de riesgo** con un progreso global del **{avg_prog}%**.\n"
                    f"2. **Focos de Atención Detectados:**\n{lag_str}\n"
                    f"3. **Recomendación Ejecutiva Anti-Burnout:**\n"
                    f"   - Activar sesiones de **Pausa Activa y Mindfulness** en el *Wellness Hub* para los equipos con alta densidad de entregas técnicas.\n"
                    f"   - Reasignar recursos hacia departamentos con menor cobertura de OKRs antes del cierre trimestral."
                )

            if 'presupuesto' in q or 'departamento' in q or 'eficiencia' in q or 'diagnostico_inicial' in q:
                return (
                    f"### 📊 Diagnóstico Ejecutivo Organizacional (Rol: ADMIN / CTO)\n\n"
                    f"Bienvenido/a, **{name}**. Aquí tienes la radiografía en tiempo real de **TalentPulse**:\n\n"
                    f"- **Progreso Estratégico Global:** **{avg_prog}%** en toda la organización.\n"
                    f"- **Presupuesto Corporativo Total Asignado:** **€{total_budget:,.2f}** distribuido en {len(depts)} departamentos.\n\n"
                    f"#### Desglose Interdepartamental:\n{dept_summary}\n\n"
                    f"#### 💡 Recomendaciones Estratégicas de la IA:\n"
                    f"1. **Optimización de Recursos:** *Ingeniería & Software* concentra el mayor presupuesto y mantiene una tracción sólida; considera replicar su metodología de talleres en *Ventas & Marketing* y *RRHH*.\n"
                    f"2. **Configuración Admin:** Desde tu pestaña **Configuración Admin** puedes ajustar presupuestos, crear nuevos departamentos o promover líderes a *Manager*."
                )

            return (
                f"### 🧠 Informe Estratégico para Dirección ({name})\n\n"
                f"Respecto a tu consulta sobre **\"{prompt}\"**, los indicadores actuales muestran:\n\n"
                f"- **Avance Global OKR:** **{avg_prog}%** ({at_risk} objetivos en alerta).\n"
                f"- **Inversión Departamental Activa:** **€{total_budget:,.2f}**.\n\n"
                f"#### Departamentos Monitoreados:\n{dept_summary}\n\n"
                f"**Acción sugerida:** Convocar una revisión trimestral (QBR) con los Managers de departamento para alinear los Key Results pendientes con las evaluaciones 360° aprobadas."
            )

        elif role == 'MANAGER':
            dept_name = metrics.get('department_name', 'tu departamento')
            avg_prog = metrics.get('avg_progress', 0)
            members = metrics.get('members', [])
            kr_alerts = metrics.get('kr_alerts', [])

            members_md = "\n".join([
                f"- **{m['name']}** (*{m['job_title']}*): {m['okr_count']} OKR(s) activos — **{m['avg_progress']}%** de avance."
                for m in members
            ])
            alerts_md = "\n".join([
                f"- 🎯 **{a['kr_title']}** ({a['owner']}): `{a['current']}/{a['target']} {a['unit']}` (**{a['pct']}%** completado en *{a['okr_title']}*)"
                for a in kr_alerts[:4]
            ]) or "- ✅ ¡Excelente! Todos los Key Results del equipo superan el 85% de cumplimiento."

            if 'coaching' in q or '1-a-1' in q or 'feedback' in q:
                return (
                    f"### 🤝 Plan de Coaching 1-a-1 para {dept_name}\n\n"
                    f"Hola **{name}**. Para tus próximas sesiones 1-a-1 con tus **{metrics.get('team_size')} integrantes**, te sugiero este guion basado en sus datos reales:\n\n"
                    f"#### Estado Individual del Equipo:\n{members_md}\n\n"
                    f"#### Puntos Clave de Mentoría:\n"
                    f"1. **Reconocimiento Positivo:** Felicitar al equipo por mantener un promedio departamental del **{avg_prog}%**.\n"
                    f"2. **Desbloqueo Técnico:** Revisar juntos los Key Results que están al ~80-88% para cerrarlos esta semana:\n{alerts_md}\n"
                    f"3. **Bienestar del Equipo:** Recomienda una pausa de 5 minutos en la burbuja flotante **Wellness & Música** tras las entregas de mitad de sprint."
                )

            return (
                f"### 🎯 Asistente IA de Supervisión — {dept_name}\n\n"
                f"Hola **{name}** (*Manager*). He analizado el rendimiento en vivo de tu equipo en **{dept_name}**:\n\n"
                f"- **Avance Medio del Equipo:** **{avg_prog}%** ({metrics.get('at_risk_count', 0)} OKRs en riesgo).\n"
                f"- **Miembros Supervisados ({metrics.get('team_size')}):**\n{members_md}\n\n"
                f"#### 🔍 Key Results donde tu apoyo tendrá mayor impacto hoy:\n{alerts_md}\n\n"
                f"💡 **Siguiente paso recomendado:** Puedes asignar un nuevo OKR a cualquier miembro de tu equipo desde la pestaña *OKRs & Objetivos* o enviarles reconocimiento directo en *Feedback*."
            )

        else:
            avg_prog = metrics.get('avg_progress', 0)
            kr_focus = metrics.get('kr_focus', [])
            kr_md = "\n".join([
                f"- **{k['kr']}** (*{k['okr']}*): Estás en `{k['current']} / {k['target']} {k['unit']}` (**{k['pct']}%**). Te falta solo `{round(k['target'] - k['current'], 1)} {k['unit']}` para llegar al 100%."
                for k in kr_focus
            ]) or "- 🌟 ¡Tienes todos tus Key Results al 100%! Es un gran momento para proponer un nuevo objetivo de crecimiento."

            if 'fatiga' in q or 'estrés' in q or 'relaj' in q or 'pausa' in q:
                return (
                    f"### 🌿 Plan Personal de Enfoque sin Estrés para {name}\n\n"
                    f"Es totalmente normal sentir carga cuando gestionas objetivos exigentes como *{metrics.get('job_title')}*. Tu progreso actual ya es de un **{avg_prog}%**, ¡vas por muy buen camino!\n\n"
                    f"1. **Micro-paso para hoy:** Céntrate únicamente en avanzar un 5% en tu Key Result más cercano a completarse.\n"
                    f"2. **Regulación Fisiológica:** Abre la burbuja flotante **Wellness & Música** (abajo a la derecha) y realiza **3 ciclos de Respiración 4-7-8** escuchando *Ondas Alfa & Relajación Profunda*.\n"
                    f"3. **Comunicación:** Comparte tus avances parciales con tu Manager para recibir apoyo temprano."
                )

            if '360' in q or 'evaluación' in q or 'evaluacion' in q:
                score_txt = f"**{metrics['last_review_score']} / 5.0**" if metrics.get('last_review_score') else "Pendiente de cierre"
                return (
                    f"### 🏆 Preparación Inteligente para tu Evaluación 360°\n\n"
                    f"Hola **{name}**. Basándome en tu historial en **{metrics.get('department')}**:\n\n"
                    f"- **Última Puntuación 360°:** {score_txt}\n"
                    f"- **Tus Fortalezas Destacadas:** *{metrics.get('review_strengths')}*\n"
                    f"- **Área Clave de Mejora Detectada:** *{metrics.get('review_improvement')}*\n\n"
                    f"#### 🚀 Cómo brillar en este ciclo:\n"
                    f"1. Completa el tramo final de tus Key Results actuales:\n{kr_md}\n"
                    f"2. Pide feedback temprano a tus compañeros desde la pestaña **Feedback** demostrando proactividad en tu área de mejora."
                )

            return (
                f"### 🚀 Mentor IA de OKRs para {name} ({metrics.get('job_title')})\n\n"
                f"¡Hola **{name}**! He revisado tus **{metrics.get('okr_count')} objetivo(s)** activos en **{metrics.get('department')}** (Progreso medio: **{avg_prog}%**):\n\n"
                f"#### 🎯 Tus Key Results Prioritarios para subir al 100%:\n{kr_md}\n\n"
                f"#### 💡 Plan de Acción Recomendado:\n"
                f"1. **Foco Técnico (Bloques de 25 min):** Usa el temporizador Pomodoro de la burbuja flotante **Wellness & Música** para avanzar sin interrupciones en tu Key Result principal.\n"
                f"2. **Impacto 360°:** Recuerda documentar tus avances (*{metrics.get('review_improvement')}*) al actualizar el deslizador de tus Key Results."
            )


class AIOKRGeneratorAPIView(APIView):
    """
    Genera automáticamente una propuesta estructurada de OKR + 3 Key Results cuantificables
    a partir de una idea escrita por el usuario (Empleado, Manager o Admin).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        idea = (request.data.get('goal_idea') or '').strip()
        if not idea:
            return Response({'error': 'Escribe una idea o meta para generar el OKR.'}, status=status.HTTP_400_BAD_REQUEST)

        idea_lower = idea.lower()
        if any(w in idea_lower for w in ['seguridad', 'cloud', 'devops', 'servidor', 'infraestructura']):
            proposal = {
                'title': f"Fortalecer la Seguridad y Resiliencia Cloud: {idea[:60]}",
                'description': f"Objetivo generado por TalentPulse AI para garantizar alta disponibilidad, auditoría continua y mitigación de vulnerabilidades ({idea}).",
                'quarter': 'Q4-2026',
                'key_results': [
                    {'title': 'Reducir vulnerabilidades críticas en auditoría OWASP a 0', 'target_value': 100, 'unit': '% mitigado', 'weight': 1.5},
                    {'title': 'Alcanzar un SLA de disponibilidad de infraestructura del 99.9%', 'target_value': 99.9, 'unit': '% uptime', 'weight': 1.0},
                    {'title': 'Automatizar pipelines de seguridad CI/CD en repositorios clave', 'target_value': 5, 'unit': 'pipelines', 'weight': 1.0},
                ]
            }
        elif any(w in idea_lower for w in ['venta', 'marketing', 'cliente', 'ingreso', 'comercial', 'b2b']):
            proposal = {
                'title': f"Acelerar el Crecimiento Comercial y Conversión: {idea[:60]}",
                'description': f"Estrategia orientada a resultados medibles de adquisición, retención y satisfacción de clientes ({idea}).",
                'quarter': 'Q4-2026',
                'key_results': [
                    {'title': 'Incrementar la tasa de conversión de leads cualificados (MQL a SQL)', 'target_value': 35, 'unit': '%', 'weight': 1.5},
                    {'title': 'Cerrar nuevos acuerdos corporativos recurrentes en el trimestre', 'target_value': 12, 'unit': 'clientes', 'weight': 1.2},
                    {'title': 'Alcanzar un Net Promoter Score (NPS) de satisfacción comercial', 'target_value': 85, 'unit': 'puntos NPS', 'weight': 1.0},
                ]
            }
        elif any(w in idea_lower for w in ['clima', 'talento', 'rrhh', 'contratacion', 'burnout', 'equipo', 'onboarding']):
            proposal = {
                'title': f"Excelencia en Cultura, Bienestar y Talento: {idea[:60]}",
                'description': f"Iniciativa estratégica para potenciar el compromiso del equipo, reducir el estrés laboral y agilizar el onboarding ({idea}).",
                'quarter': 'Q4-2026',
                'key_results': [
                    {'title': 'Lograr participación activa del equipo en pausas de bienestar y feedback', 'target_value': 90, 'unit': '% adopción', 'weight': 1.2},
                    {'title': 'Reducir el tiempo medio de onboarding de nuevas incorporaciones', 'target_value': 14, 'unit': 'días', 'weight': 1.0},
                    {'title': 'Obtener una puntuación media de clima laboral en Evaluaciones 360°', 'target_value': 4.7, 'unit': 'puntos / 5', 'weight': 1.5},
                ]
            }
        else:
            proposal = {
                'title': f"Objetivo Estratégico: {idea[:75]}",
                'description': f"Objetivo estructurado bajo metodología SMART/OKR mediante TalentPulse AI para maximizar el impacto trimestral en: {idea}.",
                'quarter': 'Q4-2026',
                'key_results': [
                    {'title': f"Completar entregables clave de {idea[:35]} dentro del plazo", 'target_value': 100, 'unit': '%', 'weight': 1.5},
                    {'title': 'Superar el umbral de calidad y validación técnica/operativa', 'target_value': 95, 'unit': '% calidad', 'weight': 1.0},
                    {'title': 'Documentar mejores prácticas y realizar sesiones de transferencia al equipo', 'target_value': 3, 'unit': 'sesiones', 'weight': 1.0},
                ]
            }

        return Response(proposal)
