export interface Message {
  id: string
  friendshipId: string
  senderId: string
  senderName: string
  senderPicture?: string
  content: string
  createdAt: string
}

export interface Participant {
  id: string
  username: string
  name: string
  picture?: string
}

export interface TypingEvent {
  type: string
  userId: string
  userName: string
  isTyping: boolean
}

export interface ChatState {
  messages: Message[]
  participant: Participant | null
  input: string
  connected: boolean
  sendLoading: boolean
  typingUsers: Set<string>
}
