import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

describe('Badge 组件', () => {
  it('应该正确渲染默认变体', () => {
    render(<Badge>测试</Badge>)
    expect(screen.getByText('测试')).toBeInTheDocument()
  })

  it('应该正确渲染不同变体', () => {
    const { rerender } = render(<Badge variant="success">成功</Badge>)
    expect(screen.getByText('成功')).toBeInTheDocument()

    rerender(<Badge variant="warning">警告</Badge>)
    expect(screen.getByText('警告')).toBeInTheDocument()

    rerender(<Badge variant="danger">危险</Badge>)
    expect(screen.getByText('危险')).toBeInTheDocument()
  })
})

describe('Button 组件', () => {
  it('应该正确渲染按钮文本', () => {
    render(<Button>点击我</Button>)
    expect(screen.getByRole('button', { name: '点击我' })).toBeInTheDocument()
  })

  it('应该在 loading 时禁用按钮', () => {
    render(<Button loading>加载中</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
