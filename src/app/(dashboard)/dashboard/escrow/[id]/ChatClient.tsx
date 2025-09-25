"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { Send, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/utils"
import { pusherClient } from "@/lib/pusher"
import { client } from "@/lib/client"
import { throwIfNotOk } from "@/lib/pass-error-helper"

interface ChatClientProps {
  conversationId: string
  initialMessages: any[]
  currentUserId: string
}

export function ChatClient({ conversationId, initialMessages, currentUserId }: ChatClientProps) {
  const queryClient = useQueryClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  // messages query
  const { data: messages = [] } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (!conversationId) return initialMessages
      
      const res = await client.conversation.getConversation.$get({ 
        conversationId
      })
      const data = await res.json()
      return data.conversation?.messages || []
    },
    initialData: initialMessages,
    enabled: !!conversationId,
  })

  // send message mutation - simplified without optimistic updates
  const sendMessage = useMutation({
    mutationFn: async (body: string) => {
      if (!conversationId) throw new Error("No conversation ID")
      
      const res = await client.conversation.sendMessage.$post({ 
        message: body, 
        conversationId
      })
      await throwIfNotOk(res)
      return await res.json()
    },
    onSuccess: () => {
      // Pusher will handle the real-time update, so we don't need to manually invalidate
      // This prevents the double message issue
    },
  })

  // scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // realtime updates with Pusher
  useEffect(() => {
    if (!conversationId) return

    pusherClient.subscribe(conversationId)

    const handleNewMessage = (newMessage: any) => {
      queryClient.setQueryData<any[]>(["conversation", conversationId], (old = []) => {
        // Avoid duplicates - check if message already exists
        if (old.find((m) => m.id === newMessage.id)) return old
        return [...old, newMessage]
      })
    }

    const handleUpdateMessage = (updatedMessage: any) => {
      queryClient.setQueryData<any[]>(["conversation", conversationId], (old = []) =>
        old.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
      )
    }

    const handleDeleteMessage = (deletedMessage: any) => {
      queryClient.setQueryData<any[]>(["conversation", conversationId], (old = []) =>
        old.filter((m) => m.id !== deletedMessage.id)
      )
    }

    // Bind to Pusher events
    pusherClient.bind("messages:new", handleNewMessage)
    pusherClient.bind("message:update", handleUpdateMessage)
    pusherClient.bind("message:deleted", handleDeleteMessage)

    return () => {
      pusherClient.unsubscribe(conversationId)
      pusherClient.unbind("messages:new", handleNewMessage)
      pusherClient.unbind("message:update", handleUpdateMessage)
      pusherClient.unbind("message:deleted", handleDeleteMessage)
    }
  }, [conversationId, queryClient])

  const [input, setInput] = useState("")

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !conversationId) return
    sendMessage.mutate(input.trim())
    setInput("")
  }

  if (!conversationId) {
    return (
      <Card className="flex flex-col h-[500px] border shadow-md items-center justify-center">
        <div className="text-muted-foreground text-center p-4">
          <p>Chat will be available once the escrow is accepted</p>
          <p className="text-sm">Both parties need to accept the escrow to start chatting</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((m: any) => {
            const isOwn = m.senderId === currentUserId
            return (
              <div key={m.id} className={cn("flex gap-2", isOwn && "justify-end")}>
                <div className="flex flex-col max-w-xs">
                  <div className="text-xs text-muted-foreground mb-1">
                    {m.sender?.name || "Unknown"} · {formatDistanceToNow(new Date(m.createdAt))} ago
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm",
                      isOwn
                        ? "bg-primary text-primary-foreground self-end"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {m.body}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t">
        <Button type="button" size="icon" variant="ghost">
          <ImageIcon className="w-5 h-5" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message..."
          disabled={sendMessage.isPending}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={sendMessage.isPending || !conversationId || !input.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}