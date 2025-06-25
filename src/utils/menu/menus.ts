export interface MenuItem {
  name: string;
  label: string;
  children?: MenuItem[];
}

export const adminMenus: MenuItem[] = [
  {
    name: 'AppointmentManagement',
    label: '预约管理',
    children: [
        {
            name: 'InitialVisitAppointmentApproval',
            label: '初访预约审核',
        },
        {
            name: 'InitialVisitAppointmentRecords',
            label: '初访预约记录',
        },
    ]
  },
  {
    name: 'questionnaireManagement',
    label: '问卷管理',
    children: [
        {
            name: 'QuestionList',
            label: '问题列表',
        },
        {
            name: 'QuestionnaireList',
            label: '问卷列表',
        },
    ]
  },
  {
    name: 'UserManagement',
    label: '用户管理',
  },
  {
    name: 'ConsultationManagement',
    label: '咨询管理',
    children: [
        {
            name: 'Statistics',
            label: '统计分析',
        },
    ]
  },
  {
    name: 'settings',
    label: '设置',
  },
]
