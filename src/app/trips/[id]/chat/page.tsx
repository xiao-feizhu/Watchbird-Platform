'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { useApi } from '@/hooks/useApi'

interface ChatMessage {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    nickname: string
    avatar: string | null
  }
}

interface MessagesResponse {
  messages: ChatMessage[]
  hasMore: boolean
  nextCursor?: string
}

interface TripResponse {
  trip: {
    id: string
    title: string
    status: string
    chatGroupId?: string
  }
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString()

  if (isToday) return '今天'
  if (isYesterday) return '昨天'

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string

  const { data: tripData, execute: fetchTrip } = useApi<TripResponse>()
  const { data: messagesData, execute: fetchMessages } = useApi<MessagesResponse>()
  const { execute: sendMessage } = useApi<{ id: string }>()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const shouldScrollToBottom = useRef(true)

  const trip = tripData?.trip
  const chatGroupId = trip?.chatGroupId

  // Fetch trip data
  useEffect(() => {
    if (tripId) {
      fetchTrip(`/api/trips/${tripId}`)
    }
  }, [tripId, fetchTrip])

  // Fetch messages
  useEffect(() => {
    if (chatGroupId) {
      fetchMessages(`/api/chat/groups/${chatGroupId}/messages`)
    }
  }, [chatGroupId, fetchMessages])

  // Update messages state
  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages)
      setHasMore(messagesData.hasMore)
      setNextCursor(messagesData.nextCursor)

      // Scroll to bottom on initial load
      if (shouldScrollToBottom.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
        shouldScrollToBottom.current = false
      }
    }
  }, [messagesData])

  // Poll for new messages
  useEffect(() => {
    if (!chatGroupId) return

    const interval = setInterval(() => {
      fetchMessages(`/api/chat/groups/${chatGroupId}/messages`)
    }, 5000)

    return () => clearInterval(interval)
  }, [chatGroupId, fetchMessages])

  // Load more messages
  const handleLoadMore = useCallback(async () => {
    if (!chatGroupId || !nextCursor || isLoadingMore) return

    setIsLoadingMore(true)
    const container = messagesContainerRef.current
    const oldScrollHeight = container?.scrollHeight || 0

    try {
      const result = await fetchMessages(
        `/api/chat/groups/${chatGroupId}/messages?cursor=${nextCursor}`
      )

      if (result?.messages) {
        setMessages((prev) => [...result.messages, ...prev])
        setHasMore(result.hasMore)
        setNextCursor(result.nextCursor)

        // Restore scroll position
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - oldScrollHeight
          }
        }, 0)
      }
    } finally {
      setIsLoadingMore(false)
    }
  }, [chatGroupId, nextCursor, isLoadingMore, fetchMessages])

  // Send message
  const handleSend = useCallback(async () => {
    if (!chatGroupId || !newMessage.trim() || isSending) return

    setIsSending(true)
    setError(null)

    try {
      const result = await sendMessage(`/api/chat/groups/${chatGroupId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: newMessage.trim() }),
      })

      if (result?.id) {
        setNewMessage('')
        // Refresh messages
        fetchMessages(`/api/chat/groups/${chatGroupId}/messages`)
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } catch (err) {
      setError('发送失败，请重试')
    } finally {
      setIsSending(false)
    }
  }, [chatGroupId, newMessage, isSending, sendMessage, fetchMessages])

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, ChatMessage[]>)

  // Check if chat is disabled
  const isChatDisabled = trip?.status === 'CANCELLED' || trip?.status === 'COMPLETED'

  if (!trip && !tripData) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-gray-200 rounded" />
            <div className="h-96 bg-gray-200 rounded" />
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{trip?.title}</h1>
            <p className="text-sm text-gray-500">活动群聊</p>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex flex-col h-full overflow-hidden">
          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {/* Load more button */}
            {hasMore && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  loading={isLoadingMore}
                  disabled={isLoadingMore}
                >
                  加载更多消息
                </Button>
              </div>
            )}

            {/* Messages grouped by date */}
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-3">
                {/* Date separator */}
                <div className="flex items-center justify-center">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {formatMessageDate(dateMessages[0].createdAt)}
                  </span>
                </div>

                {/* Messages */}
                {dateMessages.map((message, index) => {
                  const showAvatar =
                    index === 0 ||
                    dateMessages[index - 1].sender.id !== message.sender.id

                  return (
                    <div key={message.id} className="flex gap-3">
                      {showAvatar ? (
                        <Avatar
                          src={message.sender.avatar || undefined}
                          fallback={message.sender.nickname}
                          size="sm"
                          className="flex-shrink-0 mt-1"
                        />
                      ) : (
                        <div className="w-8 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        {showAvatar && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {message.sender.nickname}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatMessageTime(message.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className="bg-gray-50 rounded-lg px-4 py-2 inline-block max-w-full">
                          <p className="text-gray-700 whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-gray-500">还没有消息，开始聊天吧！</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t p-4">
            {isChatDisabled ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  活动已{trip?.status === 'CANCELLED' ? '取消' : '完成'}，群聊已关闭
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入消息..."
                  rows={2}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
                  disabled={isSending}
                />
                <div className="flex flex-col justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSend}
                    loading={isSending}
                    disabled={isSending || !newMessage.trim()}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <p className="mt-2 text-xs text-gray-400">按 Enter 发送，Shift + Enter 换行</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
