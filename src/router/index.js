import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import MapView from '@/views/MapView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import PriceSuggestionsView from '@/views/Collaborator/PriceSuggestionsView.vue'
import NewSuggestionView from '@/views/Collaborator/NewSuggestionView.vue'
import EditSuggestionView from '@/views/Collaborator/EditSuggestionView.vue'
import RequestCollaboratorView from '@/views/RequestCollaboratorView.vue'
import AdminPanelView from '@/views/AdminPanelView.vue'
import ManageCollaborationRequestsView from '@/views/ManageCollaborationRequestsView.vue'
import ManagePriceSuggestionsView from '@/views/ManagePriceSuggestionsView.vue'
import AdminEvaluatePriceSuggestionView from '@/views/AdminEvaluatePriceSuggestionView.vue'
import AdminEvaluateCollaborationRequestView from '@/views/AdminEvaluateCollaborationRequestView.vue'
import FuelStationView from '@/views/FuelStationView.vue'

const routes = [
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { public: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { public: true },
  },
  {
    path: '/reset-password/:token',
    name: 'reset-password',
    component: () => import('@/views/ResetPasswordView.vue'),
    meta: { public: true },
  },
  {
    path: '/map',
    name: 'map',
    component: MapView,
    meta: { requiresAuth: true, roles: [2, 3] }
  },
  {
    path: '/price-suggestions',
    name: 'priceSuggestions',
    component: PriceSuggestionsView,
    meta: { requiresAuth: true, roles: [3] }
  },
  {
    path: "/suggestions/new",
    name: "suggestion.new",
    component: NewSuggestionView,
    meta: { requiresAuth: true, roles: [3] }
  },
  {
    path: "/stations/:id",
    name: "stations",
    component: FuelStationView,
    meta: { requiresAuth: true, roles: [2, 3] }
  },
  {
    path: '/suggestions/:id/edit',
    name: 'editSuggestion',
    component: EditSuggestionView,
    meta: { requiresAuth: true, roles: [3] },
    props: true
  },
  {
    path: '/request-collaborator',
    name: 'requestCollaborator',
    component: RequestCollaboratorView,
    meta: { requiresAuth: true, roles: [2] }
  },
  {
    path: '/admin-panel',
    name: 'adminPanel',
    component: AdminPanelView,
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/manage-collaboration-requests',
    name: 'manageCollaborationRequests',
    component: ManageCollaborationRequestsView,
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/admin-evaluate-collaboration-request/:id',
    name: 'adminEvaluateCollaborationRequest',
    component: AdminEvaluateCollaborationRequestView,
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/manage-price-suggestions',
    name: 'managePriceSuggestions',
    component: ManagePriceSuggestionsView,
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/admin-evaluate-price-suggestion/:id',
    name: 'adminEvaluatePriceSuggestion',
    component: AdminEvaluatePriceSuggestionView,
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/',
    redirect: () => {
      const token = localStorage.getItem('token')
      if (!token) return '/login'

      const user = JSON.parse(localStorage.getItem('user') || '{}')

      if (user.role_id === 1) {
        return '/admin-panel'
      }

      if (user.role_id === 2 || user.role_id === 3) {
        return '/map'
      }

      return '/login'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  const isAuthenticated = !!token
  const requiresAuth = to.meta.requiresAuth
  const allowedRoles = to.meta.roles

  if (requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }

  if (requiresAuth && allowedRoles && !allowedRoles.includes(user.role_id)) {
    if (user.role_id === 1) return next('/admin-panel')
    if (user.role_id === 2 || user.role_id === 3) return next('/map')
    return next('/login')
  }

  if (to.name === 'login' && isAuthenticated) {
    if (user.role_id === 1) return next('/admin-panel')
    return next('/map')
  }

  next()
})

export default router
