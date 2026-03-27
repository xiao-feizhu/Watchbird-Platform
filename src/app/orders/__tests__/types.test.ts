import { STATUS_LABELS, STATUS_VARIANTS, PAYMENT_STATUS_LABELS } from '../types'

describe('订单类型', () => {
  describe('STATUS_LABELS', () => {
    it('应该包含所有订单状态的中文标签', () => {
      expect(STATUS_LABELS.PENDING_PAYMENT).toBe('待付款')
      expect(STATUS_LABELS.PENDING_CONFIRM).toBe('待确认')
      expect(STATUS_LABELS.IN_PROGRESS).toBe('进行中')
      expect(STATUS_LABELS.PENDING_REVIEW).toBe('待评价')
      expect(STATUS_LABELS.COMPLETED).toBe('已完成')
      expect(STATUS_LABELS.CANCELLED).toBe('已取消')
    })
  })

  describe('STATUS_VARIANTS', () => {
    it('应该为每个状态定义正确的变体', () => {
      expect(STATUS_VARIANTS.PENDING_PAYMENT).toBe('warning')
      expect(STATUS_VARIANTS.COMPLETED).toBe('success')
      expect(STATUS_VARIANTS.CANCELLED).toBe('danger')
    })
  })

  describe('PAYMENT_STATUS_LABELS', () => {
    it('应该包含所有支付状态的中文标签', () => {
      expect(PAYMENT_STATUS_LABELS.UNPAID).toBe('未支付')
      expect(PAYMENT_STATUS_LABELS.PAID).toBe('已支付')
      expect(PAYMENT_STATUS_LABELS.REFUNDED).toBe('已退款')
    })
  })
})
