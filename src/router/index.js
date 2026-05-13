import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Posts',
    component: () => import('../views/PostListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: () => import('../views/PostDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create',
    name: 'PostCreate',
    component: () => import('../views/PostCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/resources',
    name: 'ResourceList',
    component: () => import('../views/ResourceListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/resources/upload',
    name: 'ResourceUpload',
    component: () => import('../views/ResourceUploadView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/resources/:id',
    name: 'ResourceDetail',
    component: () => import('../views/ResourceDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/points',
    name: 'Points',
    component: () => import('../views/PointsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('../views/CollectionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-uploads',
    name: 'MyUploads',
    component: () => import('../views/MyUploadsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/NotificationView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/info',
    name: 'InfoList',
    component: () => import('../views/InfoListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/info/:id',
    name: 'InfoDetail',
    component: () => import('../views/InfoDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rooms',
    name: 'RoomLobby',
    component: () => import('../views/RoomLobbyView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/room/:id',
    name: 'RoomDetail',
    component: () => import('../views/RoomDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('../views/AdminPanelView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
  } else if (to.meta.guest && userStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
