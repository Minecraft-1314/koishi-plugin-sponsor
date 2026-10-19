import Sponsor from './sponsor.vue'

export default (ctx: any) => {
  ctx.page({
    path: '/sponsor',
    name: '赞助管理',
    desc: '维护赞助二维码与排行榜',
    icon: 'box-open',
    position: 'bottom',
    order: 610,
    authority: 4,
    component: Sponsor,
  })
}