export interface MenuItem {
  path: string;
  label: string;
  children?: MenuItem[];
}

export const adminMenus: MenuItem[] = [
  {
    path: 'appointment-management',
    label: '预约管理',
    children: [
      {
        path: '/admin/initial-visit-appointment-approval',
        label: '初访预约审核',
      },
      {
        path: '/admin/initial-visit-appointment-records',
        label: '初访预约记录',
      },
    ]
  },
  {
    path: 'questionnaire-management',
    label: '问卷管理',
    children: [
      {
        path: '/admin/question-list',
        label: '问题列表',
      },
    ]
  },
  {
    path: '/admin/consultation-management',
    label: '咨询管理',
    children: [
      {
        path: 'extra-consultation-approval',
        label: '追加咨询审核',
      },
      {
        path: 'statistics',
        label: '统计分析',
      },
    ]
  },
  {
    path: 'duty-hours-management',
    label: '值班管理',
    children: [
      {
        path: 'duty-hours-assignment',
        label: '值班安排'
      },
      {
        path: 'schedule',
        label: '号源'
      }
    ]
  },
  {
    path: '/admin/user-management',
    label: '用户管理',
  },
  {
    path: '/admin/admin-settings',
    label: '设置',
  },
]

export const counselorMenus: MenuItem[] = [
  {
    path: 'consultation-management',
    label: '咨询管理',
    children: [
      {
        path: '/counselor/consultation-records',
        label: '咨询个案',
      },
      {
        path: '/counselor/consultation-closure-report',
        label: '咨询结案报告',
      },
    ]
  },
  {
    path: '/counselor/duty-hours',
    label: '值班时间',
  },
  {
    path: '/counselor/counselor-settings',
    label: '设置',
  },

]

export const assistantMenus: MenuItem[] = [
  {
    path: 'consultation-management',
    label: '咨询管理',
    children: [
      {
        path: '/assistant/consultation-appointment-approval',
        label: '咨询预约审核',
      },
      {
        path: '/assistant/consultation-schedule-records',
        label: '咨询安排记录',
      },
    ]
  },
  {
    path: '/assistant/assistant-settings',
    label: '设置',
  },
]

export const visitorMenus: MenuItem[] = [
  {
    path: 'initial-visit-records',
    label: '初访记录',
  },
  {
    path: '/visitor/duty-hours',
    label: '值班时间',
  },
  {
    path: '/visitor/visitor-settings',
    label: '设置',
  },
]

export const studentMenus: MenuItem[] = [
  {
    path: 'appointment-management',
    label: '预约管理',
    children: [
      {
        path: '/student/initial-visit-appointment',
        label: '初访预约',
      },
      {
        path: '/student/appointment-records',
        label: '预约记录',
      },
    ]
  },
  {
    path: '/student/student-settings',
    label: '设置',
  },
]
