import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/test',
      name: 'Test',
      component: () => import('@/views/Test.vue'),
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/admin',
      redirect: '/admin/initial-visit-appointment-approval',
      component: () => import('@/views/Layout.vue'),
      children: [
        {
          path: 'duty-hours-assignment',
          name: 'DutyHoursAssignment',
          component: () => import('@/views/admin/DutyHourAssignment.vue'),
        },
        {
          path: 'extra-consultation-approval',
          name: 'ExtraConsultationApproval',
          component: () => import('@/views/admin/ExtraConsultationApproval.vue'),
        },
        {
          path: 'initial-visit-appointment-approval',
          name: 'InitialVisitAppointmentApproval',
          component: () => import('@/views/admin/InitialVisitAppointmentApproval.vue'),
        },
        {
          path: 'initial-visit-appointment-records',
          name: 'InitialVisitAppointmentRecords',
          component: () => import('@/views/admin/InitialVisitAppointmentRecords.vue'),
        },
        {
          path: 'question-list',
          name: 'QuestionList',
          component: () => import('@/views/admin/QuestionList.vue'),
        },
        {
          path: 'schedule',
          name: 'Schedule',
          component: () => import('@/views/admin/Schedule.vue')
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('@/views/admin/Statistics.vue'),
        },
        {
          path: 'user-management',
          name: 'UserManagement',
          component: () => import('@/views/admin/UserManagement.vue'),
        },
        {
          path: 'admin-settings',
          name: 'AdminSettings',
          component: () => import('@/views/admin/Settings.vue'),
        },
      ]
    },
    {
      path: '/counselor',
      redirect: '/counselor/consultation-closure-report',
      component: () => import('@/views/Layout.vue'),
      children: [
        {
          path: 'consultation-closure-report',
          name: 'ConsultationClosureReport',
          component: () => import('@/views/counselor/ConsultationClosureReport.vue'),
        },
        {
          path: 'consultation-records',
          name: 'ConsultationRecords',
          component: () => import('@/views/counselor/ConsultationRecords.vue'),
        },
        {
          path: 'duty-hours',
          name: 'CounselorDutyHours',
          component: () => import('@/views/counselor/DutyHours.vue'),
        },
        {
          path: 'counselor-settings',
          name: 'CounselorSettings',
          component: () => import('@/views/counselor/Settings.vue'),
        },
      ]
    },
    {
      path: '/assistant',
      redirect: '/assistant/consultation-appointment-approval',
      component: () => import('@/views/Layout.vue'),
      children: [
        {
          path: 'consultation-appointment-approval',
          name: 'ConsultationAppointmentApproval',
          component: () => import('@/views/assistant/ConsultationAppointmentApproval.vue'),
        },
        {
          path: 'consultation-schedule-records',
          name: 'ConsultationScheduleRecords',
          component: () => import('@/views/assistant/ConsultationScheduleRecords.vue'),
        },
        {
          path: 'assistant-settings',
          name: 'AssistantSettings',
          component: () => import('@/views/assistant/Settings.vue'),
        },
      ]
    },
    {
      path: '/visitor',
      redirect: '/visitor/duty-hours',
      component: () => import('@/views/Layout.vue'),
      children: [
        {
          path: 'duty-hours',
          name: 'VisitorDutyHours',
          component: () => import('@/views/visitor/DutyHours.vue'),
        },
        {
          path: 'initial-visit-records',
          name: 'InitialVisitRecords',
          component: () => import('@/views/visitor/InitialVisitRecords.vue'),
        },
        {
          path: 'visitor-settings',
          name: 'VisitorSettings',
          component: () => import('@/views/visitor/Settings.vue'),
        },
      ]
    },
    {
      path: '/student',
      redirect: '/student/appointment-records',
      component: () => import('@/views/Layout.vue'),
      children: [
        {
          path: 'appointment-records',
          name: 'AppointmentRecords',
          component: () => import('@/views/student/AppointmentRecords.vue'),
        },
        {
          path: 'initial-visit-appointment',
          name: 'InitialVisitAppointment',
          component: () => import('@/views/student/InitialVisitAppointment.vue'),
        },
        {
          path: 'student-settings',
          name: 'StudentSettings',
          component: () => import('@/views/student/Settings.vue'),
        },
      ]
    },
  ]
})

// 登录拦截
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (to.path === '/test') {
    next()
    return
  }
  if (to.path !== '/login' && !user) {
    next('/login')
  } else if (to.path === '/login' && user) {
    next('/' + user.role)
  } else {
    next()
  }
})

export default router
