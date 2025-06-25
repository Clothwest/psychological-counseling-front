import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/test',
      name: 'Test',
      component: () => import('@/views/Test.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/admin',
      component: () => import('@/views/Layout.vue'),
      children: [
        {
          path: '/initial-visit-appointment-approval',
          name: 'InitialVisitAppointmentApproval',
          component: () => import('@/views/admin/InitialVisitAppointmentApproval.vue')
        },
        {
          path: '/initial-visit-appointment-records',
          name: 'InitialVisitAppointmentRecords',
          component: () => import('@/views/admin/InitialVisitAppointmentRecords.vue')
        },
        {
          path: '/question-list',
          name: 'QuestionList',
          component: () => import('@/views/admin/QuestionList.vue')
        },
        {
          path: '/questionnaire-list',
          name: 'QuestionnaireList',
          component: () => import('@/views/admin/QuestionnaireList.vue')
        },
        {
          path: '/statistics',
          name: 'Statistics',
          component: () => import('@/views/admin/Statistics.vue')
        },
        {
          path: '/user-management',
          name: 'UserManagement',
          component: () => import('@/views/admin/UserManagement.vue')
        },
      ]
    }
  ],
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
