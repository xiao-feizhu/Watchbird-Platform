import type { Metadata } from 'next'
import { MainLayout } from '@/components/layout/MainLayout'
import { Hero, FeaturedGuides, FeaturedServices, HowItWorks } from './(home)'

export const metadata: Metadata = {
  title: '观鸟平台 - 发现精彩观鸟之旅',
  description: '连接专业鸟导与观鸟爱好者，提供专业、可靠的观鸟服务预订平台。探索自然之美，记录每一次精彩的鸟类邂逅。',
  keywords: '观鸟, 鸟导, 自然观察, 鸟类摄影, 生态旅游, 户外活动',
  openGraph: {
    title: '观鸟平台 - 发现精彩观鸟之旅',
    description: '连接专业鸟导与观鸟爱好者，提供专业、可靠的观鸟服务预订平台。',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <FeaturedGuides />
      <FeaturedServices />
      <HowItWorks />
    </MainLayout>
  )
}
